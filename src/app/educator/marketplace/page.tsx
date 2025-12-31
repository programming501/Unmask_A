import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function MarketplacePage() {
  const profile = await requireProfile()

  if (profile.role !== 'educator') {
    redirect('/student')
  }

  const supabase = await createClient()

  // Get ALL open requests (marketplace view)
  const { data: allRequests } = await supabase
    .from('requests')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // Get educator's subjects for highlighting
  const educatorSubjects = profile.subjects
    ? profile.subjects.split(',').map((s: string) => s.trim().toLowerCase())
    : []

  // Check which requests the educator has already submitted offers for
  const { data: existingOffers } = await supabase
    .from('offers')
    .select('request_id')
    .eq('educator_id', profile.id)

  const submittedRequestIds = new Set(existingOffers?.map((o) => o.request_id) || [])

  // Filter requests that match educator's subjects
  const matchingRequests = allRequests?.filter((r: any) => {
    if (!profile.subjects) return false
    const educatorSubjects = profile.subjects.split(',').map((s: string) => s.trim().toLowerCase())
    const requestSubject = r.subject.toLowerCase()
    return educatorSubjects.some((subj: string) => requestSubject.includes(subj))
  }) || []

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-950">
            <span className="gradient-text">Exam Marketplace</span>
          </h1>
          <p className="text-lg font-bold text-slate-800">
            Find students who need your expertise.
          </p>
        </div>

        {profile.subjects && (
          <div className="flex flex-wrap gap-2">
            {profile.subjects.split(',').map((subject: any, idx: number) => (
              <span
                key={idx}
                className="rounded-full border-2 border-slate-900 bg-white px-4 py-1.5 text-xs font-black text-slate-950 shadow-sm"
              >
                {subject.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel border-2 border-slate-900 bg-white p-5 shadow-xl">
          <p className="text-3xl font-black text-slate-950">{allRequests?.length || 0}</p>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Total Requests</p>
        </div>
        <div className="glass-panel border-2 border-cyan-800 bg-white p-5 shadow-xl">
          <p className="text-3xl font-black text-cyan-800">{matchingRequests.length}</p>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Matches for You</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {allRequests && allRequests.length > 0 ? (
          allRequests.map((request: any) => {
            const isMatch = profile.subjects &&
              profile.subjects.split(',').map((subj: string) => subj.trim().toLowerCase())
                .some((subj: string) => request.subject.toLowerCase().includes(subj))

            return (
              <Link
                key={request.id}
                href={`/educator/requests/${request.id}`}
                className={`group relative overflow-hidden rounded-[2rem] border-2 p-8 shadow-sm transition-all hover:scale-[1.01] hover:shadow-2xl ${isMatch ? 'border-cyan-600 bg-cyan-50/50' : 'border-slate-950 bg-white'
                  }`}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-950 group-hover:text-cyan-900">{request.title}</h3>
                        {isMatch && (
                          <span className="rounded-full bg-cyan-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg animate-pulse">
                            Match
                          </span>
                        )}
                      </div>
                      <p className="text-base font-bold text-slate-800">{request.subject}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-950 bg-white">
                        <svg className="h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Exam Date</span>
                        <span className="text-xs font-black text-slate-950">
                          {request.exam_date ? format(new Date(request.exam_date), 'MMM d, yyyy') : 'TBD'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-950 bg-white">
                        <svg className="h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Budget Range</span>
                        <span className="text-xs font-black text-cyan-800">
                          ₹{request.budget_min} - ₹{request.budget_max}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm font-bold leading-relaxed text-slate-800 border-l-4 border-slate-100 pl-4 py-1">
                    {request.description}
                  </p>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                        {request.profiles?.full_name?.charAt(0) || 'S'}
                      </div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        By {request.profiles?.full_name || 'Student'}
                      </span>
                    </div>
                    <button className="rounded-full bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-lg uppercase tracking-widest transition-all hover:bg-cyan-700 active:scale-95">
                      Submit Offer
                    </button>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full glass-panel rounded-[3rem] border-2 border-slate-950 bg-white p-16 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-900">
              <svg className="h-10 w-10 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-xl font-black text-slate-950">Marketplace is quiet...</p>
            <p className="mt-2 text-sm font-bold text-slate-600">Check back later for new student requests!</p>
          </div>
        )}
      </div>
    </div>
  )
}
