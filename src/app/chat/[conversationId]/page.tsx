import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import ChatWindow from './chat-window'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const profile = await requireProfile()
  const { conversationId } = await params

  const supabase = await createClient()

  // Get conversation details
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select(`
      *,
      requests (
        id,
        title,
        subject
      ),
      student:profiles!conversations_student_id_fkey (
        id,
        name,
        role
      ),
      educator:profiles!conversations_educator_id_fkey (
        id,
        name,
        role
      )
    `)
    .eq('id', conversationId)
    .single()

  if (conversationError || !conversation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-panel rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">Conversation not found or you don't have access to it.</p>
          <Link
            href={profile.role === 'student' ? '/student' : '/educator'}
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.65)] transition-transform hover:scale-[1.02]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Verify user is a participant
  const isParticipant =
    conversation.student_id === profile.id || conversation.educator_id === profile.id

  if (!isParticipant) {
    redirect(profile.role === 'student' ? '/student' : '/educator')
  }

  // Determine the other participant
  const otherParticipant =
    profile.id === conversation.student_id ? conversation.educator : conversation.student
  const request = conversation.requests

  return (
    <div className="flex h-screen flex-col">
      {/* Chat Header */}
      <header className="glass-panel border-b border-slate-700/50 p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={profile.role === 'student' ? '/student' : '/educator'}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-600/60 bg-slate-900/60 text-slate-400 transition-colors hover:bg-slate-900/80 hover:text-slate-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-100">
                Chat with {otherParticipant?.name || 'User'}
              </h1>
              <p className="text-xs text-slate-400">
                {request?.title || 'Request'} • {request?.subject || ''}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              profile.role === 'student'
                ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
                : 'border-purple-400/30 bg-purple-500/10 text-purple-200'
            }`}
          >
            {profile.role === 'student' ? 'Student' : 'Educator'}
          </span>
        </div>
      </header>

      {/* Chat Window */}
      <ChatWindow conversationId={conversationId} currentUserId={profile.id} />
    </div>
  )
}

