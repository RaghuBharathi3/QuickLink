import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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
    // PGRST116 = row not found — that's fine for first-time users
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return data or defaults
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
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { display_name, theme, email_notifications } = body

  // Validate theme value
  const validThemes = ['light', 'dark', 'system']
  if (theme && !validThemes.includes(theme)) {
    return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
  }

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
}
