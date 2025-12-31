'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intendedRole = searchParams.get('role') || 'student'

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              intended_role: intendedRole,
            },
          },
        })

        if (signUpError) throw signUpError

        if (data.user) {
          setMessage('Account created! Redirecting to onboarding...')
          setTimeout(() => router.push('/onboarding'), 1500)
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        router.push('/onboarding')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md space-y-8 p-10 hover-lift active:scale-[0.99] transition-transform">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">Welcome</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {isSignUp
              ? `Create your ${intendedRole} account`
              : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-300 ml-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                className="w-full rounded-2xl border-2 border-slate-900 bg-white px-4 py-4 text-slate-950 dark:text-white dark:bg-slate-950/40 dark:border-slate-800 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-300 ml-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border-2 border-slate-900 bg-white px-4 py-4 text-slate-950 dark:text-white dark:bg-slate-950/40 dark:border-slate-800 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
              placeholder="you@university.edu"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-300 ml-1">
              Secret Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border-2 border-slate-900 bg-white px-4 py-4 text-slate-950 dark:text-white dark:bg-slate-950/40 dark:border-slate-800 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-100 p-4 text-xs font-black text-red-900 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-100 p-4 text-xs font-black text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-950 py-5 text-sm font-black text-white shadow-2xl transition-all hover:bg-cyan-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create My Account' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
            }}
            className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

