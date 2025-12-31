'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { formatDistanceToNow } from 'date-fns'
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

interface ConversationResponse {
  student: Profile[] | null
  educator: Profile[] | null
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

  // Load messages + conversation participants
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

        if (!messagesError && mounted) {
          setMessages(messagesData || [])
        }

        // Load conversation participants
        const { data: conversation } = await supabase
          .from('conversations')
          .select(
            `
            student:profiles!conversations_student_id_fkey ( id, name, role ),
            educator:profiles!conversations_educator_id_fkey ( id, name, role )
          `
          )
          .eq('id', conversationId)
          .single<ConversationResponse>()

        if (conversation && mounted) {
          const student = conversation.student?.[0] ?? null
          const educator = conversation.educator?.[0] ?? null

          const other =
            currentUserId === student?.id ? educator : student

          setOtherParticipant(other)
        }
      } catch (error) {
        console.error('Error loading chat:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadMessages()

    // Realtime subscription
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
        setMessageInput(content)
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
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No messages yet. Start the conversation!
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
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isOwn
                        ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 text-slate-950'
                        : 'bg-slate-800/60 text-slate-100'
                      }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </p>
                    <p
                      className={`mt-1 text-[10px] ${isOwn ? 'text-slate-700' : 'text-slate-400'
                        }`}
                    >
                      {formatDistanceToNow(
                        new Date(message.created_at),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/50 p-4">
        <form onSubmit={handleSendMessage} className="mx-auto max-w-4xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-slate-600/60 bg-slate-900/60 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || sending}
              className="rounded-xl bg-cyan-400 px-6 py-2.5 font-semibold text-slate-950 disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
