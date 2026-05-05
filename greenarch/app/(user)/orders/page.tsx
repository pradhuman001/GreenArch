'use client'

import { getOrdersByUser } from '@/lib/db/orders'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatPrice } from '@/lib/utils/formatPrice'
import { formatDate } from '@/lib/utils/formatDate'
import { Order } from '@/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) {
        setOrders([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const snapshot = await getOrdersByUser(user.uid)
        const userOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Order, 'id'>),
        })) as Order[]

        userOrders.sort((a, b) => {
          const aTime = typeof a.createdAt?.toDate === 'function' ? a.createdAt.toDate().getTime() : 0
          const bTime = typeof b.createdAt?.toDate === 'function' ? b.createdAt.toDate().getTime() : 0
          return bTime - aTime
        })

        setOrders(userOrders)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user?.uid])

  const getStatusClasses = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-700'
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-700'
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
            <p className="mt-2 text-sm text-slate-600">Track your recent purchases and payment details.</p>
          </div>
          <Link
            href="/nurseries"
            className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            Continue Shopping
          </Link>
        </div>

        {authLoading || loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-white py-20 shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="mt-4 text-slate-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-sm">
            <p className="font-medium">Error loading orders</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-emerald-100 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-800">Sign in to view your orders</p>
            <p className="mt-2 text-sm text-slate-600">Your order history is available after login.</p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Login
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-800">No orders found</p>
            <p className="mt-2 text-sm text-slate-600">Start shopping from nearby nurseries to see your order history here.</p>
            <Link
              href="/nurseries"
              className="mt-6 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Browse Nurseries
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">Order #{order.id.slice(0, 8)}</h2>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">Order date: {formatDate(order.createdAt.toDate())}</p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Items</p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        {order.items.map((item) => (
                          <li key={item.productId} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-medium text-slate-800">{item.name}</span>
                            <span>× {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4 md:min-w-52">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Total</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-700">{formatPrice(order.pricing.total)}</p>
                    <p className="mt-3 text-sm text-slate-600">
                      Payment: <span className="font-medium text-slate-800">{order.payment.method === 'cod' ? 'COD' : 'Razorpay'}</span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
