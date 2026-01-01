// Database table types
export interface Session {
  id: string
  session_key: string
  created_at: string
  last_active: string
}

export interface DailyEntry {
  id: string
  session_id: string
  date: string
  strength_workout: boolean
  other_workout_type?: string
  other_workout_completed: boolean
  pages_read: number
  supplements_morning: boolean
  supplements_night: boolean
  weight?: number
  body_fat_percentage?: number
  sleep_hours?: number
  calories_consumed?: number
  dog_training_minutes: number
  created_at: string
  updated_at: string
}

export interface WeeklyEntry {
  id: string
  session_id: string
  week_start_date: string
  work_blockers_unlocked: number
  family_house_hours: number
  created_at: string
  updated_at: string
}

export interface GoalsConfig {
  id: string
  session_id: string
  month_year: string
  strength_workouts_per_week: number
  pages_per_day: number
  target_weight?: number
  target_body_fat?: number
  dog_training_minutes_per_day: number
  family_hours_per_week: number
  work_blockers_per_week: number
  created_at: string
  updated_at: string
}

// Form types
export interface DailyEntryForm {
  date: string
  strength_workout: boolean
  other_workout_type: string
  other_workout_completed: boolean
  pages_read: number
  supplements_morning: boolean
  supplements_night: boolean
  weight: string
  body_fat_percentage: string
  sleep_hours: string
  calories_consumed: string
  dog_training_minutes: number
}

export interface WeeklyEntryForm {
  week_start_date: string
  work_blockers_unlocked: number
  family_house_hours: number
}

// App state types
export interface AppState {
  currentSession: Session | null
  isLoading: boolean
  error: string | null
}

// Chart data types
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface ProgressStats {
  totalDays: number
  completedDays: number
  streak: number
  completionRate: number
}