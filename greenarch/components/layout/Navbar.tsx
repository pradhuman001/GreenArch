'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'

import { auth } from '@/lib/firebase'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCartStore } from '@/lib/store/cartStore'

export default function Navbar() {
  const router = useRouter()
  const { user } = useAuth()
  const totalItems = useCartStore((state) => state.getTotalItems())

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-emerald-700">
            GreenArch
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/nurseries" className="text-sm font-medium text-slate-700 transition hover:text-emerald-700">
              Nurseries
            </Link>
            <Link href="/gardeners" className="text-sm font-medium text-slate-700 transition hover:text-emerald-700">
              Gardeners
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50"
            aria-label="Cart"
          >
            <span className="text-lg">🛒</span>
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">Hi, {user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
