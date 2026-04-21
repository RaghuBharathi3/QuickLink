import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { canCreateQRCode } from '@/lib/subscription'
import { validateUrl } from '@/lib/url-validator'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const planStatus = await canCreateQRCode(user.id)

  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ codes: data || [], planInfo: planStatus })
}

export async function POST(request: Request) {
  // Rate limit: 10 QR creations per minute per IP
  const ip = getClientIp(request.headers as Headers)
  const rl = rateLimit(`create:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { original_url, title, fg_color, bg_color, style_type, active_from, expires_at } = body

    // Validate destination URL
    const urlCheck = validateUrl(original_url)
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.reason }, { status: 400 })
    }

    // Check subscription plan limits
    const planCheck = await canCreateQRCode(user.id)
    if (!planCheck.allowed) {
      return NextResponse.json({
        error: `Free plan limit reached (${planCheck.limit} QR codes). Upgrade to Pro for unlimited codes.`,
        code: 'PLAN_LIMIT_REACHED',
        plan: planCheck.plan,
        limit: planCheck.limit,
        current: planCheck.current,
      }, { status: 403 })
    }

    // Generate a unique 8-character short ID
    const short_id = crypto.randomBytes(4).toString('hex')

    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.id,
        short_id,
        original_url,
        title: title || null,
        fg_color: fg_color || '#000000',
        bg_color: bg_color || '#FFFFFF',
        style_type: style_type || 'square',
        active_from: active_from || null,
        expires_at: expires_at || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
