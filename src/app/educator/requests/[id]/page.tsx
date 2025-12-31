import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { format } from 'date-fns'
import OfferForm from './offer-form'

export default async function EducatorRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await requireProfile()
  const { id } = await params

  if (profile.role !== 'educator') {
    redirect('/student')
  }

  const supabase = await createClient()

  // Get request details (educators can view open requests)
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .eq('status', 'open')
    .single()

  if (requestError || !request) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass-panel rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">Request not found or no longer open.</p>
          <Link
            href="/educator"
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.65)] transition-transform hover:scale-[1.02]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Check if educator already submitted an offer
  const { data: existingOffer } = await supabase
    .from('offers')
    .select('*')
    .eq('request_id', id)
    .eq('educator_id', profile.id)
    .maybeSingle()

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/educator/marketplace"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-950 bg-white text-slate-950 transition-all hover:bg-slate-950 hover:text-white shadow-lg active:scale-95"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-950">
            <span className="gradient-text">{request.title}</span>
          </h1>
          <p className="text-lg font-bold text-slate-800">Proposal Workbench</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel rounded-[2.5rem] border-2 border-slate-950 bg-white p-8 shadow-2xl">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Student Requirements</h2>
                <p className="mt-1 text-sm font-bold text-slate-600 uppercase tracking-widest">
                  Target: {request.subject}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border-2 border-slate-900">
                <svg className="h-6 w-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {request.exam_date && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">Exam Deadline</p>
                  <p className="text-xl font-black text-slate-950">
                    {format(new Date(request.exam_date), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest text-rose-600">
                    {(() => {
                      const daysUntil = Math.ceil(
                        (new Date(request.exam_date).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                      )
                      return daysUntil > 0
                        ? `${daysUntil} day${daysUntil !== 1 ? 's' : ''} remaining`
                        : 'Exam date has passed'
                    })()}
                  </p>
                </div>
              )}

              {(request.budget_min || request.budget_max) && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">Budget Estimate</p>
                  <p className="text-xl font-black text-cyan-900">
                    ₹{request.budget_min || '0'} - ₹{request.budget_max || 'Open'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">Briefing / Payload</p>
              <div className="rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 p-7">
                <p className="whitespace-pre-wrap text-base font-bold leading-relaxed text-slate-800">
                  {request.description}
                </p>
              </div>
            </div>

            {request.curriculum_link && (
              <div className="mt-8">
                <a
                  href={request.curriculum_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full bg-slate-950 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:bg-cyan-700 active:scale-95"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Inspect Syllabus
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Offer Form Sidebar */}
        <div className="space-y-8">
          {existingOffer ? (
            <div className="glass-panel rounded-[2.5rem] border-2 border-slate-950 bg-white p-8 shadow-2xl">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-950">Mission Log</h3>
                <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-600">Your proposal is active</p>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4 border-2 border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bidding</span>
                    <p className="text-xl font-black text-cyan-900">₹{existingOffer.price}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border-2 border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline</span>
                    <p className="text-xs font-black text-slate-950">{existingOffer.timeline}</p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-slate-950 bg-white p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800">Status</span>
                  <div className="mt-2 text-center">
                    <span
                      className={`inline-block rounded-full border-2 px-5 py-2 text-xs font-black uppercase tracking-widest shadow-md ${existingOffer.status === 'accepted'
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
                        : existingOffer.status === 'rejected'
                          ? 'bg-red-100 border-red-600 text-red-800'
                          : 'bg-white border-slate-950 text-slate-950'
                        }`}
                    >
                      {existingOffer.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-[2.5rem] border-2 border-slate-950 bg-white p-8 shadow-2xl">
              <h3 className="mb-6 text-xl font-black text-slate-950 flex items-center gap-3">
                <span className="h-6 w-1.5 rounded-full bg-cyan-700" />
                Draft Proposal
              </h3>
              <OfferForm requestId={id} requestDescription={request.description} examDate={request.exam_date} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

