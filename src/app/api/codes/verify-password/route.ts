import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const verifyPasswordSchema = z.object({
  short_id: z.string().min(1),
  password: z.string(),
})

export async function POST(request: Request) {
  // Strict rate limit: 5 attempts per minute per IP for password verification
  const ip = getClientIp(request.headers as Headers)
  const rl = rateLimit(`pwd:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const result = verifyPasswordSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { short_id, password } = result.data

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
