'use client'

import { getNursery } from '@/lib/db/nurseries'
import { getProductsByNursery } from '@/lib/db/products'
import { useCartStore } from '@/lib/store/cartStore'
import { Nursery, Product } from '@/types'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NurseryDetailPage() {
  const params = useParams()
  const nurseryId = Array.isArray(params?.nurseryId) ? params.nurseryId[0] : params?.nurseryId

  const [nursery, setNursery] = useState<Nursery | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedProductId, setAddedProductId] = useState<string | null>(null)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchNurseryDetails = async () => {
      if (!nurseryId) {
        setError('Nursery ID is missing.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [nurseryData, productsData] = await Promise.all([
          getNursery(nurseryId),
          getProductsByNursery(nurseryId),
        ])

        setNursery(nurseryData)
        setProducts(productsData)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load nursery details.')
      } finally {
        setLoading(false)
      }
    }

    fetchNurseryDetails()
  }, [nurseryId])

  const handleAddToCart = (product: Product) => {
    if (!nurseryId || !nursery) {
      return
    }

    addItem(
      {
        productId: product.id,
        name: product.name,
        image: product.images?.[0] ?? '',
        price: product.price,
        quantity: 1,
        maxQuantity: product.stock,
      },
      nurseryId,
      nursery.name
    )

    setAddedProductId(product.id)
    window.setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current))
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/nurseries"
            className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            ← Back to Nurseries
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="mt-4 text-slate-600">Loading nursery details...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
            <p className="font-medium">Error loading nursery</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : nursery ? (
          <div className="space-y-10">
            <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-md">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-8 sm:p-10">
                  <div className="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100">
                    {nursery.isOpen ? 'Open' : 'Closed'}
                  </div>

                  <h1 className="text-4xl font-bold text-slate-900">{nursery.name}</h1>

                  {nursery.description ? (
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{nursery.description}</p>
                  ) : null}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Address</p>
                      <p className="mt-2 text-sm text-slate-700">
                        {nursery.address.line1}, {nursery.address.city}, {nursery.address.state} - {nursery.address.pincode}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-lime-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-700">Contact</p>
                      <p className="mt-2 text-sm text-slate-700">{nursery.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-lime-600 p-8 text-white lg:border-l lg:border-t-0 sm:p-10">
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-50/90">Nursery Details</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex items-center gap-1 text-lg">
                          {[...Array(5)].map((_, index) => (
                            <span key={index} className={index < Math.round(nursery.rating) ? 'text-yellow-300' : 'text-white/30'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-emerald-50">
                          {nursery.rating.toFixed(1)} ({nursery.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-emerald-50">
                      <p>
                        <span className="font-semibold text-white">Address:</span> {nursery.address.city}, {nursery.address.state}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Phone:</span> {nursery.phone}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Delivery radius:</span> {nursery.deliveryRadiusKm} km
                      </p>
                      <p>
                        <span className="font-semibold text-white">Email:</span> {nursery.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Products</h2>
                  <p className="mt-1 text-sm text-slate-600">Browse items available from this nursery</p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
                  <p className="text-lg font-medium text-slate-700">No products available</p>
                  <p className="mt-2 text-sm text-slate-500">This nursery has not listed any products yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-md transition hover:shadow-xl"
                    >
                      <div className="aspect-video bg-gradient-to-br from-emerald-100 via-white to-lime-100">
                        {product.images?.length ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                            <p className="mt-1 text-sm text-slate-500 capitalize">{product.category}</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
                        >
                          {addedProductId === product.id ? 'Added!' : 'Add to Cart'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-medium text-slate-700">Nursery not found</p>
            <p className="mt-2 text-sm text-slate-500">The requested nursery could not be loaded.</p>
          </div>
        )}
      </div>
    </div>
  )
}
