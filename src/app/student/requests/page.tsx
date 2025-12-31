import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function StudentRequestsPage() {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-100 text-slate-950">
            <span className="gradient-text">My Requests</span>
          </h1>
          <p className="text-lg font-bold text-slate-800">
            Manage your active exam posts and track expert offers
          </p>
        </div>
        <Link
          href="/student/new-request"
          className="rounded-full bg-slate-950 px-8 py-3 text-sm font-black text-white shadow-2xl transition-all hover:bg-cyan-700 hover:scale-[1.02] active:scale-95"
        >
          + Create New Request
        </Link>
      </div>

      {requests && requests.length > 0 ? (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/student/requests/${request.id}`}
              className="glass-panel block rounded-[2rem] border-2 border-slate-950 bg-white p-8 transition-all hover:scale-[1.01] hover:shadow-2xl shadow-sm group"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-950 group-hover:text-cyan-800 transition-colors">
                      {request.title}
                    </h3>
                    <span
                      className={`rounded-full border-2 px-4 py-1 text-xs font-black uppercase tracking-widest shadow-sm ${request.status === 'open'
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-800'
                        : request.status === 'accepted'
                          ? 'bg-cyan-100 border-cyan-600 text-cyan-800'
                          : 'bg-white border-slate-900 text-slate-950'
                        }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-800">{request.subject}</p>

                  {request.exam_date && (
                    <p className="inline-flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Exam: {format(new Date(request.exam_date), 'MMMM d, yyyy')}
                    </p>
                  )}

                  {request.curriculum_link && (
                    <div
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Curriculum Linked
                    </div>
                  )}

                  <p className="line-clamp-2 text-sm font-bold leading-relaxed text-slate-700">
                    {request.description}
                  </p>
                </div>

                <div className="flex items-center justify-center md:pt-4">
                  <span className="rounded-full bg-slate-950 px-8 py-3 text-xs font-black text-white group-hover:bg-cyan-700 transition-all shadow-lg uppercase tracking-widest">
                    Manage Request
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[3rem] border-2 border-slate-950 bg-white p-16 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 border-2 border-slate-900">
            <svg
              className="h-10 w-10 text-slate-950"
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
          <p className="text-xl font-black text-slate-950">No requests yet</p>
          <p className="mt-2 text-sm font-bold text-slate-600">Create your first exam request to start receiving offers!</p>
          <Link
            href="/student/new-request"
            className="mt-8 inline-block rounded-full bg-slate-950 px-8 py-3 text-sm font-black text-white shadow-2xl transition-all hover:bg-cyan-700 active:scale-95"
          >
            Create Your First Request
          </Link>
        </div>
      )}
    </div>
  )
}
