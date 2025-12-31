import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function EducatorDashboard() {
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
    .limit(20)

  // Get educator's subjects for highlighting
  const educatorSubjects = profile.subjects
    ? profile.subjects.split(',').map((s: string) => s.trim().toLowerCase())
    : []

  // Filter requests by subject match for "matching" stat
  const matchingRequests = allRequests?.filter((request) => {
    if (!educatorSubjects.length) return false
    const requestSubject = request.subject.toLowerCase()
    return educatorSubjects.some((subj: string) => requestSubject.includes(subj))
  }) || []

  // Get educator's offers
  const { data: offers } = await supabase
    .from('offers')
    .select(`
      *,
      requests!offers_request_id_fkey (
        id,
        title,
        subject,
        exam_date
      )
    `)
    .eq('educator_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get conversations for educator
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      created_at,
      requests (
        id,
        title,
        subject
      ),
      student:profiles!conversations_student_id_fkey (
        id,
        full_name
      )
    `)
    .eq('educator_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[3rem] border-2 border-slate-950 bg-white p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-950">
              Welcome back, <span className="gradient-text">{profile.full_name || profile.name}</span>
            </h1>
            <p className="mt-4 text-xl font-bold text-slate-800">
              Ready to help students master their exams today?
            </p>
            {profile.subjects && (
              <div className="mt-6 flex flex-wrap gap-2">
                {profile.subjects.split(',').map((subject: string, idx: number) => (
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
          <div className="flex gap-4">
            <Link
              href="/educator/marketplace"
              className="rounded-full bg-slate-950 px-8 py-4 text-sm font-black text-white shadow-2xl transition-all hover:bg-cyan-700 hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Offers', value: offers?.filter((o: any) => o.status === 'pending').length || 0, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-slate-950' },
          { label: 'Accepted Deals', value: offers?.filter((o: any) => o.status === 'accepted').length || 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-600' },
          { label: 'Market Hits', value: (matchingRequests as any[]).length, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-cyan-800' },
          { label: 'Messages', value: conversations?.length || 0, icon: 'M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'bg-slate-900' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel group border-2 border-slate-950 bg-white p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} shadow-lg`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="text-3xl font-black text-slate-950">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Matching Requests Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-950 flex items-center gap-3">
              <span className="h-8 w-2 rounded-full bg-cyan-700" />
              Suggested For You
            </h2>
            <Link href="/educator/marketplace" className="text-sm font-black text-cyan-800 hover:text-cyan-700 underline underline-offset-4 tracking-tight">
              View All Requests
            </Link>
          </div>

          <div className="space-y-4">
            {(matchingRequests as any[]).length > 0 ? (
              (matchingRequests as any[]).slice(0, 3).map((request: any) => (
                <Link
                  key={request.id}
                  href={`/educator/requests/${request.id}`}
                  className="glass-panel block rounded-2xl border-2 border-cyan-800 bg-cyan-50/30 p-5 transition-all hover:scale-[1.02] hover:bg-cyan-50 shadow-sm hover:shadow-xl group"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-950 group-hover:text-cyan-900 transition-colors">{request.title}</h3>
                      <p className="text-sm font-bold text-slate-700">{request.subject}</p>
                      <div className="flex items-center gap-4 pt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Exam: {request.exam_date ? format(new Date(request.exam_date), 'MMM d, yyyy') : 'No date'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800 flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Budget Range
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-cyan-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                      Match
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center bg-white shadow-inner">
                <p className="font-bold text-slate-600">No matching requests found.</p>
                <p className="mt-2 text-sm text-slate-500">Add more subjects to your profile!</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Offers Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-950 flex items-center gap-3">
              <span className="h-8 w-2 rounded-full bg-emerald-600" />
              Your Recent Offers
            </h2>
            <Link href="/educator/offers" className="text-sm font-black text-emerald-800 hover:text-emerald-700 underline underline-offset-4 tracking-tight">
              View Tracking
            </Link>
          </div>

          <div className="space-y-4">
            {offers && offers.length > 0 ? (
              offers.slice(0, 3).map((offer: any) => (
                <div
                  key={offer.id}
                  className="glass-panel border-2 border-slate-950 bg-white p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-950 leading-tight">
                        {offer.requests?.title || 'Exam Request'}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-700">₹{offer.price}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{offer.timeline}</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${offer.status === 'accepted'
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
                          : offer.status === 'rejected'
                            ? 'bg-red-100 border-red-600 text-red-800'
                            : 'bg-white border-slate-950 text-slate-950'
                        }`}
                    >
                      {offer.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center bg-white shadow-inner">
                <p className="font-bold text-slate-600">You haven't submitted any offers yet.</p>
                <Link
                  href="/educator/marketplace"
                  className="mt-4 inline-block text-sm font-black text-cyan-800 hover:text-cyan-700"
                >
                  Find your first student to help →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Active Conversations Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-slate-950 flex items-center gap-3">
            <span className="h-8 w-2 rounded-full bg-slate-950" />
            Active Conversations
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv: any) => (
              <Link
                key={conv.id}
                href={`/educator/messages/${conv.id}`}
                className="glass-panel group border-2 border-slate-950 bg-white p-6 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center shadow-lg group-hover:bg-cyan-700 transition-colors">
                    <span className="text-lg font-black text-white">
                      {conv.student?.full_name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-950 group-hover:text-cyan-800 transition-colors">
                      {conv.student?.full_name || 'Student'}
                    </h3>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                      {conv.requests?.title?.slice(0, 30)}...
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center bg-white">
              <p className="font-bold text-slate-600">No active conversations.</p>
              <p className="text-sm text-slate-500">Offers you make will appear here once students respond.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
