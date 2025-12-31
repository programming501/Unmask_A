import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export default async function StudentDashboard() {
  const profile = await requireProfile()

  if (profile.role !== 'student') {
    redirect('/educator')
  }

  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get total offers count across all requests
  const { count: totalOffers } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .in(
      'request_id',
      requests?.map((r) => r.id) || []
    )

  // Get conversations with details
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
      educator:profiles!conversations_educator_id_fkey (
        id,
        name
      )
    `)
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-slate-950 dark:text-white">
          Welcome back, <span className="gradient-text">{profile.name}</span>
        </h1>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-300">
          Manage your exam requests and connect with educators
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel border-2 border-slate-900 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 uppercase tracking-tight">Your Requests</h3>
          </div>
          <p className="text-4xl font-black text-slate-950 dark:text-slate-100">{requests?.length || 0}</p>
          <p className="mt-2 text-xs font-black text-slate-600 uppercase tracking-widest">Active Requests</p>
        </div>

        <div className="glass-panel border-2 border-slate-900 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 uppercase tracking-tight">Offers Received</h3>
          </div>
          <p className="text-4xl font-black text-slate-950 dark:text-slate-100">{totalOffers || 0}</p>
          <p className="mt-2 text-xs font-black text-slate-600 uppercase tracking-widest">Total Bids</p>
        </div>

        <div className="glass-panel border-2 border-slate-900 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 uppercase tracking-tight">Active Chats</h3>
          </div>
          <p className="text-4xl font-black text-slate-950 dark:text-slate-100">{conversations?.length || 0}</p>
          <p className="mt-2 text-xs font-black text-slate-600 uppercase tracking-widest">Ongoing Conversations</p>
        </div>
      </div>

      <div className="glass-panel border-2 border-slate-900 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100">Recent Requests</h2>
          <Link
            href="/student/new-request"
            className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-black text-white shadow-xl transition-all hover:bg-cyan-700 hover:scale-[1.02] active:scale-95"
          >
            + New Request
          </Link>
        </div>

        {requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/student/requests/${request.id}`}
                className="block rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 transition-all hover:border-slate-900 hover:bg-white hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-950 dark:text-slate-100">{request.title}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-400">{request.subject}</p>
                    {request.exam_date && (
                      <p className="mt-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                        Exam: {new Date(request.exam_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full border-2 px-4 py-1 text-xs font-black uppercase ${request.status === 'open'
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
                        : request.status === 'accepted'
                          ? 'bg-cyan-100 border-cyan-600 text-cyan-800'
                          : 'bg-white border-slate-900 text-slate-950 shadow-sm'
                      }`}
                  >
                    {request.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-slate-300 rounded-3xl">
            <p className="font-bold text-slate-600">No requests yet. Create your first one!</p>
            <Link
              href="/student/new-request"
              className="mt-6 inline-block rounded-full bg-slate-950 px-8 py-3 text-sm font-black text-white shadow-2xl transition-all hover:bg-cyan-700 hover:scale-[1.02] active:scale-95"
            >
              Create Request
            </Link>
          </div>
        )}
      </div>

      {/* Active Conversations */}
      {conversations && conversations.length > 0 && (
        <div className="glass-panel border-2 border-slate-900 bg-white p-8 shadow-2xl">
          <h2 className="mb-6 text-2xl font-black text-slate-950 dark:text-slate-100 text-center">Active Conversations</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {conversations.map((conv: any) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="block rounded-2xl border-2 border-slate-900 bg-white p-5 transition-all hover:scale-[1.02] hover:shadow-xl group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 group-hover:text-cyan-700">
                      {conv.educator?.name || 'Educator'}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-400">
                      {conv.requests?.title || 'Request'}
                    </p>
                    <p className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      {conv.requests?.subject || ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-5 py-2 text-xs font-black text-white group-hover:bg-cyan-700 shadow-lg">
                    CHAT
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

