export type MetricType =
  | 'steps'
  | 'distance_walking_running'
  | 'active_energy_burned'
  | 'exercise_minutes'
  | 'flights_climbed'
  | 'heart_rate'
  | 'resting_heart_rate'
  | 'heart_rate_variability'
  | 'sleep_hours'
  | 'sleep_deep'
  | 'sleep_rem'
  | 'sleep_core'
  | 'body_mass'
  | 'body_fat_percentage'
  | 'lean_body_mass'
  | 'workout_duration'
  | 'workout_calories'

export interface HealthMetric {
  id: string
  user_id: string
  metric_type: MetricType
  value: number
  unit: string
  source: string
  recorded_at: string
  created_at: string
}

export interface WorkoutEntry {
  id: string
  user_id: string
  workout_type: string
  duration_minutes: number
  calories: number
  distance_km?: number
  heart_rate_avg?: number
  heart_rate_max?: number
  notes?: string
  recorded_at: string
}

export interface Profile {
  id: string
  display_name?: string
  date_of_birth?: string
  height_cm?: number
  weight_goal_kg?: number
  dietary_preferences: string[]
  health_goals: string[]
  cycle_tracking_enabled: boolean
  average_cycle_length: number
  timezone: string
  created_at: string
}
