import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { useAppStore } from '../stores/appStore'
import { useOptimistic } from '../hooks/useOptimistic'
import { DailyEntryForm } from '../lib/types'
import { FormFeedback } from '../components/FormFeedback'
import { WeeklyGoals } from '../components/WeeklyGoals'

export const DailyLog = () => {
  const { currentDate, setCurrentDate, dailyEntries, currentSession } = useAppStore()
  const { createDailyEntryOptimistic, updateDailyEntryOptimistic } = useOptimistic()
  
  const [formData, setFormData] = useState<DailyEntryForm>({
    date: currentDate,
    strength_workout: false,
    other_workout_type: '',
    other_workout_completed: false,
    pages_read: 0,
    supplements_morning: false,
    supplements_night: false,
    weight: '',
    body_fat_percentage: '',
    sleep_hours: '',
    calories_consumed: '',
    dog_training_minutes: 0,
  })
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Get today's entry if it exists
  const todayEntry = dailyEntries.find(entry => entry.date === currentDate)

  // Load existing data when date changes or entry is found
  useEffect(() => {
    if (todayEntry) {
      setFormData({
        date: todayEntry.date,
        strength_workout: todayEntry.strength_workout,
        other_workout_type: todayEntry.other_workout_type || '',
        other_workout_completed: todayEntry.other_workout_completed,
        pages_read: todayEntry.pages_read,
        supplements_morning: todayEntry.supplements_morning,
        supplements_night: todayEntry.supplements_night,
        weight: todayEntry.weight?.toString() || '',
        body_fat_percentage: todayEntry.body_fat_percentage?.toString() || '',
        sleep_hours: todayEntry.sleep_hours?.toString() || '',
        calories_consumed: todayEntry.calories_consumed?.toString() || '',
        dog_training_minutes: todayEntry.dog_training_minutes,
      })
    } else {
      // Reset form for new date
      setFormData(prev => ({
        ...prev,
        date: currentDate,
        strength_workout: false,
        other_workout_type: '',
        other_workout_completed: false,
        pages_read: 0,
        supplements_morning: false,
        supplements_night: false,
        weight: '',
        body_fat_percentage: '',
        sleep_hours: '',
        calories_consumed: '',
        dog_training_minutes: 0,
      }))
    }
  }, [currentDate, todayEntry])

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDateObj = createLocalDate(currentDate)
    const newDate = direction === 'prev' 
      ? subDays(currentDateObj, 1)
      : addDays(currentDateObj, 1)
    const newDateString = format(newDate, 'yyyy-MM-dd')
    
    setCurrentDate(newDateString)
    
    // Clear feedback and validation errors when changing dates
    setFeedback(null)
    setValidationErrors([])
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    // Validate numeric ranges
    if (formData.weight && (parseFloat(formData.weight) < 50 || parseFloat(formData.weight) > 600)) {
      errors.push('Weight must be between 50lbs and 600lbs')
    }
    
    if (formData.body_fat_percentage && (parseFloat(formData.body_fat_percentage) < 3 || parseFloat(formData.body_fat_percentage) > 50)) {
      errors.push('Body fat percentage must be between 3% and 50%')
    }
    
    if (formData.sleep_hours && (parseFloat(formData.sleep_hours) < 0 || parseFloat(formData.sleep_hours) > 24)) {
      errors.push('Sleep hours must be between 0 and 24')
    }
    
    if (formData.calories_consumed && (parseInt(formData.calories_consumed) < 0 || parseInt(formData.calories_consumed) > 10000)) {
      errors.push('Calories must be between 0 and 10,000')
    }
    
    if (formData.pages_read < 0 || formData.pages_read > 1000) {
      errors.push('Pages read must be between 0 and 1,000')
    }
    
    if (formData.dog_training_minutes < 0 || formData.dog_training_minutes > 1440) { // Max 24 hours
      errors.push('Dog training minutes must be between 0 and 1,440 (24 hours)')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSession) {
      setFeedback({ type: 'error', message: 'No session found. Please refresh the page.' })
      return
    }

    // Validate form
    const errors = validateForm()
    setValidationErrors(errors)
    
    if (errors.length > 0) {
      setFeedback({ type: 'error', message: `Please fix ${errors.length} validation error${errors.length > 1 ? 's' : ''}` })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const entryData = {
        session_id: currentSession.id,
        date: formData.date,
        strength_workout: formData.strength_workout,
        other_workout_type: formData.other_workout_type || undefined,
        other_workout_completed: formData.other_workout_completed,
        pages_read: formData.pages_read,
        supplements_morning: formData.supplements_morning,
        supplements_night: formData.supplements_night,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : undefined,
        sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : undefined,
        calories_consumed: formData.calories_consumed ? parseInt(formData.calories_consumed) : undefined,
        dog_training_minutes: formData.dog_training_minutes,
      }

      if (todayEntry) {
        // Update existing entry
        await updateDailyEntryOptimistic(todayEntry.id, entryData)
        setFeedback({ type: 'success', message: 'Entry updated successfully!' })
      } else {
        // Create new entry
        await createDailyEntryOptimistic(entryData)
        setFeedback({ type: 'success', message: 'Entry saved successfully!' })
      }
      
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000)
      
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message || 'Failed to save entry' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to create local date object from date string
  const createLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day) // month is 0-indexed
  }

  const isToday = currentDate === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="p-4 pb-20">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => handleDateChange('prev')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors tap-target focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Previous day, ${format(createLocalDate(format(subDays(createLocalDate(currentDate), 1), 'yyyy-MM-dd')), 'EEEE, MMMM d')}`}
        >
          <span className="sr-only">Previous day</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {format(createLocalDate(currentDate), 'EEEE')}
          </h1>
          <p className="text-sm text-gray-600">
            {format(createLocalDate(currentDate), 'MMMM d, yyyy')}
          </p>
          {isToday && <span className="text-xs text-blue-600 font-medium">Today</span>}
        </div>
        
        <button
          type="button"
          onClick={() => handleDateChange('next')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors tap-target focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Next day, ${format(createLocalDate(format(addDays(createLocalDate(currentDate), 1), 'yyyy-MM-dd')), 'EEEE, MMMM d')}`}
        >
          <span className="sr-only">Next day</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div className="mb-4">
          <FormFeedback 
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 space-y-2">
          {validationErrors.map((error, index) => (
            <FormFeedback 
              key={index}
              type="error"
              message={error}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Section */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2" role="img" aria-label="Workout">💪</span>
            Workout
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.strength_workout}
                onChange={(e) => setFormData(prev => ({ ...prev, strength_workout: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Strength workout completed</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other workout type
              </label>
              <input
                type="text"
                value={formData.other_workout_type}
                onChange={(e) => setFormData(prev => ({ ...prev, other_workout_type: e.target.value }))}
                placeholder="Running, padel, etc..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.other_workout_completed}
                onChange={(e) => setFormData(prev => ({ ...prev, other_workout_completed: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Other workout completed</span>
            </label>
          </div>
        </div>

        {/* Reading Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Reading</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pages read today
            </label>
            <input
              type="number"
              value={formData.pages_read}
              onChange={(e) => setFormData(prev => ({ ...prev, pages_read: parseInt(e.target.value) || 0 }))}
              min="0"
              placeholder="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Supplements Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💊 Supplements</h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.supplements_morning}
                onChange={(e) => setFormData(prev => ({ ...prev, supplements_morning: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Morning supplements taken</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.supplements_night}
                onChange={(e) => setFormData(prev => ({ ...prev, supplements_night: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Night supplements taken</span>
            </label>
          </div>
        </div>

        {/* Body Metrics Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚖️ Body Metrics</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="155.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Fat %
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.body_fat_percentage}
                onChange={(e) => setFormData(prev => ({ ...prev, body_fat_percentage: e.target.value }))}
                placeholder="15.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sleep & Nutrition Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">😴 Sleep & Nutrition</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep hours
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.sleep_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, sleep_hours: e.target.value }))}
                placeholder="8.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories consumed
              </label>
              <input
                type="number"
                value={formData.calories_consumed}
                onChange={(e) => setFormData(prev => ({ ...prev, calories_consumed: e.target.value }))}
                placeholder="2000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dog Training Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🐕 Dog Training</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training minutes
            </label>
            <input
              type="number"
              value={formData.dog_training_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, dog_training_minutes: parseInt(e.target.value) || 0 }))}
              min="0"
              placeholder="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting && (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          )}
          <span>{isSubmitting ? 'Saving...' : (todayEntry ? 'Update Entry' : 'Save Entry')}</span>
        </button>
      </form>

      {/* Weekly Goals Section */}
      <div className="mt-8">
        <WeeklyGoals currentDate={currentDate} />
      </div>
    </div>
  )
}