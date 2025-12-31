'use server'

import { createClient } from '@/lib/supabase-server'
import { requireProfile } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function acceptOffer(offerId: string, requestId: string) {
  const profile = await requireProfile()
  
  if (profile.role !== 'student') {
    throw new Error('Only students can accept offers')
  }

  const supabase = await createClient()

  // Get the offer to verify it belongs to a request owned by this student
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select('*, requests!inner(*)')
    .eq('id', offerId)
    .eq('requests.student_id', profile.id)
    .single()

  if (offerError || !offer) {
    console.error('Error fetching offer:', offerError)
    throw new Error('Offer not found or unauthorized')
  }

  // Extract educator_id from offer
  const educatorId = offer.educator_id

  // Update offer status to accepted
  await supabase
    .from('offers')
    .update({ status: 'accepted' })
    .eq('id', offerId)

  // Reject all other offers for this request
  await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .eq('request_id', requestId)
    .neq('id', offerId)

  // Update request status to accepted
  await supabase
    .from('requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)

  // Create conversation (check if it already exists first)
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('request_id', requestId)
    .maybeSingle()

  let conversationId = existingConversation?.id

  if (!conversationId) {
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        request_id: requestId,
        student_id: profile.id,
        educator_id: educatorId,
      })
      .select()
      .single()

    if (conversationError) {
      console.error('Error creating conversation:', conversationError)
      // Don't throw - the offer was still accepted, but log the error
    } else {
      conversationId = conversation?.id
    }
  }

  revalidatePath(`/student/requests/${requestId}`)
  revalidatePath('/student')

  return { success: true, conversationId }
}

