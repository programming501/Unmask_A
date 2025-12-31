'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function OfferForm({
  requestId,
  requestDescription,
  examDate,
}: {
  requestId: string
  requestDescription: string
  examDate: string | null
}) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    price: '',
    timeline: '',
    study_plan: '',
  })

  const handleGenerateAI = async () => {
    setAiLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: requestDescription,
          examDate: examDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate study plan')
      }

      const data = await response.json()
      setFormData({ ...formData, study_plan: data.plan || '' })
    } catch (err: any) {
      setError(err.message || 'Failed to generate study plan with AI')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'educator') {
        throw new Error('Only educators can submit offers')
      }

      const { error: insertError } = await supabase
        .from('offers')
        .insert({
          request_id: requestId,
          educator_id: user.id,
          price: parseFloat(formData.price),
          timeline: formData.timeline,
          study_plan: formData.study_plan,
          status: 'pending',
        })

      if (insertError) throw insertError

      router.push('/educator')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel rounded-[2rem] border-2 border-slate-950 bg-white p-8 shadow-2xl">
      <h3 className="mb-8 text-xl font-black text-slate-950 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-cyan-700" />
        Submit Proposal
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Performance Fee (₹)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="100"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-3.5 font-black text-slate-950 placeholder:text-slate-400 focus:border-cyan-700 focus:ring-4 focus:ring-cyan-600/10 transition-all outline-none"
            placeholder="e.g. 1500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="timeline" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Execution Timeline
          </label>
          <input
            id="timeline"
            type="text"
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
            required
            className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-3.5 font-black text-slate-950 placeholder:text-slate-400 focus:border-cyan-700 focus:ring-4 focus:ring-cyan-600/10 transition-all outline-none"
            placeholder="e.g. 2 sessions / 48 hours"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="study_plan" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Strategic Plan
            </label>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className="group flex items-center gap-2 rounded-full bg-cyan-50 border-2 border-cyan-200 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-800 transition-all hover:bg-cyan-100 active:scale-95 disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Strategist
                </>
              )}
            </button>
          </div>
          <textarea
            id="study_plan"
            value={formData.study_plan}
            onChange={(e) => setFormData({ ...formData, study_plan: e.target.value })}
            required
            rows={5}
            className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-4 font-bold text-slate-800 placeholder:text-slate-400 focus:border-cyan-700 focus:ring-4 focus:ring-cyan-600/10 transition-all outline-none resize-none"
            placeholder="Outline your detailed roadmap for student success..."
          />
          <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
            Bespoke plan recommended for higher conversion
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-4 text-xs font-black uppercase tracking-widest text-rose-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-full bg-slate-950 px-8 py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:bg-cyan-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <span className="relative z-10">{loading ? 'Transmitting...' : 'Deploy Proposal'}</span>
        </button>
      </form>
    </div>
  )
}

