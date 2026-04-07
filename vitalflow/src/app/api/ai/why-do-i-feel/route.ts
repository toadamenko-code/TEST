import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/claude/client'

interface WhyDoIFeelRequest {
  currentMood: number
  currentEnergy: number
  cyclePhase: string
  cycleDay: number
  last7DaysSleep: number[]
  last7DaysMood: number[]
  last7DaysSteps: number[]
  recentSymptoms: string[]
  recentMeals: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: WhyDoIFeelRequest = await request.json()

    const {
      currentMood,
      currentEnergy,
      cyclePhase,
      cycleDay,
      last7DaysSleep,
      last7DaysMood,
      last7DaysSteps,
      recentSymptoms,
      recentMeals,
    } = body

    const avgSleep =
      last7DaysSleep.length > 0
        ? (last7DaysSleep.reduce((a, b) => a + b, 0) / last7DaysSleep.length).toFixed(1)
        : 'unknown'

    const avgMood =
      last7DaysMood.length > 0
        ? (last7DaysMood.reduce((a, b) => a + b, 0) / last7DaysMood.length).toFixed(1)
        : 'unknown'

    const avgSteps =
      last7DaysSteps.length > 0
        ? Math.round(last7DaysSteps.reduce((a, b) => a + b, 0) / last7DaysSteps.length)
        : 'unknown'

    const userMessage = `Help me understand why I might be feeling mood ${currentMood}/5 and energy ${currentEnergy}/10. Here's my week:

Cycle: Day ${cycleDay} of my cycle (${cyclePhase} phase)

Sleep this week: ${last7DaysSleep.length > 0 ? last7DaysSleep.map((h, i) => `Day ${i + 1}: ${h}h`).join(', ') : 'no data'} — average ${avgSleep} hours/night

Mood this week: ${last7DaysMood.length > 0 ? last7DaysMood.map((m, i) => `Day ${i + 1}: ${m}/5`).join(', ') : 'no data'} — average ${avgMood}/5

Steps this week: ${last7DaysSteps.length > 0 ? last7DaysSteps.map((s, i) => `Day ${i + 1}: ${s.toLocaleString()}`).join(', ') : 'no data'} — average ${avgSteps.toLocaleString()} steps/day

Recent symptoms: ${recentSymptoms.length > 0 ? recentSymptoms.join(', ') : 'none reported'}

Recent meals: ${recentMeals.length > 0 ? recentMeals.join(', ') : 'none logged'}`

    const response = await anthropic.messages.create({
      model: MODELS.smart,
      max_tokens: 512,
      system: `You are a compassionate wellness coach who helps people understand the connection between their body, cycle, lifestyle, and how they feel. You analyze health patterns and explain them in warm, plain language. You always connect the dots between different data points.

Rules:
- Write like a caring, knowledgeable friend — not a doctor or a robot
- Be specific — reference actual numbers from their data
- Identify 2-3 key contributing factors
- End with ONE practical thing they can try tomorrow
- Keep it under 200 words
- Add "AI insight — not medical advice" at the end`,
      messages: [{ role: 'user', content: userMessage }],
    })

    const analysis =
      response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('why-do-i-feel error:', error)
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 })
  }
}
