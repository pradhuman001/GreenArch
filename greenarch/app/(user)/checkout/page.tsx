'use client'

import { useCartStore } from '@/lib/store/cartStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { createOrder } from '@/lib/db/orders'
import { formatPrice } from '@/lib/utils/formatPrice'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void
    }
  }
}

type PaymentMethod = 'razorpay' | 'cod'

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    if (window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true })
      existingScript.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const items = useCartStore((state) => state.items)
  const nurseryId = useCartStore((state) => state.nurseryId)
  const nurseryName = useCartStore((state) => state.nurseryName)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [stateName, setStateName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFullName((current) => current || user.name || '')
      setPhone((current) => current || user.phone || '')
    }
  }, [user])

  const totalPrice = getTotalPrice()

  const buildOrderPayload = (payment: {
    method: 'cod' | 'razorpay'
    status: 'pending' | 'paid' | 'failed'
    razorpayOrderId?: string
    razorpayPaymentId?: string
  }) => {
    if (!user || !nurseryId) {
      throw new Error('Cart or user details are missing.')
    }

    return {
      userId: user.uid,
      nurseryId,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      deliveryAddress: {
        id: 'delivery-address',
        label: 'Delivery Address',
        line1: addressLine1,
        line2: '',
        city,
        pincode,
        state: stateName,
      },
      pricing: {
        subtotal: totalPrice,
        deliveryFee: 0,
        discount: 0,
        total: totalPrice,
      },
      payment,
    }
  }

  const validateForm = () => {
    if (!user) return 'Please login to continue checkout.'
    if (!nurseryId || !nurseryName) return 'Your cart is empty.'
    if (!fullName || !phone || !addressLine1 || !city || !pincode || !stateName) return 'Please fill in all delivery details.'
    if (items.length === 0) return 'Your cart is empty.'
    return ''
  }

  const handlePlaceOrder = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)

    try {
      if (paymentMethod === 'cod') {
        await createOrder({
          ...buildOrderPayload({ method: 'cod', status: 'pending' }),
          status: 'placed',
        })

        clearCart()
        router.push('/orders')
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        throw new Error('Failed to load Razorpay checkout.')
      }

      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(totalPrice * 100), currency: 'INR' }),
      })

      if (!response.ok) {
        throw new Error('Unable to create Razorpay order.')
      }

      const data = (await response.json()) as { orderId?: string }
      const razorpayOrderId = data.orderId

      if (!razorpayOrderId) {
        throw new Error('Razorpay order ID missing.')
      }

      const RazorpayCheckout = window.Razorpay
      if (!RazorpayCheckout) {
        throw new Error('Razorpay is unavailable.')
      }

      const razorpay = new RazorpayCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        name: 'GreenArch',
        description: nurseryName || 'GreenArch order',
        order_id: razorpayOrderId,
        handler: async (responseData: { razorpay_payment_id?: string }) => {
          await createOrder({
            ...buildOrderPayload({
              method: 'razorpay',
              status: 'paid',
              razorpayOrderId,
              razorpayPaymentId: responseData.razorpay_payment_id,
            }),
            status: 'placed',
          })

          clearCart()
          router.push('/orders')
        },
        prefill: {
          name: fullName,
          contact: phone,
        },
        theme: {
          color: '#059669',
        },
      })

      razorpay.open()
    } catch (placeOrderError) {
      setError(placeOrderError instanceof Error ? placeOrderError.message : 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <Link href="/cart" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            Back to Cart
          </Link>
        </div>

        {authLoading ? (
          <div className="rounded-2xl border border-emerald-100 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-slate-600">Loading account details...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-800">Your cart is empty</p>
            <p className="mt-2 text-sm text-slate-600">Add products from nurseries before checking out.</p>
            <Link
              href="/nurseries"
              className="mt-6 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Browse Nurseries
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Order Summary</h2>
                <div className="mt-5 space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">{formatPrice(item.price)} each</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-medium text-slate-700">Total</span>
                  <span className="text-lg font-bold text-emerald-700">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Delivery Address</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Full name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="addressLine1">Address line 1</label>
                    <input
                      id="addressLine1"
                      value={addressLine1}
                      onChange={(event) => setAddressLine1(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="House no., street, area"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="city">City</label>
                    <input
                      id="city"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="pincode">Pincode</label>
                    <input
                      id="pincode"
                      value={pincode}
                      onChange={(event) => setPincode(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Pincode"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="stateName">State</label>
                    <input
                      id="stateName"
                      value={stateName}
                      onChange={(event) => setStateName(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="State"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Payment Method</h2>
                <div className="mt-5 space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-emerald-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                    />
                    <div>
                      <p className="font-medium text-slate-900">UPI / Card (Razorpay)</p>
                      <p className="text-sm text-slate-600">Pay securely using UPI, debit card, or credit card.</p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-emerald-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div>
                      <p className="font-medium text-slate-900">Cash on Delivery</p>
                      <p className="text-sm text-slate-600">Pay when your order is delivered.</p>
                    </div>
                  </label>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </section>

            <aside className="h-fit rounded-2xl border border-emerald-100 bg-white p-6 shadow-md">
              <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Nursery</span>
                  <span className="font-medium text-right">{nurseryName || '-'}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
                  <span className="font-medium text-slate-900">Total</span>
                  <span className="font-bold text-emerald-700">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
