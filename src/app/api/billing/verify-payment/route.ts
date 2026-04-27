import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  // Rate limit: 5 payment verifications per minute per IP
  const ip = getClientIp(req.headers as Headers);
  const rl = rateLimit(`verify:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  // Check authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = verifyPaymentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = result.data;
    const userId = user.id;

    const signatureBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(signatureBody.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Use service role client for database updates
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { cookies: { getAll() { return [] }, setAll() {} } }
      );

      // Extend access by 30 days
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);

      const subData = {
        user_id: userId,
        plan: 'pro',
        status: 'active',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount_paid: 2900,
        current_period_end: expireDate.toISOString(),
      };

      const { error: dbError } = await supabaseAdmin.from('subscriptions').upsert(subData, { onConflict: 'user_id' });
      
      // Update JWT metadata
      const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { plan: 'pro' }
      });

      if (dbError || metaError) {
        console.error('Payment DB update error:', dbError, metaError);
        return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
  } catch (error: any) {
    console.error('Payment Verification error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
