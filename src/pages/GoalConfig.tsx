import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useAppStore } from '../stores/appStore'
import { useOptimistic } from '../hooks/useOptimistic'
// GoalsConfig type is used in the component
import { FormFeedback } from '../components/FormFeedback'

export const GoalConfig = () => {
  const { currentSession, goalsConfig } = useAppStore()
  const { createGoalsConfigOptimistic, updateGoalsConfigOptimistic } = useOptimistic()
  
  const [currentMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [formData, setFormData] = useState({
    strength_workouts_per_week: 3,
    pages_per_day: 10,
    target_weight: '',
    target_body_fat: '',
    dog_training_minutes_per_day: 30,
    family_hours_per_week: 2,
    work_blockers_per_week: 1,
  })
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Get current month's config if it exists
  const currentConfig = goalsConfig.find(config => config.month_year === currentMonth)

  // Load existing config when component mounts
  useEffect(() => {
    if (currentConfig) {
      setFormData({
        strength_workouts_per_week: currentConfig.strength_workouts_per_week,
        pages_per_day: currentConfig.pages_per_day,
        target_weight: currentConfig.target_weight?.toString() || '',
        target_body_fat: currentConfig.target_body_fat?.toString() || '',
        dog_training_minutes_per_day: currentConfig.dog_training_minutes_per_day,
        family_hours_per_week: currentConfig.family_hours_per_week,
        work_blockers_per_week: currentConfig.work_blockers_per_week,
      })
    }
  }, [currentConfig])

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (formData.strength_workouts_per_week < 0 || formData.strength_workouts_per_week > 7) {
      errors.push('Strength workouts per week must be between 0 and 7')
    }
    
    if (formData.pages_per_day < 0 || formData.pages_per_day > 100) {
      errors.push('Pages per day must be between 0 and 100')
    }
    
    if (formData.target_weight && (parseFloat(formData.target_weight) < 50 || parseFloat(formData.target_weight) > 600)) {
      errors.push('Target weight must be between 50lbs and 600lbs')
    }
    
    if (formData.target_body_fat && (parseFloat(formData.target_body_fat) < 3 || parseFloat(formData.target_body_fat) > 50)) {
      errors.push('Target body fat must be between 3% and 50%')
    }
    
    if (formData.dog_training_minutes_per_day < 0 || formData.dog_training_minutes_per_day > 240) {
      errors.push('Dog training minutes per day must be between 0 and 240 (4 hours)')
    }
    
    if (formData.family_hours_per_week < 0 || formData.family_hours_per_week > 168) {
      errors.push('Family hours per week must be between 0 and 168')
    }
    
    if (formData.work_blockers_per_week < 0 || formData.work_blockers_per_week > 20) {
      errors.push('Work blockers per week must be between 0 and 20')
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
      const configData = {
        session_id: currentSession.id,
        month_year: currentMonth,
        strength_workouts_per_week: formData.strength_workouts_per_week,
        pages_per_day: formData.pages_per_day,
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : undefined,
        target_body_fat: formData.target_body_fat ? parseFloat(formData.target_body_fat) : undefined,
        dog_training_minutes_per_day: formData.dog_training_minutes_per_day,
        family_hours_per_week: formData.family_hours_per_week,
        work_blockers_per_week: formData.work_blockers_per_week,
      }

      if (currentConfig) {
        // Update existing config
        await updateGoalsConfigOptimistic(currentConfig.id, configData)
        setFeedback({ type: 'success', message: 'Goals updated successfully!' })
      } else {
        // Create new config
        await createGoalsConfigOptimistic(configData)
        setFeedback({ type: 'success', message: 'Goals configured successfully!' })
      }
      
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000)
      
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message || 'Failed to save goals configuration' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetToDefaults = () => {
    setFormData({
      strength_workouts_per_week: 3,
      pages_per_day: 10,
      target_weight: '',
      target_body_fat: '',
      dog_training_minutes_per_day: 30,
      family_hours_per_week: 2,
      work_blockers_per_week: 1,
    })
    setValidationErrors([])
    setFeedback({ type: 'info', message: 'Reset to default values' })
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goal Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure your goals for {format(new Date(currentMonth), 'MMMM yyyy')}
          </p>
        </div>
        <button
          type="button"
          onClick={resetToDefaults}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset Defaults
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
        {/* Workout Goals */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💪 Workout Goals</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strength workouts per week
            </label>
            <input
              type="number"
              value={formData.strength_workouts_per_week}
              onChange={(e) => setFormData(prev => ({ ...prev, strength_workouts_per_week: parseInt(e.target.value) || 0 }))}
              min="0"
              max="7"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 3 workouts per week</p>
          </div>
        </div>

        {/* Reading Goals */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Reading Goals</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pages to read per day
            </label>
            <input
              type="number"
              value={formData.pages_per_day}
              onChange={(e) => setFormData(prev => ({ ...prev, pages_per_day: parseInt(e.target.value) || 0 }))}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 10 pages per day</p>
          </div>
        </div>

        {/* Body Goals */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚖️ Body Goals</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.target_weight}
                onChange={(e) => setFormData(prev => ({ ...prev, target_weight: e.target.value }))}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target body fat (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.target_body_fat}
                onChange={(e) => setFormData(prev => ({ ...prev, target_body_fat: e.target.value }))}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Target values are optional and used for progress tracking</p>
        </div>

        {/* Dog Training Goals */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🐕 Dog Training Goals</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training minutes per day
            </label>
            <input
              type="number"
              value={formData.dog_training_minutes_per_day}
              onChange={(e) => setFormData(prev => ({ ...prev, dog_training_minutes_per_day: parseInt(e.target.value) || 0 }))}
              min="0"
              max="240"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 30 minutes per day</p>
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Weekly Goals</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family/house hours per week
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.family_hours_per_week}
                onChange={(e) => setFormData(prev => ({ ...prev, family_hours_per_week: parseFloat(e.target.value) || 0 }))}
                min="0"
                max="168"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 2 hours per week</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work blockers to unlock per week
              </label>
              <input
                type="number"
                value={formData.work_blockers_per_week}
                onChange={(e) => setFormData(prev => ({ ...prev, work_blockers_per_week: parseInt(e.target.value) || 0 }))}
                min="0"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 1 blocker per week</p>
            </div>
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
          <span>{isSubmitting ? 'Saving...' : (currentConfig ? 'Update Goals' : 'Save Goals')}</span>
        </button>
      </form>

      {/* Goal History */}
      {goalsConfig.length > 0 && (
        <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📜 Goal History</h3>
          <div className="space-y-2">
            {goalsConfig
              .sort((a, b) => b.month_year.localeCompare(a.month_year))
              .map((config) => (
                <div key={config.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">
                    {format(new Date(config.month_year + '-01'), 'MMMM yyyy')}
                  </span>
                  <div className="text-sm text-gray-600">
                    {config.strength_workouts_per_week}x workouts, {config.pages_per_day} pages/day
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}