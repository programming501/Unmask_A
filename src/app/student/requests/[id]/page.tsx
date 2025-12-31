import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { format } from 'date-fns'
import { acceptOffer } from './actions'
import AcceptOfferButton from './accept-offer-button'

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await requireProfile()
  const { id } = await params

  if (profile.role !== 'student') {
    redirect('/educator')
  }

  const supabase = await createClient()

  // Get request details
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .eq('student_id', profile.id)
    .single()

  if (requestError || !request) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass-panel rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">Request not found or you don't have access to it.</p>
          <Link
            href="/student"
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.65)] transition-transform hover:scale-[1.02]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Get offers for this request
  const { data: offers } = await supabase
    .from('offers')
    .select(`
      *,
      profiles!offers_educator_id_fkey (
        id,
        name,
        bio,
        subjects
      )
    `)
    .eq('request_id', id)
    .order('created_at', { ascending: false })

  // Get conversation if request is accepted
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('request_id', id)
    .maybeSingle()

  const acceptedOffer = offers?.find((o) => o.status === 'accepted')

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20">
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
            <span className="gradient-text">{request.title}</span>
          </h1>
          <p className="text-lg font-bold text-slate-800">Request Management</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel rounded-[2.5rem] border-2 border-slate-950 bg-white p-8 shadow-2xl">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Mission Details</h2>
                <p className="mt-1 text-sm font-bold text-slate-600 uppercase tracking-widest">
                  Posted {format(new Date(request.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <span
                className={`rounded-full border-2 px-5 py-2 text-xs font-black uppercase tracking-widest shadow-md ${request.status === 'open'
                  ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
                  : request.status === 'accepted'
                    ? 'bg-cyan-100 border-cyan-600 text-cyan-800'
                    : 'bg-white border-slate-950 text-slate-950'
                  }`}
              >
                {request.status}
              </span>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">Subject Area</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 border-2 border-slate-900">
                    <svg className="h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-xl font-black text-slate-950">{request.subject}</p>
                </div>
              </div>

              {request.exam_date && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">Exam Deadline</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 border-2 border-slate-900">
                      <svg className="h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xl font-black text-slate-950">
                      {format(new Date(request.exam_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {(request.budget_min || request.budget_max) && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">Investment Range</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 border-2 border-slate-900">
                      <svg className="h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xl font-black text-cyan-900">
                      ₹{request.budget_min || '0'} - ₹{request.budget_max || 'Open'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">Description & Requirements</p>
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
                  Access Curriculum
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Offers Sidebar */}
        <div className="space-y-8">
          <div className="glass-panel rounded-[2.5rem] border-2 border-slate-950 bg-white p-8 shadow-2xl">
            <h3 className="mb-6 text-xl font-black text-slate-950 flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-cyan-700" />
              Proposals ({offers?.length || 0})
            </h3>

            {offers && offers.length > 0 ? (
              <div className="space-y-4">
                {offers.map((offer: any) => {
                  const educator = offer.profiles
                  const isAccepted = offer.status === 'accepted'

                  return (
                    <div
                      key={offer.id}
                      className={`group rounded-3xl border-2 p-6 transition-all shadow-sm hover:shadow-xl ${isAccepted
                        ? 'border-cyan-600 bg-cyan-50'
                        : 'border-slate-950 bg-white'
                        }`}
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-950 flex items-center justify-center shadow-lg">
                          <span className="text-lg font-black text-white">{educator?.name?.charAt(0) || 'E'}</span>
                        </div>
                        <div>
                          <p className="font-black text-slate-950">{educator?.name || 'Expert Educator'}</p>
                          {isAccepted && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800">
                              Selected Partner
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-slate-50 p-3 border-2 border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Price</span>
                          <p className="text-lg font-black text-cyan-900">₹{offer.price}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 border-2 border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline</span>
                          <p className="text-xs font-black text-slate-900">{offer.timeline}</p>
                        </div>
                      </div>

                      <div className="mb-6 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-800">Study Strategy</p>
                        <p className="line-clamp-4 text-xs font-bold leading-relaxed text-slate-700">
                          {offer.study_plan}
                        </p>
                      </div>

                      {request.status === 'open' && !isAccepted && (
                        <AcceptOfferButton offerId={offer.id} requestId={request.id} />
                      )}

                      {request.status === 'accepted' && isAccepted && (
                        conversation ? (
                          <Link
                            href={`/educator/messages/${conversation.id}`}
                            className="block w-full rounded-full bg-slate-950 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:bg-cyan-700 active:scale-95"
                          >
                            Enter War Room
                          </Link>
                        ) : (
                          <div className="rounded-2xl bg-amber-50 border-2 border-amber-500 p-3 text-center text-xs font-black text-amber-800">
                            Initializing secure channel...
                          </div>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white border-2 border-slate-900 shadow-lg">
                  <svg className="h-8 w-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-black text-slate-950">Broadcast Active</p>
                <p className="mt-2 text-xs font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                  Waiting for experts to analyze<br />your requirements...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

