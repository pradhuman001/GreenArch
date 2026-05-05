import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  const { amount, currency = 'INR' } = await req.json()
  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
    })
    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    console.error('Razorpay error:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}