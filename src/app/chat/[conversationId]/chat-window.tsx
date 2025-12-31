'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { format, formatDistanceToNow } from 'date-fns'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
}

interface Profile {
  id: string
  name: string
  role: string
}

export default function ChatWindow({
  conversationId,
  currentUserId,
}: {
  conversationId: string
  currentUserId: string
}) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [otherParticipant, setOtherParticipant] = useState<Profile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load initial messages and set up realtime
  useEffect(() => {
    let mounted = true

    async function loadMessages() {
      try {
        // Load messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (messagesError) {
          console.error('Error loading messages:', messagesError)
        } else if (mounted) {
          setMessages(messagesData || [])
        }

        // Get other participant info
        const { data: conversation } = await supabase
          .from('conversations')
          .select(`
            student:profiles!conversations_student_id_fkey(id, name, role),
            educator:profiles!conversations_educator_id_fkey(id, name, role)
          `)
          .eq('id', conversationId)
          .single()

        if (conversation) {
          const other =
            currentUserId === conversation.student?.id
              ? conversation.educator
              : conversation.student
          if (mounted) {
            setOtherParticipant(other)
          }
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadMessages()

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (mounted) {
            setMessages((prev) => [...prev, payload.new as Message])
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      mounted = false
      channel.unsubscribe()
    }
  }, [conversationId, currentUserId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || sending) return

    const content = messageInput.trim()
    setMessageInput('')
    setSending(true)

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
      })

      if (error) {
        console.error('Error sending message:', error)
        setMessageInput(content) // Restore message on error
      }
    } catch (error) {
      console.error('Error:', error)
      setMessageInput(content)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-slate-400">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/60">
                <svg
                  className="h-6 w-6 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUserId
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 text-slate-950'
                        : 'bg-slate-800/60 text-slate-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isOwn ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="glass-panel border-t border-slate-700/50 p-4">
        <form onSubmit={handleSendMessage} className="mx-auto max-w-4xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-slate-600/60 bg-slate-900/60 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || sending}
              className="rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.65)] transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {sending ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

