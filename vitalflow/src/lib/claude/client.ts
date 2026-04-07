import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODELS = {
  fast: 'claude-haiku-4-5-20251001',   // quick tips, daily check-ins
  smart: 'claude-sonnet-4-6',           // deep analysis, weekly digest, meal plans
} as const
