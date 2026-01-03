import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import { CalendarView } from '../components/CalendarView'
import { calculateDailyGoalStatus } from '../utils/analytics'

export const Calendar = () => {
  const { currentDate, setCurrentDate, dailyEntries } = useAppStore()
  const [selectedDate, setSelectedDate] = useState(currentDate)
  const navigate = useNavigate()

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  const handleGoToDaily = () => {
    navigate('/daily')
  }

  // Get selected date entry and stats
  const selectedEntry = dailyEntries.find(entry => entry.date === selectedDate)
  const selectedGoalStatus = selectedEntry ? calculateDailyGoalStatus(selectedEntry) : null

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-text-primary">Calendar View</h1>
        <button
          onClick={handleGoToDaily}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Go to Daily Log
        </button>
      </div>

      {/* Calendar Component */}
      <div className="mb-6">
        <CalendarView
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </div>

      {/* Selected Date Summary */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-dark-text-primary mb-4">
          {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
        </h3>

        {selectedGoalStatus ? (
          <div className="space-y-4">
            {/* Completion Score */}
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-accent-primary">
                {selectedGoalStatus.completionScore}/9
              </div>
              <div className="text-sm text-dark-text-secondary">Goals Completed</div>
              <div className={`text-sm font-medium ${
                selectedGoalStatus.completionScore >= 7 ? 'text-accent-success' :
                selectedGoalStatus.completionScore >= 5 ? 'text-accent-warning' :
                selectedGoalStatus.completionScore >= 3 ? 'text-orange-400' :
                selectedGoalStatus.completionScore >= 1 ? 'text-accent-error' :
                'text-dark-text-muted'
              }`}>
                {selectedGoalStatus.completionScore >= 7 ? 'Excellent Day! 🌟' :
                 selectedGoalStatus.completionScore >= 5 ? 'Good Progress 👍' :
                 selectedGoalStatus.completionScore >= 3 ? 'Making Progress 📈' :
                 selectedGoalStatus.completionScore >= 1 ? 'Getting Started 🚀' :
                 'No Goals Met'}
              </div>
            </div>

            {/* Goal Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Workouts */}
              <div className={`p-3 rounded-lg border ${
                (selectedGoalStatus.strengthWorkout || selectedGoalStatus.otherWorkout) 
                  ? 'bg-green-900/20 text-accent-success border-accent-success/30' 
                  : 'bg-red-900/20 text-accent-error border-accent-error/30'
              }`}>
                <div className="font-medium">💪 Workout</div>
                <div className="text-xs">
                  {selectedGoalStatus.strengthWorkout && selectedGoalStatus.otherWorkout ? 'Both completed' :
                   selectedGoalStatus.strengthWorkout ? 'Strength only' :
                   selectedGoalStatus.otherWorkout ? 'Other only' :
                   'Not completed'}
                </div>
              </div>

              {/* Reading */}
              <div className={`p-3 rounded-lg border ${
                selectedGoalStatus.reading ? 'bg-green-900/20 text-accent-success border-accent-success/30' : 'bg-red-900/20 text-accent-error border-accent-error/30'
              }`}>
                <div className="font-medium">📚 Reading</div>
                <div className="text-xs">
                  {selectedGoalStatus.reading ? '10+ pages read' : 'Less than 10 pages'}
                </div>
              </div>

              {/* Supplements */}
              <div className={`p-3 rounded-lg border ${
                (selectedGoalStatus.supplementsMorning && selectedGoalStatus.supplementsNight)
                  ? 'bg-green-900/20 text-accent-success border-accent-success/30' 
                  : (selectedGoalStatus.supplementsMorning || selectedGoalStatus.supplementsNight)
                  ? 'bg-yellow-900/20 text-accent-warning border-accent-warning/30'
                  : 'bg-red-900/20 text-accent-error border-accent-error/30'
              }`}>
                <div className="font-medium">💊 Supplements</div>
                <div className="text-xs">
                  {selectedGoalStatus.supplementsMorning && selectedGoalStatus.supplementsNight ? 'Both taken' :
                   selectedGoalStatus.supplementsMorning ? 'Morning only' :
                   selectedGoalStatus.supplementsNight ? 'Night only' :
                   'None taken'}
                </div>
              </div>

              {/* Dog Training */}
              <div className={`p-3 rounded-lg border ${
                selectedGoalStatus.dogTraining ? 'bg-green-900/20 text-accent-success border-accent-success/30' : 'bg-red-900/20 text-accent-error border-accent-error/30'
              }`}>
                <div className="font-medium">🐕 Dog Training</div>
                <div className="text-xs">
                  {selectedGoalStatus.dogTraining ? '30+ minutes' : 'Less than 30 min'}
                </div>
              </div>

              {/* Weight Tracking */}
              <div className={`p-3 rounded-lg border ${
                selectedGoalStatus.hasWeight ? 'bg-green-900/20 text-accent-success border-accent-success/30' : 'bg-red-900/20 text-accent-error border-accent-error/30'
              }`}>
                <div className="font-medium">⚖️ Weight</div>
                <div className="text-xs">
                  {selectedGoalStatus.hasWeight ? 'Logged' : 'Not logged'}
                </div>
              </div>

              {/* Sleep */}
              <div className={`p-3 rounded-lg border ${
                selectedGoalStatus.hasSleep ? 'bg-green-900/20 text-accent-success border-accent-success/30' : 'bg-red-900/20 text-accent-error border-accent-error/30'
              }`}>
                <div className="font-medium">😴 Sleep</div>
                <div className="text-xs">
                  {selectedGoalStatus.hasSleep ? 'Logged' : 'Not logged'}
                </div>
              </div>

              {/* Calories */}
              <div className={`p-3 rounded-lg border ${
                selectedGoalStatus.hasCalories ? 'bg-green-900/20 text-accent-success border-accent-success/30' : 'bg-red-900/20 text-accent-error border-accent-error/30'
              }`}>
                <div className="font-medium">🍽️ Calories</div>
                <div className="text-xs">
                  {selectedGoalStatus.hasCalories ? 'Logged' : 'Not logged'}
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mt-4 pt-4 border-t border-dark-border">
              <button
                onClick={() => {
                  setCurrentDate(selectedDate)
                  handleGoToDaily()
                }}
                className="w-full bg-accent-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {selectedEntry ? 'Edit This Day' : 'Log Data for This Day'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-dark-text-muted">
            <div className="text-4xl mb-2">📅</div>
            <p className="font-medium text-dark-text-secondary">No data logged for this day</p>
            <p className="text-sm mb-4">Start tracking your progress!</p>
            <button
              onClick={() => {
                setCurrentDate(selectedDate)
                handleGoToDaily()
              }}
              className="bg-accent-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Log Data for This Day
            </button>
          </div>
        )}
      </div>
    </div>
  )
}