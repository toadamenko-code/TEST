export interface FoodEntry {
  id: string
  user_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  description: string
  photo_url?: string
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  fiber_g?: number
  sugar_g?: number
  water_ml?: number
  ai_analysis?: AIFoodAnalysis
  recorded_at: string
}

export interface AIFoodAnalysis {
  foods: { name: string; portion: string }[]
  totals: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
  }
  confidence: 'high' | 'medium' | 'low'
}

export interface SupplementEntry {
  id: string
  user_id: string
  name: string
  dosage?: string
  taken: boolean
  recorded_at: string
}

export interface WaterEntry {
  id: string
  user_id: string
  amount_ml: number
  recorded_at: string
}

export interface MealPlan {
  id: string
  user_id: string
  week_start: string
  meals: MealPlanDay[]
  generated_by_ai: boolean
  cycle_phase_aware: boolean
  created_at: string
}

export interface MealPlanDay {
  date: string
  breakfast: string
  lunch: string
  dinner: string
  snacks: string[]
  notes?: string
}
