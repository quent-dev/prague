import { DailyEntry, WeeklyEntry, ProgressStats } from '../lib/types'
import { format, subDays, startOfWeek } from 'date-fns'

export interface HabitStreak {
  current: number
  longest: number
  completionRate: number
}

export interface DailyGoalStatus {
  date: string
  strengthWorkout: boolean
  otherWorkout: boolean
  reading: boolean // 10+ pages
  supplementsMorning: boolean
  supplementsNight: boolean
  dogTraining: boolean // 30+ minutes
  hasWeight: boolean
  hasSleep: boolean
  hasCalories: boolean
  completionScore: number // 0-9 based on goals met
}

// Calculate if daily goals are met
export const calculateDailyGoalStatus = (entry: DailyEntry): DailyGoalStatus => {
  const reading = entry.pages_read >= 10
  const dogTraining = entry.dog_training_minutes >= 30
  
  const goals = [
    entry.strength_workout || entry.other_workout_completed, // Any workout
    reading,
    entry.supplements_morning,
    entry.supplements_night,
    dogTraining,
    entry.weight !== null && entry.weight !== undefined,
    entry.sleep_hours !== null && entry.sleep_hours !== undefined,
    entry.calories_consumed !== null && entry.calories_consumed !== undefined,
    entry.body_fat_percentage !== null && entry.body_fat_percentage !== undefined
  ]
  
  const completionScore = goals.filter(Boolean).length
  
  return {
    date: entry.date,
    strengthWorkout: entry.strength_workout,
    otherWorkout: entry.other_workout_completed,
    reading,
    supplementsMorning: entry.supplements_morning,
    supplementsNight: entry.supplements_night,
    dogTraining,
    hasWeight: entry.weight !== null && entry.weight !== undefined,
    hasSleep: entry.sleep_hours !== null && entry.sleep_hours !== undefined,
    hasCalories: entry.calories_consumed !== null && entry.calories_consumed !== undefined,
    completionScore
  }
}

// Calculate streak for a specific habit
export const calculateHabitStreak = (
  entries: DailyEntry[], 
  habitChecker: (entry: DailyEntry) => boolean,
  totalDays = 30
): HabitStreak => {
  if (entries.length === 0) {
    return { current: 0, longest: 0, completionRate: 0 }
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let completedDays = 0
  let currentStreakBroken = false
  
  // Calculate streaks (from most recent day backwards)
  const today = new Date()
  const todayString = format(today, 'yyyy-MM-dd')
  
  for (let i = 0; i < totalDays; i++) {
    const checkDate = format(subDays(today, i), 'yyyy-MM-dd')
    const entry = sortedEntries.find(e => e.date === checkDate)
    const habitMet = entry ? habitChecker(entry) : false
    
    if (habitMet) {
      // Count for completion rate
      completedDays++
      
      // Track temporary streak for longest calculation
      tempStreak++
      
      // Track current streak (only count consecutive days from today)
      if (!currentStreakBroken) {
        currentStreak++
      }
    } else {
      // Habit not completed this day
      // Break current streak counting (but keep the count we have so far)
      currentStreakBroken = true
      
      // Check if we need to update longest streak
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
      
      // Reset temp streak for next potential streak
      tempStreak = 0
    }
  }
  
  // Check if the final temp streak is the longest
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak
  }
  
  const completionRate = (completedDays / totalDays) * 100
  
  return {
    current: currentStreak,
    longest: longestStreak,
    completionRate
  }
}

// Calculate overall progress stats
export const calculateProgressStats = (entries: DailyEntry[], totalDays = 30): ProgressStats => {
  const totalTargetDays = totalDays
  const completedDays = entries.length
  
  // Calculate current streak based on consecutive days with entries
  let currentStreak = 0
  const today = format(new Date(), 'yyyy-MM-dd')
  let checkDate = today
  
  // Count consecutive days with entries from today backwards
  for (let i = 0; i < totalDays; i++) {
    const hasEntry = entries.some(e => e.date === checkDate)
    if (hasEntry) {
      currentStreak++
    } else {
      // Break on first missing day
      break
    }
    checkDate = format(subDays(new Date(checkDate), 1), 'yyyy-MM-dd')
  }
  
  const completionRate = (completedDays / totalTargetDays) * 100
  
  return {
    totalDays: totalTargetDays,
    completedDays,
    streak: currentStreak,
    completionRate
  }
}

// Calculate weekly goals progress
export const calculateWeeklyProgress = (weeklyEntries: WeeklyEntry[], currentDate: string) => {
  const weekStart = startOfWeek(new Date(currentDate), { weekStartsOn: 1 }) // Monday
  const weekStartString = format(weekStart, 'yyyy-MM-dd')
  
  const currentWeekEntry = weeklyEntries.find(entry => entry.week_start_date === weekStartString)
  
  return {
    workBlockers: {
      current: currentWeekEntry?.work_blockers_unlocked || 0,
      goal: 1,
      completed: (currentWeekEntry?.work_blockers_unlocked || 0) >= 1
    },
    familyHours: {
      current: currentWeekEntry?.family_house_hours || 0,
      goal: 2,
      completed: (currentWeekEntry?.family_house_hours || 0) >= 2
    }
  }
}

// Generate last N days for charts
export const generateDateRange = (days: number): string[] => {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return dates
}

// Prepare chart data for all metrics trends
export interface TrendData {
  date: string
  weight?: number
  bodyFat?: number
  sleep?: number
  calories?: number
  displayDate: string
}

export const prepareTrendData = (entries: DailyEntry[], days = 14): TrendData[] => {
  const dateRange = generateDateRange(days)
  
  return dateRange.map(date => {
    const entry = entries.find(e => e.date === date)
    return {
      date,
      weight: entry?.weight || undefined,
      bodyFat: entry?.body_fat_percentage || undefined,
      sleep: entry?.sleep_hours || undefined,
      calories: entry?.calories_consumed || undefined,
      displayDate: format(new Date(date), 'MMM d')
    }
  })
}