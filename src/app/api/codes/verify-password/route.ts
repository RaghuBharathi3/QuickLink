import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { short_id, password } = await request.json()

    if (!short_id || !password) {
      return NextResponse.json({ error: 'Missing short_id or password' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('qr_codes')
      .select('password_hash, original_url, is_active, expires_at, active_from')
      .eq('short_id', short_id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    if (!data.is_active) {
      return NextResponse.json({ error: 'QR code is inactive' }, { status: 403 })
    }

    // Check scheduling
    const now = new Date()
    if (data.expires_at && new Date(data.expires_at) < now) {
      return NextResponse.json({ error: 'QR code has expired' }, { status: 410 })
    }

    if (!data.password_hash) {
      // No password set — just redirect
      return NextResponse.json({ redirect_url: data.original_url })
    }

    const isValid = await bcrypt.compare(password, data.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    return NextResponse.json({ redirect_url: data.original_url })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
