import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { UAParser } from 'ua-parser-js'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Known bot User-Agent patterns
const BOT_PATTERNS = [
  /bot/i, /spider/i, /crawl/i, /slurp/i, /curl/i,
  /wget/i, /python-requests/i, /httpx/i, /go-http/i,
  /facebookexternalhit/i, /whatsapp/i, /telegram/i,
  /twitterbot/i, /linkedinbot/i, /slackbot/i,
]

function isBot(userAgent: string): boolean {
  if (!userAgent) return false
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent))
}

function getDeviceType(ua: UAParser): string {
  const device = ua.getDevice()
  if (!device.type) return 'desktop'
  if (device.type === 'mobile') return 'mobile'
  if (device.type === 'tablet') return 'tablet'
  return 'desktop'
}

async function getCountryFromHeaders(headers: Headers, ip: string): Promise<string> {
  // Cloudflare provides country header for free
  const cfCountry = headers.get('cf-ipcountry')
  if (cfCountry && cfCountry !== 'XX') return cfCountry

  // Vercel also provides geo headers
  const vercelCountry = headers.get('x-vercel-ip-country')
  if (vercelCountry) return vercelCountry

  return 'Unknown'
}

export async function GET(
  request: Request,
  props: { params: Promise<{ shortId: string }> }
) {
  const params = await props.params
  const shortId = params.shortId

  // Rate limit scan requests per IP: 30/min (anti-abuse)
  const ip = getClientIp(request.headers as Headers)
  const rl = rateLimit(`scan:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.success) {
    return new NextResponse(null, {
      status: 302,
      headers: { Location: '/qr-error?reason=rate_limited' },
    })
  }

  const supabase = await createClient()

  // Find QR code
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('short_id', shortId)
    .single()

  if (error || !data) {
    return NextResponse.redirect(
      new URL(`/qr-error?reason=not_found`, request.url),
      { status: 302 }
    )
  }

  if (!data.is_active) {
    return NextResponse.redirect(
      new URL(`/qr-error?reason=inactive`, request.url),
      { status: 302 }
    )
  }

  // Check scheduling
  const now = new Date()
  if (data.active_from && new Date(data.active_from) > now) {
    return NextResponse.redirect(
      new URL(`/qr-error?reason=not_started`, request.url),
      { status: 302 }
    )
  }

  if (data.expires_at && new Date(data.expires_at) < now) {
    return NextResponse.redirect(
      new URL(`/qr-error?reason=expired`, request.url),
      { status: 302 }
    )
  }

  // Check password protection
  if (data.password_hash) {
    return NextResponse.redirect(
      new URL(`/qr/${shortId}/protected`, request.url),
      { status: 302 }
    )
  }

  // Parse User-Agent for analytics
  const userAgentStr = request.headers.get('user-agent') || ''
  const uaParser = new UAParser(userAgentStr)
  const botScan = isBot(userAgentStr)
  const country = await getCountryFromHeaders(request.headers as Headers, ip)

  // Log scan async (fire and forget — don't block redirect)
  Promise.resolve().then(async () => {
    try {
      await supabase.from('qr_scans').insert({
        qr_code_id: data.id,
        ip_address: ip,
        country,
        device_type: getDeviceType(uaParser),
        browser: uaParser.getBrowser().name || 'Unknown',
        os: uaParser.getOS().name || 'Unknown',
        is_bot: botScan,
        referrer: request.headers.get('referer') || null,
      })

      // Increment scan_count (even for bots — total count)
      await supabase
        .from('qr_codes')
        .update({ scan_count: (data.scan_count || 0) + 1 })
        .eq('id', data.id)
    } catch (e) {
      console.error('Failed to log scan:', e)
    }
  })

  return NextResponse.redirect(data.original_url, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'CDN-Cache-Control': 'no-store',
    },
  })
}
