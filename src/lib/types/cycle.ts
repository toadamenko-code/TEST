export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export interface CycleEntry {
  id: string
  user_id: string
  entry_type: 'period_start' | 'period_end' | 'ovulation' | 'symptom' | 'intimacy'
  flow_level?: 'light' | 'medium' | 'heavy' | 'spotting'
  symptoms?: string[]
  notes?: string
  recorded_at: string
}

export interface CyclePhaseInfo {
  phase: CyclePhase
  dayInCycle: number
  daysUntilNextPeriod: number
  daysUntilOvulation: number
  label: string
  description: string
  nutritionTip: string
  energyLevel: 'low' | 'moderate' | 'high'
  color: string
}
