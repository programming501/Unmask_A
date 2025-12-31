export default function Home() {
  return (
    <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
      <section className="flex-1 space-y-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-800 dark:text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-700 shadow-[0_0_12px_rgba(8,145,178,0.8)] animate-pulse" />
          Marketplace Live
        </span>

        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-950 dark:text-white">
            <span className="gradient-text">Unmask</span>{" "}
            your exam potential.
          </h1>
          <p className="max-w-xl text-lg text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
            A demand-first learning marketplace where students post syllabus-specific
            exam needs and educators compete with personalised study offers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <a href="/auth?role=student" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-700 via-sky-700 to-violet-700 px-8 py-4 text-sm font-black text-white shadow-xl shadow-cyan-600/30 transition-all hover:scale-[1.05] hover:shadow-cyan-600/50 active:scale-95">
            I&apos;m a Student
          </a>
          <a href="/auth?role=educator" className="inline-flex items-center justify-center rounded-full border-2 border-slate-900 bg-white dark:bg-slate-900/40 dark:border-slate-700 px-8 py-4 text-sm font-black text-slate-950 dark:text-slate-100 backdrop-blur-md transition-all hover:bg-slate-950 hover:text-white hover:-translate-y-1">
            I&apos;m an Educator
          </a>
        </div>

        <div className="grid gap-4 pt-4 text-sm text-slate-800 dark:text-slate-400 sm:grid-cols-3">
          <div className="glass-panel p-5 hover-lift bg-white border-slate-300 dark:bg-transparent">
            <p className="font-black text-slate-950 dark:text-slate-100 uppercase tracking-wide">Demand-first</p>
            <p className="mt-2 leading-relaxed font-bold">
              Post hyper-specific exam requests. Educators respond with tailored offers.
            </p>
          </div>
          <div className="glass-panel p-5 hover-lift bg-white border-slate-300 dark:bg-transparent">
            <p className="font-black text-slate-950 dark:text-slate-100 uppercase tracking-wide">Syllabus aligned</p>
            <p className="mt-2 leading-relaxed font-bold">
              Every request is anchored to your actual university curriculum.
            </p>
          </div>
          <div className="glass-panel p-5 hover-lift bg-white border-slate-300 dark:bg-transparent">
            <p className="font-black text-slate-950 dark:text-slate-100 uppercase tracking-wide">Built for speed</p>
            <p className="mt-2 leading-relaxed font-bold">
              Realtime offers and chat – tuned for university chaos.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 flex-1 lg:mt-0">
        <div className="relative mx-auto max-w-md animate-float">
          <div className="absolute -inset-10 rounded-[40px] bg-gradient-to-tr from-cyan-500/20 via-violet-500/10 to-fuchsia-500/20 blur-3xl opacity-30" />
          <div className="relative glass-panel p-6 shadow-2xl bg-white dark:bg-slate-900/80 border-slate-300">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-700 to-violet-700 shadow-lg shadow-cyan-600/40" />
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-slate-100">
                    Live exam request
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-extrabold">
                    DBMS | Exam in 3 days
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                3 Offers
              </span>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4 border-2 border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800 dark:text-cyan-400">
                Active Bidding
              </p>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 rounded-xl bg-white dark:bg-slate-900/60 p-3 shadow-md border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-black text-xs text-slate-950 dark:text-slate-100">Dr. Meera • CS</p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-bold">
                      2-night crash plan • focus on ER & SQL.
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-50 dark:bg-slate-800 px-3 py-1 text-[11px] font-black text-cyan-800 dark:text-cyan-400 border-2 border-cyan-200 dark:border-transparent">
                    ₹899
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-xl bg-white/40 dark:bg-slate-900/30 p-3 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-black text-xs text-slate-800 dark:text-slate-100 opacity-90">Arjun • GATE AIR 142</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-1 font-bold">
                      Concept-first, then past papers.
                    </p>
                  </div>
                  <span className="px-3 py-1 text-[11px] font-black text-slate-800">
                    ₹749
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-violet-100/50 dark:bg-violet-500/10 border-2 border-violet-200 dark:border-violet-500/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-800 dark:text-violet-400">
                AI Matchmaker
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-bold">
                We pair you with educators who know exactly what your examiner expects.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
