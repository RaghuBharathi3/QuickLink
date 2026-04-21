import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const id = params.id
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: qr, error: qrError } = await supabase
    .from('qr_codes')
    .select('id, title, short_id, scan_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (qrError || !qr) {
    return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
  }

  const since = new Date()
  since.setDate(since.getDate() - days)

  // Fetch all scans in the window
  const { data: scans, error: scansError } = await supabase
    .from('qr_scans')
    .select('*')
    .eq('qr_code_id', id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (scansError) {
    return NextResponse.json({ error: scansError.message }, { status: 500 })
  }

  const allScans = scans || []

  // --- Time series (daily buckets) ---
  const timeSeriesMap = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const key = d.toISOString().slice(0, 10)
    timeSeriesMap.set(key, 0)
  }
  allScans.forEach((scan) => {
    const key = scan.created_at.slice(0, 10)
    if (timeSeriesMap.has(key)) {
      timeSeriesMap.set(key, (timeSeriesMap.get(key) || 0) + 1)
    }
  })
  const timeSeries = Array.from(timeSeriesMap.entries()).map(([date, count]) => ({ date, count }))

  // --- Device breakdown ---
  const deviceMap = new Map<string, number>()
  const browserMap = new Map<string, number>()
  const countryMap = new Map<string, number>()

  const humanScans = allScans.filter((s) => !s.is_bot)

  humanScans.forEach((scan) => {
    const device = scan.device_type || 'unknown'
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1)

    const browser = scan.browser || 'Unknown'
    browserMap.set(browser, (browserMap.get(browser) || 0) + 1)

    const country = scan.country || 'Unknown'
    countryMap.set(country, (countryMap.get(country) || 0) + 1)
  })

  const devices = Array.from(deviceMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const browsers = Array.from(browserMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const countries = Array.from(countryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return NextResponse.json({
    qr,
    period: { days, since: since.toISOString() },
    summary: {
      total_scans: allScans.length,
      human_scans: humanScans.length,
      bot_scans: allScans.length - humanScans.length,
    },
    timeSeries,
    devices,
    browsers,
    countries,
  })
}
