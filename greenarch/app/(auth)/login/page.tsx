'use client'

import { auth } from '@/lib/firebase'
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const googleClientId = '581586313233-re1i40i5aqijroqvns2iohtu1miuqqmh.apps.googleusercontent.com'

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false)

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      router.push('/nurseries')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
      router.push('/nurseries')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Google sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f8f5] text-[#214d35]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,139,78,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(113,191,122,0.16),_transparent_36%)]" aria-hidden="true" />
      <div className="page-accent absolute inset-0 pointer-events-none" aria-hidden="true" />

      <header className="navbar-main relative z-10 border-b border-white/60 bg-white/70 backdrop-blur-sm">
        <div className="container navbar-inner mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="logo flex items-center gap-3" aria-label="GreenArch Home">
            <img className="logo-image h-10 w-10 object-contain" src="/greenarch-logo.png" alt="GreenArch logo" />
            <span className="logo-text text-lg font-semibold tracking-wide text-emerald-900">GreenArch</span>
          </Link>

          <button className="menu-toggle hidden rounded-full border border-emerald-200 bg-white px-3 py-2 text-emerald-800 lg:hidden" aria-label="Menu" aria-expanded="false" type="button">
            ☰
          </button>

          <nav className="nav-menu hidden items-center gap-6 lg:flex">
            <ul className="flex items-center gap-6 text-sm font-medium text-emerald-900">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/gardeners">Services</Link></li>
              <li><Link href="/nurseries">Store</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>

            <div className="nav-actions flex items-center gap-4">
              <div className="nav-dropdown-item relative group">
                <button className="nav-dropdown-toggle inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold text-emerald-900" aria-label="Resources" aria-expanded="false" type="button">
                  Resources
                </button>
                <ul className="nav-dropdown-menu invisible absolute right-0 top-full mt-2 w-56 rounded-2xl border border-emerald-100 bg-white p-2 opacity-0 shadow-lg shadow-emerald-100/70 transition group-hover:visible group-hover:opacity-100" role="menu">
                  <li><Link className="block rounded-xl px-4 py-3 text-sm text-emerald-900 hover:bg-emerald-50" href="/partner" role="menuitem">Partner Login</Link></li>
                  <li><Link className="block rounded-xl px-4 py-3 text-sm text-emerald-900 hover:bg-emerald-50" href="/login" role="menuitem">Gardener Login</Link></li>
                  <li><Link className="block rounded-xl px-4 py-3 text-sm text-emerald-900 hover:bg-emerald-50" href="/how-it-works" role="menuitem">How It Works</Link></li>
                </ul>
              </div>

              <Link href="/login" className="nav-login-link text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Login
              </Link>
              <Link href="/register" className="btn btn-solid btn-start inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700">
                <span>Get Started</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="auth-page relative z-10 px-6 py-8 lg:py-12">
        <section className="auth-shell mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_24px_80px_rgba(22,101,52,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="auth-brand-pane relative flex min-h-[26rem] flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,_rgba(13,92,50,0.98),_rgba(31,138,77,0.96),_rgba(113,191,122,0.92))] p-8 text-white lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.1),_transparent_45%)]" aria-hidden="true" />
            <div className="auth-brand-content relative z-10 max-w-xl">
              <p className="auth-brand-kicker text-xs font-bold uppercase tracking-[0.28em] text-emerald-100">GreenArch Access</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight lg:text-5xl">Welcome to GreenArch</h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-50/90 lg:text-base">
                Build a healthier home with smart, sustainable solutions.
                Manage your consultations, projects, and support in one secure workspace.
              </p>
            </div>
            <img
              className="auth-brand-image relative z-10 mt-10 h-64 w-full rounded-[24px] object-cover shadow-2xl shadow-black/20 lg:h-72"
              src="https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80"
              alt="Lush indoor plants on a modern desk"
              loading="lazy"
            />
          </aside>

          <section className="auth-form-pane flex items-center justify-center bg-[#f9fcfa] p-6 lg:p-10">
            <article className="auth-card w-full max-w-[31rem] rounded-[26px] border border-emerald-100 bg-white p-6 shadow-[0_12px_30px_rgba(26,98,59,0.08)] lg:p-8" aria-live="polite">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="auth-social-btn auth-social-top flex w-full items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 py-3 font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label="Continue with Google"
              >
                <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-semibold text-red-500 shadow-sm">G</span>
                Continue with Google
              </button>

              <p className="auth-social-note mt-4 text-center text-sm font-medium text-emerald-700">Use Google for instant secure access</p>
              <div className="auth-divider my-6 flex items-center gap-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                <span className="h-px flex-1 bg-emerald-100" />
                <span>or use email</span>
                <span className="h-px flex-1 bg-emerald-100" />
              </div>

              <div className="auth-tabs flex rounded-2xl bg-emerald-50 p-1" role="tablist" aria-label="Authentication options">
                <button
                  className={`auth-tab flex-1 rounded-[16px] px-4 py-3 text-sm font-semibold transition ${activeTab === 'login' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-700'}`}
                  id="loginTab"
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'login'}
                  aria-controls="loginPanel"
                  data-auth-target="loginPanel"
                  onClick={() => {
                    setActiveTab('login')
                    setError('')
                  }}
                >
                  Login
                </button>
                <button
                  className={`auth-tab flex-1 rounded-[16px] px-4 py-3 text-sm font-semibold transition ${activeTab === 'signup' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-700'}`}
                  id="signupTab"
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'signup'}
                  aria-controls="signupPanel"
                  data-auth-target="signupPanel"
                  onClick={() => {
                    setActiveTab('signup')
                    setError('')
                  }}
                >
                  Sign Up
                </button>
              </div>

              <div className="auth-panels mt-5">
                {activeTab === 'login' ? (
                  <form className="auth-panel is-active space-y-4" id="loginPanel" noValidate onSubmit={handleEmailLogin}>
                    <div>
                      <label className="auth-label mb-2 block text-sm font-medium text-emerald-900" htmlFor="authLoginEmail">
                        Email
                      </label>
                      <input
                        className="auth-input w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        id="authLoginEmail"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="auth-label mb-2 block text-sm font-medium text-emerald-900" htmlFor="authLoginPassword">
                        Password
                      </label>
                      <div className="auth-password-wrap relative">
                        <input
                          className="auth-input w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 pr-20 text-emerald-950 outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          id="authLoginPassword"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          required
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                        />
                        <button
                          className="auth-password-toggle absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                          type="button"
                          data-password-toggle="authLoginPassword"
                          aria-label="Show password"
                          onClick={() => setShowLoginPassword((value) => !value)}
                        >
                          {showLoginPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <Link className="auth-forgot inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800" href="#">
                      Forgot Password?
                    </Link>

                    {error ? (
                      <p className="auth-error rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" aria-live="polite">
                        {error}
                      </p>
                    ) : null}

                    <button
                      className="btn btn-solid auth-submit w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </form>
                ) : (
                  <form className="auth-panel is-active space-y-4" id="signupPanel" noValidate>
                    <div>
                      <label className="auth-label mb-2 block text-sm font-medium text-emerald-900" htmlFor="authSignupName">
                        Name
                      </label>
                      <input
                        className="auth-input w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        id="authSignupName"
                        type="text"
                        placeholder="Your full name"
                        required
                        value={signupName}
                        onChange={(event) => setSignupName(event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="auth-label mb-2 block text-sm font-medium text-emerald-900" htmlFor="authSignupEmail">
                        Email
                      </label>
                      <input
                        className="auth-input w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        id="authSignupEmail"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="auth-label mb-2 block text-sm font-medium text-emerald-900" htmlFor="authSignupPhone">
                        Phone
                      </label>
                      <input
                        className="auth-input w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-950 outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        id="authSignupPhone"
                        type="tel"
                        placeholder="+91 9876543210"
                        required
                        value={signupPhone}
                        onChange={(event) => setSignupPhone(event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="auth-label mb-2 block text-sm font-medium text-emerald-900" htmlFor="authSignupPassword">
                        Password
                      </label>
                      <div className="auth-password-wrap relative">
                        <input
                          className="auth-input w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 pr-20 text-emerald-950 outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          id="authSignupPassword"
                          type={showSignupPassword ? 'text' : 'password'}
                          placeholder="Create password"
                          required
                          value={signupPassword}
                          onChange={(event) => setSignupPassword(event.target.value)}
                        />
                        <button
                          className="auth-password-toggle absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                          type="button"
                          data-password-toggle="authSignupPassword"
                          aria-label="Show password"
                          onClick={() => setShowSignupPassword((value) => !value)}
                        >
                          {showSignupPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="auth-label mb-2 block text-sm font-medium text-emerald-900" htmlFor="authSignupConfirmPassword">
                        Confirm Password
                      </label>
                      <div className="auth-password-wrap relative">
                        <input
                          className="auth-input w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 pr-20 text-emerald-950 outline-none transition placeholder:text-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          id="authSignupConfirmPassword"
                          type={showSignupConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          required
                          value={signupConfirmPassword}
                          onChange={(event) => setSignupConfirmPassword(event.target.value)}
                        />
                        <button
                          className="auth-password-toggle absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                          type="button"
                          data-password-toggle="authSignupConfirmPassword"
                          aria-label="Show password"
                          onClick={() => setShowSignupConfirmPassword((value) => !value)}
                        >
                          {showSignupConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <p className="auth-error rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800" aria-live="polite">
                      Use the register page to create an account.
                    </p>

                    <button
                      className="btn btn-solid auth-submit w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      type="button"
                      disabled={loading}
                      onClick={() => router.push('/register')}
                    >
                      Create Account
                    </button>
                  </form>
                )}
              </div>
            </article>
          </section>
        </section>
      </main>
    </div>
  )
}
