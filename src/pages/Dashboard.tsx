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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Progress Dashboard</h1>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{overallProgress.completedDays}</div>
            <div className="text-sm text-gray-600">Days Logged</div>
            <div className="text-xs text-gray-500">out of {overallProgress.totalDays}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{overallProgress.streak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
            <div className="text-xs text-gray-500">consecutive days</div>
          </div>
        </div>
      </div>
      
      {/* Weekly Goals Progress */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 This Week's Goals</h2>
        
        <div className="space-y-4">
          {/* Work Blockers */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Work Blockers</span>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (weeklyProgress.workBlockers.current / weeklyProgress.workBlockers.goal) * 100)}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${weeklyProgress.workBlockers.completed ? 'text-green-600' : 'text-gray-600'}`}>
                {weeklyProgress.workBlockers.current}/{weeklyProgress.workBlockers.goal}
              </span>
              {weeklyProgress.workBlockers.completed && <span className="text-green-600">✅</span>}
            </div>
          </div>
          
          {/* Family Hours */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Family Hours</span>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (weeklyProgress.familyHours.current / weeklyProgress.familyHours.goal) * 100)}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${weeklyProgress.familyHours.completed ? 'text-green-600' : 'text-gray-600'}`}>
                {weeklyProgress.familyHours.current.toFixed(1)}/{weeklyProgress.familyHours.goal}h
              </span>
              {weeklyProgress.familyHours.completed && <span className="text-green-600">✅</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Habit Streaks */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔥 Habit Streaks</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Workout Streak */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">💪 {workoutStreak.current}</div>
            <div className="text-xs text-gray-600">Workout Days</div>
            <div className="text-xs text-blue-600">{workoutStreak.completionRate.toFixed(0)}% rate</div>
          </div>
          
          {/* Reading Streak */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">📚 {readingStreak.current}</div>
            <div className="text-xs text-gray-600">Reading Days</div>
            <div className="text-xs text-green-600">{readingStreak.completionRate.toFixed(0)}% rate</div>
          </div>
          
          {/* Supplements Streak */}
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">💊 {supplementsStreak.current}</div>
            <div className="text-xs text-gray-600">Supplement Days</div>
            <div className="text-xs text-purple-600">{supplementsStreak.completionRate.toFixed(0)}% rate</div>
          </div>
          
          {/* Dog Training Streak */}
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">🐕 {dogTrainingStreak.current}</div>
            <div className="text-xs text-gray-600">Training Days</div>
            <div className="text-xs text-orange-600">{dogTrainingStreak.completionRate.toFixed(0)}% rate</div>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent Performance</h2>
        
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-indigo-600">{averageCompletionScore}</div>
          <div className="text-sm text-gray-600">Average Daily Score</div>
          <div className="text-xs text-gray-500">out of 9 goals (last 7 days)</div>
        </div>
        
        {/* Recent days grid */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 text-center mb-2">Last 7 Days</div>
          <div className="flex justify-center space-x-1">
            {recentEntries.slice(-7).map((day) => (
              <div 
                key={day.date}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                  day.completionScore >= 7 
                    ? 'bg-green-100 text-green-800' 
                    : day.completionScore >= 5 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
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
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🏆 Personal Bests</h2>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">💪 Longest Workout Streak:</span>
            <span className="font-medium">{workoutStreak.longest} days</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">📚 Longest Reading Streak:</span>
            <span className="font-medium">{readingStreak.longest} days</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">💊 Longest Supplement Streak:</span>
            <span className="font-medium">{supplementsStreak.longest} days</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">🐕 Longest Training Streak:</span>
            <span className="font-medium">{dogTrainingStreak.longest} days</span>
          </div>
        </div>
      </div>
    </div>
  )
}