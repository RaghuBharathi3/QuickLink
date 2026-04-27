import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const createOrderSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1').max(100000, 'Amount too high'),
});

export async function POST(req: Request) {
  // Rate limit: 5 order creations per minute per IP
  const ip = getClientIp(req.headers as Headers);
  const rl = rateLimit(`order:${ip}`, { limit: 5, windowMs: 60_000 });
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
    const result = createOrderSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 });
    }

    const { amount } = result.data;
    
    const options = {
      amount: amount * 100, // Converts completely into properly formatted paise
      currency: 'INR',
      receipt: `rcpt_${user.id.substring(0, 10)}_${Math.random().toString(36).substring(7)}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ 
      orderId: order.id, 
      amount: options.amount,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID 
    });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
