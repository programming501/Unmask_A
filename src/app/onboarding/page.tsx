'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'role' | 'profile'>('role')
  const [role, setRole] = useState<'student' | 'educator' | null>(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [subjects, setSubjects] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)

      // Check if profile already exists
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            // Profile exists, redirect to dashboard
            router.push(profile.role === 'student' ? '/student' : '/educator')
          }
        })
    })
  }, [router, supabase])

  const handleRoleSelect = (selectedRole: 'student' | 'educator') => {
    setRole(selectedRole)
    setStep('profile')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !role) return

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role,
          name,
          bio: role === 'educator' ? bio : null,
          subjects: role === 'educator' ? subjects : null,
        })

      if (insertError) throw insertError

      router.push(role === 'student' ? '/student' : '/educator')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">Initializing...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel w-full max-w-3xl space-y-10 p-10">
        {step === 'role' ? (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold">
                <span className="gradient-text">Choose your journey</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                How do you want to use Unmask? This cannot be changed later.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <button
                onClick={() => handleRoleSelect('student')}
                className="group relative overflow-hidden rounded-[2rem] border-2 border-slate-900 bg-white p-8 text-left transition-all hover:bg-slate-50 hover-lift shadow-sm hover:shadow-xl hover:shadow-cyan-600/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-700/0  to-violet-700/0 transition-all group-hover:from-cyan-700/5 group-hover:to-violet-700/5" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 shadow-lg">
                    <svg
                      className="h-7 w-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-slate-100">
                    I&apos;m a Student
                  </h3>
                  <p className="text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-400">
                    Post exam requests and get personalized study offers from qualified educators.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('educator')}
                className="group relative overflow-hidden rounded-[2rem] border-2 border-slate-900 bg-white p-8 text-left transition-all hover:bg-slate-50 hover-lift shadow-sm hover:shadow-xl hover:shadow-violet-600/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-700/0 to-fuchsia-700/0 transition-all group-hover:from-violet-700/5 group-hover:to-fuchsia-700/5" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 shadow-lg">
                    <svg
                      className="h-7 w-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-black text-slate-950 dark:text-slate-100">
                    I&apos;m an Educator
                  </h3>
                  <p className="text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-400">
                    Monetize your expertise by responding to student requests with tailored offers.
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 max-w-xl mx-auto">
            <div className="space-y-3 text-center">
              <h1 className="text-4xl font-black">
                <span className="gradient-text">Complete your profile</span>
              </h1>
              <p className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest">
                {role === 'student'
                  ? 'Personalize your student identity'
                  : 'Establish your educator expertise'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-300 ml-1">
                Display Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl border-2 border-slate-900 bg-white px-4 py-4 text-slate-950 dark:text-white dark:bg-slate-950/40 dark:border-slate-800 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
                placeholder="John Doe"
              />
            </div>

            {role === 'educator' && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-300 ml-1">
                    Your Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border-2 border-slate-900 bg-white px-4 py-4 text-slate-950 dark:text-white dark:bg-slate-950/40 dark:border-slate-800 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black resize-none"
                    placeholder="Brief description of your teaching experience..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="subjects" className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-300 ml-1">
                    Expertise Areas *
                  </label>
                  <input
                    id="subjects"
                    type="text"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    required
                    className="w-full rounded-2xl border-2 border-slate-900 bg-white px-4 py-4 text-slate-950 dark:text-white dark:bg-slate-950/40 dark:border-slate-800 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
                    placeholder="e.g., Database Systems, Algorithms, Mathematics"
                  />
                  <p className="mt-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Separate multiple subjects with commas
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border-2 border-red-300 bg-red-100 p-4 text-xs font-black text-red-900 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="rounded-full border-2 border-slate-900 bg-white px-8 py-4 text-sm font-black text-slate-950 hover:bg-slate-950 hover:text-white transition-all active:scale-95 shadow-lg"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-slate-950 px-8 py-4 text-sm font-black text-white shadow-2xl transition-all hover:bg-cyan-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Creating profile...' : 'Launch Dashboard'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

