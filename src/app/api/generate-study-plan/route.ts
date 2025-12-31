import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { description, examDate } = await request.json()

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    // Use Hugging Face Inference API (free tier)
    // We'll use a small instruction-tuned model that's free
    const HF_API_URL = 'https://api-inference.huggingface.co/models/google/gemma-2b-it'
    
    // Calculate days until exam if date provided
    let daysUntilExam = ''
    if (examDate) {
      const days = Math.ceil(
        (new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      daysUntilExam = days > 0 ? `${days} days` : 'soon'
    }

    // Create a prompt for the AI
    const prompt = `Create a concise study plan for a student preparing for an exam. 

Request details:
${description}

${examDate ? `Exam date: ${examDate} (${daysUntilExam} away)` : 'Exam date: Not specified'}

Provide a structured study plan with 3-5 key steps or sessions. Be specific and actionable. Format as a numbered list.`

    // Call Hugging Face API
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: For free tier, you don't need an API key, but rate limits apply
        // If you want to use a key, add: 'Authorization': `Bearer ${process.env.HF_API_KEY}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      // If API fails, return a fallback plan
      console.error('HF API error:', response.statusText)
      return NextResponse.json({
        plan: generateFallbackPlan(description, examDate, daysUntilExam),
      })
    }

    const data = await response.json()
    
    // Extract the generated text
    let generatedText = ''
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text
    } else if (data.generated_text) {
      generatedText = data.generated_text
    } else if (typeof data === 'string') {
      generatedText = data
    }

    // Clean up the response
    generatedText = generatedText
      .replace(prompt, '')
      .trim()
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .join('\n')

    // If we got a valid response, use it; otherwise use fallback
    const plan = generatedText || generateFallbackPlan(description, examDate, daysUntilExam)

    return NextResponse.json({ plan })
  } catch (error: any) {
    console.error('Error generating study plan:', error)
    
    // Always return a fallback plan so the UI doesn't break
    const { description, examDate } = await request.json()
    return NextResponse.json({
      plan: generateFallbackPlan(description, examDate, ''),
    })
  }
}

// Fallback plan generator (simple template-based)
function generateFallbackPlan(description: string, examDate: string | null, daysUntilExam: string) {
  const days = examDate && daysUntilExam ? parseInt(daysUntilExam) : 7
  const sessions = Math.max(2, Math.min(5, Math.ceil(days / 2)))

  return `1. Initial Assessment & Topic Breakdown (Session 1)
   - Review the syllabus and identify key topics
   - Assess current understanding level
   - Create a priority list of topics to focus on

2. Core Concept Learning (Sessions 2-${sessions - 1})
   - Deep dive into fundamental concepts
   - Practice with examples and exercises
   - Address any knowledge gaps

3. Practice & Revision (Final Session)
   - Solve past exam questions
   - Review all key concepts
   - Final Q&A and clarification session

${examDate ? `Timeline: ${days} days with ${sessions} focused sessions` : 'Flexible timeline based on your pace'}`
}

