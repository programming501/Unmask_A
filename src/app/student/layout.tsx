import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireProfile()

  if (profile.role !== 'student') {
    redirect('/educator')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="glass-panel hidden w-64 border-r-2 border-slate-900 p-6 lg:block !rounded-none !border-y-0 !border-l-0 bg-white dark:bg-slate-900/90">
        <div className="mb-10">
          <Link href="/student" className="text-2xl font-black">
            <span className="gradient-text">Unmask</span>
          </Link>
        </div>
        <nav className="space-y-2">
          <Link
            href="/student"
            className="block rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyan-900 dark:hover:text-cyan-400"
          >
            Dashboard
          </Link>
          <Link
            href="/student/requests"
            className="block rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyan-900 dark:hover:text-cyan-400"
          >
            My Requests
          </Link>
        </nav>
        <div className="absolute bottom-10 left-6 right-6">
          <div className="rounded-2xl border-2 border-slate-900 bg-white shadow-lg p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Signed in as</p>
            <p className="text-sm font-black text-slate-950 dark:text-slate-100 mt-1 truncate">{profile.name}</p>
            <p className="text-[10px] text-slate-700 font-extrabold truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="glass-panel !rounded-none !border-x-0 !border-t-0 border-b-2 border-slate-900 p-4 sticky top-0 z-10 bg-white dark:bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <Link href="/student" className="text-xl font-black">
                <span className="gradient-text">Unmask</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full border-2 border-slate-900 bg-cyan-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-900 dark:text-cyan-300">
                Student Account
              </span>
            </div>
          </div>
        </header>
        <div className="p-8 flex-1 bg-slate-50/50">{children}</div>
      </main>
    </div>
  )
}

