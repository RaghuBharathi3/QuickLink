import { createClient } from '@/utils/supabase/server'

export type Plan = 'free' | 'pro'

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  status: string
  instamojo_payment_id?: string
  instamojo_payment_request_id?: string
  amount_paid?: number
  current_period_end?: string
  created_at: string
  updated_at: string
}

const FREE_PLAN_LIMIT = 5

/**
 * Fetch the subscription for a user. Returns a default free subscription if none exists.
 */
export async function getUserSubscription(userId: string): Promise<Subscription> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data) {
    // Return a default free subscription object if not found
    return {
      id: '',
      user_id: userId,
      plan: 'free',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  return data as Subscription
}

/**
 * Check if a user can create more QR codes based on their subscription plan.
 * Free: max 5, Pro: unlimited
 */
export async function canCreateQRCode(userId: string): Promise<{ allowed: boolean; limit: number; current: number; plan: Plan }> {
  const supabase = await createClient()

  const [subResult, countResult] = await Promise.all([
    supabase.from('subscriptions').select('plan').eq('user_id', userId).single(),
    supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  const { data: { user } } = await supabase.auth.getUser()
  
  // Fallback check against Supabase User Metadata if Postgres RLS is blocking the table
  const metaPlan = user?.user_metadata?.plan as Plan | undefined
  
  // Precedence: If JWT says PRO, they are PRO (bypasses obsolete DB row if RLS crashed update).
  // Otherwise, use DB payload.
  const plan: Plan = (metaPlan === 'pro') ? 'pro' : ((subResult.data?.plan as Plan) ?? 'free')
  
  const current = countResult.count ?? 0

  if (plan === 'pro') {
    return { allowed: true, limit: Infinity, current, plan }
  }

  return {
    allowed: current < FREE_PLAN_LIMIT,
    limit: FREE_PLAN_LIMIT,
    current,
    plan,
  }
}

export { FREE_PLAN_LIMIT }
