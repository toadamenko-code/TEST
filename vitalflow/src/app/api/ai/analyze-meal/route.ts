import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/claude/client'
import { AIFoodAnalysis } from '@/lib/types/nutrition'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null
    const mealType = formData.get('mealType') as string | null

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const mediaType = (imageFile.type || 'image/jpeg') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/gif'
      | 'image/webp'

    const userMessageText = mealType
      ? `What's in this ${mealType}? Please analyze it and return ONLY valid JSON in this exact format, no other text:\n{"foods": [{"name": "string", "portion": "string"}], "totals": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number}, "confidence": "high"|"medium"|"low"}`
      : `What's in this meal? Please analyze it and return ONLY valid JSON in this exact format, no other text:\n{"foods": [{"name": "string", "portion": "string"}], "totals": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number}, "confidence": "high"|"medium"|"low"}`

    const response = await anthropic.messages.create({
      model: MODELS.smart,
      max_tokens: 1024,
      system:
        'You are a nutrition expert analyzing meal photos. Be accurate and realistic with estimates — don\'t be overly generous or restrictive. Identify each food item visible, estimate portion sizes realistically, and calculate macros.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: userMessageText,
            },
          ],
        },
      ],
    })

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response
    let analysis: AIFoodAnalysis
    try {
      // Strip any markdown code fences if present
      const cleaned = responseText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim()
      analysis = JSON.parse(cleaned)
    } catch {
      // Graceful fallback on parse error
      analysis = {
        foods: [{ name: 'Unable to analyze', portion: 'unknown' }],
        totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
        confidence: 'low',
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('analyze-meal error:', error)
    return NextResponse.json({ error: 'Failed to analyze meal' }, { status: 500 })
  }
}
