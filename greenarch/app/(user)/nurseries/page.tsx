'use client'

import { getAllNurseries } from '@/lib/db/nurseries'
import { Nursery } from '@/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function UserNurseriesPage() {
  const [nurseries, setNurseries] = useState<Nursery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        setLoading(true)
        const data = await getAllNurseries()
        setNurseries(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch nurseries')
      } finally {
        setLoading(false)
      }
    }

    fetchNurseries()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Nurseries Near You</h1>
          <p className="mt-2 text-lg text-slate-600">Discover plants and gardening supplies from trusted local nurseries</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="mt-4 text-slate-600">Loading nurseries...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
            <p className="font-medium">Error loading nurseries</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : nurseries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-16">
            <div className="text-4xl">🌱</div>
            <p className="mt-4 text-lg font-medium text-slate-700">No nurseries found</p>
            <p className="mt-1 text-sm text-slate-600">Check back soon for nurseries in your area</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nurseries.map((nursery) => (
              <Link
                key={nursery.id}
                href={`/nurseries/${nursery.id}`}
                className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-md transition hover:shadow-xl cursor-pointer"
              >
                {nursery.images && nursery.images.length > 0 ? (
                  <div className="aspect-video w-full overflow-hidden bg-slate-200">
                    <img
                      src={nursery.images[0]}
                      alt={nursery.name}
                      className="h-full w-full object-cover transition hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-emerald-100 to-lime-100" />
                )}

                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">{nursery.name}</h3>
                    <div
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        nursery.isOpen
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {nursery.isOpen ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">
                    📍 {nursery.address.city}, {nursery.address.state}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < Math.round(nursery.rating)
                                ? 'text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{nursery.rating.toFixed(1)}</span>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-lime-50 px-3 py-1 text-xs font-medium text-lime-700">
                      🚚 {nursery.deliveryRadiusKm}km
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
