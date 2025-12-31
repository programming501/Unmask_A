'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptOffer } from './actions'

export default function AcceptOfferButton({
  offerId,
  requestId,
}: {
  offerId: string
  requestId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this offer? This will reject all other offers.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await acceptOffer(offerId, requestId)
      if (result.success) {
        // Force a hard refresh to ensure conversation is loaded
        router.refresh()
        // Small delay to ensure state updates
        setTimeout(() => {
          router.refresh()
        }, 300)
      }
    } catch (err: any) {
      console.error('Error accepting offer:', err)
      setError(err.message || 'Failed to accept offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-4 text-xs font-black uppercase tracking-widest text-rose-800">
          {error}
        </div>
      )}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-full bg-slate-950 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:bg-cyan-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <span className="relative z-10">{loading ? 'Processing...' : 'Accept Proposal'}</span>
      </button>
    </div>
  )
}

