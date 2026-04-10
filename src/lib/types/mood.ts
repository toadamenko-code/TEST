export interface MoodEntry {
  id: string
  user_id: string
  mood_score: number // 1-5
  energy_score: number // 1-10
  stress_score: number // 1-10
  notes?: string
  tags: string[]
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night'
  recorded_at: string
}

export interface SymptomEntry {
  id: string
  user_id: string
  symptoms: string[]
  severity: number // 1-5
  notes?: string
  recorded_at: string
}

export const MOOD_TAGS = [
  'anxious', 'calm', 'energized', 'tired', 'happy', 'sad',
  'focused', 'scattered', 'social', 'withdrawn', 'grateful', 'irritable',
  'motivated', 'unmotivated', 'creative', 'brain fog'
]

export const SYMPTOM_TAGS = [
  'headache', 'migraine', 'bloating', 'cramps', 'back pain',
  'fatigue', 'insomnia', 'nausea', 'brain fog', 'acne',
  'breast tenderness', 'mood swings', 'hot flashes', 'digestive issues',
  'joint pain', 'skin sensitivity', 'appetite changes'
]
