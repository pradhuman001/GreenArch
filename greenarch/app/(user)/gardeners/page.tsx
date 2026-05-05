'use client'

import { db } from '@/lib/firebase'
import { Gardener } from '@/types'
import { collection, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function UserGardenersPage() {
  const [gardeners, setGardeners] = useState<Gardener[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchGardeners = async () => {
      try {
        setLoading(true)
        setError('')

        const snapshot = await getDocs(collection(db, 'gardeners'))
        const gardenerList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Gardener, 'id'>),
        })) as Gardener[]

        setGardeners(gardenerList)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load gardeners.')
      } finally {
        setLoading(false)
      }
    }

    fetchGardeners()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">Gardeners Near You</h1>
          <p className="mt-2 text-lg text-slate-600">Browse trusted gardeners and book a service in minutes.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="mt-4 text-slate-600">Loading gardeners...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-sm">
            <p className="font-medium">Error loading gardeners</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : gardeners.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-800">No gardeners found</p>
            <p className="mt-2 text-sm text-slate-600">Check back soon for available service providers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {gardeners.map((gardener) => (
              <article
                key={gardener.id}
                className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-md transition hover:shadow-xl"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{gardener.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">{gardener.experienceYears} years experience</p>
                    </div>

                    {gardener.isVerified ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Unverified
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-lg">
                    {[...Array(5)].map((_, index) => (
                      <span key={index} className={index < Math.round(gardener.rating) ? 'text-yellow-400' : 'text-slate-300'}>
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm font-medium text-slate-700">{gardener.rating.toFixed(1)}</span>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-slate-700">Services</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {gardener.services.map((service) => (
                        <span
                          key={service}
                          className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rate</p>
                      <p className="mt-1 text-lg font-bold text-emerald-700">₹{gardener.ratePerHour}/hr</p>
                    </div>

                    <Link
                      href={`/gardeners/${gardener.id}`}
                      className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                      Book Now
                    </Link>
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
