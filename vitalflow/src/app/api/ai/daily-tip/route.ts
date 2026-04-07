import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/claude/client'

interface DailyTipRequest {
  cyclePhase: string
  cycleDay: number
  moodScore?: number
  energyScore?: number
  sleepHours?: number
  stepsToday?: number
  symptomsToday?: string[]
  lastMeals?: string[]
  dietaryPreferences?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: DailyTipRequest = await request.json()

    const {
      cyclePhase,
      cycleDay,
      moodScore,
      energyScore,
      sleepHours,
      stepsToday,
      symptomsToday,
      lastMeals,
      dietaryPreferences,
    } = body

    const parts: string[] = [
      `Today is day ${cycleDay} of my cycle (${cyclePhase} phase).`,
    ]

    if (moodScore !== undefined) parts.push(`My mood is ${moodScore}/5,`)
    if (energyScore !== undefined) parts.push(`energy ${energyScore}/10.`)
    if (sleepHours !== undefined) parts.push(`I slept ${sleepHours} hours.`)
    if (stepsToday !== undefined) parts.push(`Steps so far: ${stepsToday}.`)
    if (symptomsToday && symptomsToday.length > 0) {
      parts.push(`Recent symptoms: ${symptomsToday.join(', ')}.`)
    }
    if (lastMeals && lastMeals.length > 0) {
      parts.push(`Recent meals: ${lastMeals.join(', ')}.`)
    }
    if (dietaryPreferences && dietaryPreferences.length > 0) {
      parts.push(`Dietary preferences: ${dietaryPreferences.join(', ')}.`)
    }

    const userMessage = parts.join(' ')

    const response = await anthropic.messages.create({
      model: MODELS.fast,
      max_tokens: 256,
      system: `You are a warm, knowledgeable wellness coach and nutritionist. You give one specific, actionable daily tip based on the user's health data. You are cycle-aware — you always factor in where someone is in their menstrual cycle when making suggestions.

Rules:
- Keep response to 2-3 sentences max
- Be warm and personal, like a supportive friend
- Be specific — reference their actual data (cycle phase, symptoms, etc.)
- Frame nutrition as nourishment, not restriction
- Never use diet culture language (no "cheat days", no "guilt", no "burning off" food)
- Always add "AI suggestion — not medical advice" at the very end on a new line`,
      messages: [{ role: 'user', content: userMessage }],
    })

    const tip = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ tip })
  } catch (error) {
    console.error('daily-tip error:', error)
    return NextResponse.json({ error: 'Failed to generate tip' }, { status: 500 })
  }
}
