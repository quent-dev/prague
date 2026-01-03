import { useAppStore } from '../stores/appStore'
import { 
  calculateProgressStats, 
  calculateHabitStreak, 
  calculateWeeklyProgress,
  calculateDailyGoalStatus,
  prepareTrendData 
} from '../utils/analytics'
import { TrendChart } from '../components/TrendChart'
import { SleepChart } from '../components/SleepChart'
import { CalorieChart } from '../components/CalorieChart'

export const Dashboard = () => {
  const { dailyEntries, weeklyEntries, currentDate } = useAppStore()

  // Calculate overall progress
  const overallProgress = calculateProgressStats(dailyEntries, 30)
  
  // Calculate individual habit streaks
  const workoutStreak = calculateHabitStreak(
    dailyEntries, 
    (entry) => entry.strength_workout || entry.other_workout_completed
  )
  
  
  const readingStreak = calculateHabitStreak(
    dailyEntries,
    (entry) => entry.pages_read >= 10
  )
  
  const supplementsStreak = calculateHabitStreak(
    dailyEntries,
    (entry) => entry.supplements_morning && entry.supplements_night
  )
  
  const dogTrainingStreak = calculateHabitStreak(
    dailyEntries,
    (entry) => entry.dog_training_minutes >= 30
  )
  
  // Calculate weekly progress
  const weeklyProgress = calculateWeeklyProgress(weeklyEntries, currentDate)
  
  // Calculate recent performance (last 7 days)
  const recentEntries = dailyEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })
    .map(calculateDailyGoalStatus)
  
  const averageCompletionScore = recentEntries.length > 0 
    ? Math.round((recentEntries.reduce((sum, day) => sum + day.completionScore, 0) / recentEntries.length) * 10) / 10
    : 0

  // Prepare trend data for charts
  const trendData14Days = prepareTrendData(dailyEntries, 14)
  const trendData7Days = prepareTrendData(dailyEntries, 7)

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-dark-text-primary mb-6">Progress Dashboard</h1>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-primary">{overallProgress.completedDays}</div>
            <div className="text-sm text-dark-text-secondary">Days Logged</div>
            <div className="text-xs text-dark-text-muted">out of {overallProgress.totalDays}</div>
          </div>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-success">{overallProgress.streak}</div>
            <div className="text-sm text-dark-text-secondary">Current Streak</div>
            <div className="text-xs text-dark-text-muted">consecutive days</div>
          </div>
        </div>
      </div>
      
      {/* Weekly Goals Progress */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-dark-text-primary mb-4">📅 This Week's Goals</h2>
        
        <div className="space-y-4">
          {/* Work Blockers */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-dark-text-secondary">Work Blockers</span>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-dark-surface rounded-full h-2 w-20">
                <div 
                  className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (weeklyProgress.workBlockers.current / weeklyProgress.workBlockers.goal) * 100)}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${weeklyProgress.workBlockers.completed ? 'text-accent-success' : 'text-dark-text-muted'}`}>
                {weeklyProgress.workBlockers.current}/{weeklyProgress.workBlockers.goal}
              </span>
              {weeklyProgress.workBlockers.completed && <span className="text-accent-success">✅</span>}
            </div>
          </div>
          
          {/* Family Hours */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-dark-text-secondary">Family Hours</span>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-dark-surface rounded-full h-2 w-20">
                <div 
                  className="bg-accent-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (weeklyProgress.familyHours.current / weeklyProgress.familyHours.goal) * 100)}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${weeklyProgress.familyHours.completed ? 'text-accent-success' : 'text-dark-text-muted'}`}>
                {weeklyProgress.familyHours.current.toFixed(1)}/{weeklyProgress.familyHours.goal}h
              </span>
              {weeklyProgress.familyHours.completed && <span className="text-accent-success">✅</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Habit Streaks */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-dark-text-primary mb-4">🔥 Habit Streaks</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Workout Streak */}
          <div className="text-center p-3 bg-dark-surface border border-dark-border rounded-lg">
            <div className="text-xl font-bold text-accent-primary">💪 {workoutStreak.current}</div>
            <div className="text-xs text-dark-text-muted">Workout Days</div>
            <div className="text-xs text-accent-primary">{workoutStreak.completionRate.toFixed(0)}% rate</div>
          </div>
          
          {/* Reading Streak */}
          <div className="text-center p-3 bg-dark-surface border border-dark-border rounded-lg">
            <div className="text-xl font-bold text-accent-success">📚 {readingStreak.current}</div>
            <div className="text-xs text-dark-text-muted">Reading Days</div>
            <div className="text-xs text-accent-success">{readingStreak.completionRate.toFixed(0)}% rate</div>
          </div>
          
          {/* Supplements Streak */}
          <div className="text-center p-3 bg-dark-surface border border-dark-border rounded-lg">
            <div className="text-xl font-bold text-purple-400">💊 {supplementsStreak.current}</div>
            <div className="text-xs text-dark-text-muted">Supplement Days</div>
            <div className="text-xs text-purple-400">{supplementsStreak.completionRate.toFixed(0)}% rate</div>
          </div>
          
          {/* Dog Training Streak */}
          <div className="text-center p-3 bg-dark-surface border border-dark-border rounded-lg">
            <div className="text-xl font-bold text-accent-warning">🐕 {dogTrainingStreak.current}</div>
            <div className="text-xs text-dark-text-muted">Training Days</div>
            <div className="text-xs text-accent-warning">{dogTrainingStreak.completionRate.toFixed(0)}% rate</div>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-dark-text-primary mb-4">📈 Recent Performance</h2>
        
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-indigo-400">{averageCompletionScore}</div>
          <div className="text-sm text-dark-text-secondary">Average Daily Score</div>
          <div className="text-xs text-dark-text-muted">out of 9 goals (last 7 days)</div>
        </div>
        
        {/* Recent days grid */}
        <div className="space-y-2">
          <div className="text-xs text-dark-text-muted text-center mb-2">Last 7 Days</div>
          <div className="flex justify-center space-x-1">
            {recentEntries.slice(-7).map((day) => (
              <div 
                key={day.date}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium border ${
                  day.completionScore >= 7 
                    ? 'bg-green-900/20 text-accent-success border-accent-success/30' 
                    : day.completionScore >= 5 
                    ? 'bg-yellow-900/20 text-accent-warning border-accent-warning/30'
                    : 'bg-red-900/20 text-accent-error border-accent-error/30'
                }`}
                title={`${day.date}: ${day.completionScore}/9 goals`}
              >
                {day.completionScore}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body Metrics Trends */}
      <div className="mb-6">
        <TrendChart
          data={trendData14Days}
          title="⚖️ Body Metrics (14 Days)"
          showWeight={true}
          showBodyFat={true}
        />
      </div>

      {/* Individual Metric Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Weight Only - 7 Days */}
        <TrendChart
          data={trendData7Days}
          title="📊 Weight Trend (7 Days)"
          showWeight={true}
          showBodyFat={false}
        />
        
        {/* Body Fat Only - 7 Days */}
        <TrendChart
          data={trendData7Days}
          title="📊 Body Fat Trend (7 Days)"
          showWeight={false}
          showBodyFat={true}
        />

        {/* Sleep Pattern Chart */}
        <SleepChart
          data={trendData14Days}
          title="😴 Sleep Patterns (14 Days)"
        />

        {/* Calorie Intake Chart */}
        <CalorieChart
          data={trendData14Days}
          title="🍽️ Calorie Intake (14 Days)"
        />
      </div>

      {/* Longest Streaks */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4">
        <h2 className="text-lg font-semibold text-dark-text-primary mb-4">🏆 Personal Bests</h2>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-text-secondary">💪 Longest Workout Streak:</span>
            <span className="font-medium text-dark-text-primary">{workoutStreak.longest} days</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-dark-text-secondary">📚 Longest Reading Streak:</span>
            <span className="font-medium text-dark-text-primary">{readingStreak.longest} days</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-dark-text-secondary">💊 Longest Supplement Streak:</span>
            <span className="font-medium text-dark-text-primary">{supplementsStreak.longest} days</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-dark-text-secondary">🐕 Longest Training Streak:</span>
            <span className="font-medium text-dark-text-primary">{dogTrainingStreak.longest} days</span>
          </div>
        </div>
      </div>
    </div>
  )
}