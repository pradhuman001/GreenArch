'use client'

import Link from 'next/link'

import useCartStore from '@/lib/store/cartStore'
import { formatPrice } from '@/lib/utils/formatPrice'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
          <Link
            href="/nurseries"
            className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-800">Your cart is empty</p>
            <p className="mt-2 text-sm text-slate-600">Add plants and gardening essentials from nearby nurseries.</p>
            <Link
              href="/nurseries"
              className="mt-6 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Browse Nurseries
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.productId}
                  className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">Price: {formatPrice(item.price)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-3 py-2 text-lg font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          -
                        </button>
                        <span className="min-w-10 px-3 text-center text-sm font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, Math.min(item.quantity + 1, item.maxQuantity))}
                          className="px-3 py-2 text-lg font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4 text-right">
                    <p className="text-sm text-slate-500">Item subtotal</p>
                    <p className="text-lg font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </article>
              ))}
            </div>

            <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">Cart Summary</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Total items</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span>Total price</span>
                  <span className="font-bold text-emerald-700">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
              >
                Proceed to Checkout
              </Link>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
