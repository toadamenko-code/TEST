import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/claude/client'
import { MealPlanDay } from '@/lib/types/nutrition'

interface MealPlanRequest {
  cyclePhase: string
  cycleDay: number
  dietaryPreferences: string[]
  healthGoals: string[]
  daysCount: number
}

export async function POST(request: NextRequest) {
  try {
    const body: MealPlanRequest = await request.json()

    const { cyclePhase, cycleDay, dietaryPreferences, healthGoals, daysCount } = body

    const preferencesText =
      dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'none'
    const goalsText = healthGoals.length > 0 ? healthGoals.join(', ') : 'general wellness'

    const userMessage = `Create a ${daysCount}-day meal plan for someone in their ${cyclePhase} phase (day ${cycleDay} of cycle). Dietary preferences: ${preferencesText}. Health goals: ${goalsText}. Return ONLY this JSON: {"days": [{"date": "Monday", "breakfast": "string", "lunch": "string", "dinner": "string", "snacks": ["string"]}]}`

    const response = await anthropic.messages.create({
      model: MODELS.smart,
      max_tokens: 2048,
      system: `You are a cycle-aware nutritionist creating personalized meal plans. You deeply understand how nutritional needs shift across the menstrual cycle:
- Menstrual phase: Iron-rich foods (leafy greens, lentils, red meat), anti-inflammatory omega-3s, warming foods, comfort without heaviness
- Follicular phase: Fresh, light foods, fermented foods for gut health, lean proteins, varied colorful vegetables
- Ovulation phase: Antioxidant-rich foods (berries, colorful veg), zinc (pumpkin seeds, oysters), fiber
- Luteal phase: Magnesium (dark chocolate, nuts, seeds, legumes), complex carbs to stabilize blood sugar, B6 (bananas, chickpeas), reduce caffeine

Rules:
- Always return valid JSON only, no other text
- Make meals delicious and realistic, not bland "diet food"
- Frame as nourishment and pleasure, not calorie control
- Respect dietary preferences strictly
- Include variety — don't repeat the same meals`,
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    let days: MealPlanDay[]
    try {
      const cleaned = responseText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim()
      const parsed = JSON.parse(cleaned)
      days = parsed.days
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse meal plan response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ days })
  } catch (error) {
    console.error('meal-plan error:', error)
    return NextResponse.json({ error: 'Failed to generate meal plan' }, { status: 500 })
  }
}
