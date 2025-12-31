'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

export default function NewRequestPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    curriculum_link: '',
    exam_date: '',
    budget_min: '',
    budget_max: '',
  })

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

      if (!profile || profile.role !== 'student') {
        throw new Error('Only students can create requests')
      }

      const { error: insertError } = await supabase
        .from('requests')
        .insert({
          student_id: user.id,
          title: formData.title,
          subject: formData.subject,
          description: formData.description,
          curriculum_link: formData.curriculum_link || null,
          exam_date: formData.exam_date || null,
          budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
          status: 'open',
        })

      if (insertError) throw insertError

      router.push('/student')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/student"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-950 bg-white text-slate-950 transition-all hover:bg-slate-950 hover:text-white shadow-lg active:scale-95"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-950">
            <span className="gradient-text">Create Exam Request</span>
          </h1>
          <p className="text-lg font-bold text-slate-800">
            Describe what you need to master.
          </p>
        </div>
      </div>

      <div className="glass-panel border-2 border-slate-950 bg-white p-10 shadow-2xl rounded-[2.5rem]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
              Request Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-4 text-slate-950 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black text-lg"
              placeholder="e.g., Help with DBMS Midterm - SQL & Normalization"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
                Subject Area *
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-4 text-slate-950 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
                placeholder="e.g., Computer Science"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="exam_date" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
                Exam Date
              </label>
              <input
                id="exam_date"
                type="date"
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-4 text-slate-950 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
              Detailed Requirements *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={5}
              className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-4 text-slate-950 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black resize-none"
              placeholder="What specific topics do you need help with?"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="curriculum_link" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
              Syllabus URL (Optional)
            </label>
            <input
              id="curriculum_link"
              type="url"
              value={formData.curriculum_link}
              onChange={(e) => setFormData({ ...formData, curriculum_link: e.target.value })}
              className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-4 text-slate-950 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
              placeholder="https://your-uni.edu/syllabus.pdf"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="budget_min" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
                Min Budget (₹)
              </label>
              <input
                id="budget_min"
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-4 text-slate-950 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="budget_max" className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
                Max Budget (₹)
              </label>
              <input
                id="budget_max"
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                className="w-full rounded-2xl border-2 border-slate-950 bg-white px-5 py-4 text-slate-950 placeholder:text-slate-500 focus:border-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 transition-all font-black"
                placeholder="2000"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-100 p-4 text-sm font-black text-red-900 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border-2 border-slate-950 bg-white px-10 py-4 text-sm font-black text-slate-950 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-slate-950 px-10 py-4 text-sm font-black text-white shadow-2xl transition-all hover:bg-cyan-700 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Post Exam Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
