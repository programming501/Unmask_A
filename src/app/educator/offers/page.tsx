import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function EducatorOffersPage() {
  const profile = await requireProfile()

  if (profile.role !== 'educator') {
    redirect('/student')
  }

  const supabase = await createClient()

  const { data: offers } = await supabase
    .from('offers')
    .select(`
      *,
      requests!offers_request_id_fkey (
        id,
        title,
        subject,
        exam_date,
        curriculum_link
      )
    `)
    .eq('educator_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-950 dark:text-white">
          <span className="gradient-text">My Offers</span>
        </h1>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-400">
          View and track all your submitted proposals
        </p>
      </div>

      {offers && offers.length > 0 ? (
        <div className="grid gap-6">
          {offers.map((offer: any) => {
            const request = offer.requests
            return (
              <div
                key={offer.id}
                className="glass-panel rounded-[2rem] border-2 border-slate-950 bg-white p-8 shadow-2xl"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-black text-slate-950">
                        {request?.title || 'Request'}
                      </h3>
                      <span
                        className={`rounded-full border-2 px-4 py-1 text-xs font-black uppercase tracking-widest shadow-sm ${offer.status === 'accepted'
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
                          : offer.status === 'rejected'
                            ? 'bg-red-100 border-red-600 text-red-800'
                            : 'bg-white border-slate-950 text-slate-950'
                          }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                    <p className="text-base font-bold text-slate-800">{request?.subject || ''}</p>

                    {request?.exam_date && (
                      <p className="inline-flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Exam: {format(new Date(request.exam_date), 'MMMM d, yyyy')}
                      </p>
                    )}

                    <div className="grid gap-6 py-4 border-y border-slate-100 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Your Price
                        </p>
                        <p className="mt-1 text-2xl font-black text-cyan-800">₹{offer.price}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Timeline
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-950">{offer.timeline}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Submitted
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-950 leading-none">
                          {format(new Date(offer.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">
                        Detailed Study Plan
                      </p>
                      <p className="mt-3 text-sm font-bold leading-relaxed text-slate-800">
                        {offer.study_plan}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      {request?.curriculum_link && (
                        <a
                          href={request.curriculum_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-white px-5 py-2 text-xs font-black text-slate-950 hover:bg-slate-950 hover:text-white transition-all shadow-md"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Curriculum
                        </a>
                      )}
                      {offer.status === 'accepted' && (
                        <Link
                          href={`/educator/requests/${request?.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-2 text-xs font-black text-white hover:bg-cyan-700 transition-all shadow-xl"
                        >
                          Go to Request
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-[3rem] border-2 border-slate-950 bg-white p-16 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-900">
            <svg
              className="h-10 w-10 text-slate-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-xl font-black text-slate-950">No offers sent yet</p>
          <p className="mt-2 text-sm font-bold text-slate-600">
            Head over to the Marketplace to find matching requests!
          </p>
          <Link
            href="/educator/marketplace"
            className="mt-8 inline-block rounded-full bg-slate-950 px-8 py-3 text-sm font-black text-white shadow-2xl transition-all hover:bg-cyan-700 active:scale-95"
          >
            Find Requests
          </Link>
        </div>
      )}
    </div>
  )
}
