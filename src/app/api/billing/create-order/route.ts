import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    
    const options = {
      amount: amount * 100, // Converts completely into properly formatted paise
      currency: 'INR',
      receipt: `rcpt_${Math.random().toString(36).substring(7)}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id, amount: options.amount });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
