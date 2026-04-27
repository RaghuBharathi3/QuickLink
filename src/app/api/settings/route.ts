import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const settingsSchema = z.object({
  display_name: z.string().max(50).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  email_notifications: z.boolean().optional(),
})

// GET /api/settings — fetch current user's settings
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    data ?? {
      display_name: '',
      theme: 'system',
      email_notifications: true,
    }
  )
}

// PATCH /api/settings — upsert current user's settings
export async function PATCH(request: Request) {
  const ip = getClientIp(request.headers as Headers)
  const rl = rateLimit(`settings:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const result = settingsSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 })
    }

    const { display_name, theme, email_notifications } = result.data

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          display_name: display_name ?? '',
          theme: theme ?? 'system',
          email_notifications: email_notifications ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
