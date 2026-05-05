'use client'

import { db } from '@/lib/firebase'
import { createBooking } from '@/lib/db/bookings'
import { useAuth } from '@/lib/hooks/useAuth'
import { Gardener } from '@/types'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const timeSlots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']

export default function GardenerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const gardenerId = Array.isArray(params?.gardenerId) ? params.gardenerId[0] : params?.gardenerId

  const [gardener, setGardener] = useState<Gardener | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [serviceType, setServiceType] = useState('')
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [stateName, setStateName] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const fetchGardener = async () => {
      if (!gardenerId) {
        setError('Gardener ID is missing.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const snapshot = await getDoc(doc(db, 'gardeners', gardenerId))
        if (!snapshot.exists()) {
          setGardener(null)
          return
        }

        const gardenerData = {
          id: snapshot.id,
          ...(snapshot.data() as Omit<Gardener, 'id'>),
        } as Gardener

        setGardener(gardenerData)
        setServiceType(gardenerData.services[0] || '')
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load gardener details.')
      } finally {
        setLoading(false)
      }
    }

    fetchGardener()
  }, [gardenerId])

  useEffect(() => {
    if (user) {
      setAddressLine1((current) => current || user.addresses?.[0]?.line1 || '')
      setCity((current) => current || user.addresses?.[0]?.city || '')
      setPincode((current) => current || user.addresses?.[0]?.pincode || '')
      setStateName((current) => current || user.addresses?.[0]?.state || '')
    }
  }, [user])

  const today = new Date().toISOString().split('T')[0]

  const getRatingStarClass = (index: number, rating: number) =>
    index < Math.round(rating) ? 'text-yellow-400' : 'text-slate-300'

  const validateForm = () => {
    if (!user) return 'Please log in to book a gardener.'
    if (!gardener) return 'Gardener not found.'
    if (!serviceType || !slotDate || !slotTime || !addressLine1 || !city || !pincode || !stateName) {
      return 'Please complete all required booking fields.'
    }
    return ''
  }

  const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!user || !gardener) {
      return
    }

    setBookingLoading(true)
    setError('')

    try {
      await createBooking({
        userId: user.uid,
        gardenerId: gardener.id,
        serviceType,
        serviceAddress: {
          id: 'booking-address',
          label: 'Booking Address',
          line1: addressLine1,
          line2: notes,
          city,
          pincode,
          state: stateName,
        },
        slotDate,
        slotTime,
        pricing: {
          amount: gardener.ratePerHour,
          platformFee: 0,
          total: gardener.ratePerHour,
        },
        status: 'pending',
      })

      setSuccess('Booking created successfully. Redirecting to your bookings...')
      setTimeout(() => {
        router.push('/bookings')
      }, 1200)
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : 'Failed to create booking.')
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/gardeners"
            className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            ← Back to Gardeners
          </Link>
        </div>

        {loading || authLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-white py-20 shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="mt-4 text-slate-600">Loading gardener details...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-sm">
            <p className="font-medium">Error loading gardener</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : gardener ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-bold text-slate-900">{gardener.name}</h1>
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

                    <p className="mt-3 text-lg text-slate-600">{gardener.experienceYears} years of experience</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Rate</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">₹{gardener.ratePerHour}/hr</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1 text-lg">
                  {[...Array(5)].map((_, index) => (
                    <span key={index} className={getRatingStarClass(index, gardener.rating)}>
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate-700">
                    {gardener.rating.toFixed(1)} ({gardener.reviewCount} reviews)
                  </span>
                </div>

                <p className="mt-6 text-sm font-medium text-slate-700">Services</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {gardener.services.map((service) => (
                    <span key={service} className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {service}
                    </span>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bio</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Skilled gardener available for home garden care, planting, maintenance, and service-based work across your area.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Book a Service</h2>
                  <p className="mt-1 text-sm text-slate-600">Fill in your details and choose a time slot.</p>
                </div>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleBookingSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="serviceType">
                    Service type
                  </label>
                  <select
                    id="serviceType"
                    value={serviceType}
                    onChange={(event) => setServiceType(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">Select a service</option>
                    {gardener.services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="slotDate">
                      Date
                    </label>
                    <input
                      id="slotDate"
                      type="date"
                      min={today}
                      value={slotDate}
                      onChange={(event) => setSlotDate(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <p className="mb-2 block text-sm font-medium text-slate-700">Time slot</p>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSlotTime(slot)}
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                            slotTime === slot
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="addressLine1">
                      Address line 1
                    </label>
                    <input
                      id="addressLine1"
                      value={addressLine1}
                      onChange={(event) => setAddressLine1(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="House no., street, area"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="pincode">
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      value={pincode}
                      onChange={(event) => setPincode(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Pincode"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="stateName">
                      State
                    </label>
                    <input
                      id="stateName"
                      value={stateName}
                      onChange={(event) => setStateName(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Optional notes for the gardener"
                  />
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </section>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-medium text-slate-700">Gardener not found</p>
            <p className="mt-2 text-sm text-slate-500">The requested profile could not be loaded.</p>
          </div>
        )}
      </div>
    </div>
  )
}
