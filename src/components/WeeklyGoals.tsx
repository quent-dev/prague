import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { useAppStore } from '../stores/appStore'
import { useOptimistic } from '../hooks/useOptimistic'

interface WeeklyGoalsProps {
  currentDate: string
}

export const WeeklyGoals = ({ currentDate }: WeeklyGoalsProps) => {
  const { weeklyEntries, currentSession } = useAppStore()
  const { createWeeklyEntryOptimistic, updateWeeklyEntryOptimistic } = useOptimistic()
  
  // Get the start of the week for the current date
  const weekStartDate = format(startOfWeek(new Date(currentDate), { weekStartsOn: 1 }), 'yyyy-MM-dd') // Monday
  
  // Find existing weekly entry
  const weekEntry = weeklyEntries.find(entry => entry.week_start_date === weekStartDate)
  
  const [workBlockers, setWorkBlockers] = useState(weekEntry?.work_blockers_unlocked || 0)
  const [familyHours, setFamilyHours] = useState(weekEntry?.family_house_hours || 0)
  const [isUpdating, setIsUpdating] = useState(false)

  // Update local state when week entry changes
  useEffect(() => {
    setWorkBlockers(weekEntry?.work_blockers_unlocked || 0)
    setFamilyHours(weekEntry?.family_house_hours || 0)
  }, [weekEntry])

  const handleSaveWeekly = async () => {
    if (!currentSession) return

    setIsUpdating(true)
    try {
      const entryData = {
        session_id: currentSession.id,
        week_start_date: weekStartDate,
        work_blockers_unlocked: workBlockers,
        family_house_hours: familyHours,
      }

      if (weekEntry) {
        await updateWeeklyEntryOptimistic(weekEntry.id, entryData)
      } else {
        await createWeeklyEntryOptimistic(entryData)
      }
    } catch (error) {
      console.error('Failed to save weekly goals:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Get week range display
  const weekEnd = format(addDays(new Date(weekStartDate), 6), 'MMM d')
  const weekStart = format(new Date(weekStartDate), 'MMM d')
  const weekRange = `${weekStart} - ${weekEnd}`

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dark-text-primary">📅 Weekly Goals</h2>
        <span className="text-sm text-dark-text-muted">{weekRange}</span>
      </div>

      <div className="space-y-4">
        {/* Work Blockers */}
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">
            Work blocking points unlocked this week
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setWorkBlockers(Math.max(0, workBlockers - 1))}
              className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border hover:bg-dark-border text-dark-text-primary flex items-center justify-center"
            >
              −
            </button>
            <span className="text-lg font-medium min-w-[2rem] text-center text-dark-text-primary">{workBlockers}</span>
            <button
              type="button"
              onClick={() => setWorkBlockers(workBlockers + 1)}
              className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border hover:bg-dark-border text-dark-text-primary flex items-center justify-center"
            >
              +
            </button>
            <span className="text-sm text-dark-text-muted ml-2">/ 1 goal</span>
          </div>
        </div>

        {/* Family/House Hours */}
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">
            Family/house project hours this week
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setFamilyHours(Math.max(0, familyHours - 0.5))}
              className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border hover:bg-dark-border text-dark-text-primary flex items-center justify-center"
            >
              −
            </button>
            <span className="text-lg font-medium min-w-[3rem] text-center text-dark-text-primary">{familyHours.toFixed(1)}</span>
            <button
              type="button"
              onClick={() => setFamilyHours(familyHours + 0.5)}
              className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border hover:bg-dark-border text-dark-text-primary flex items-center justify-center"
            >
              +
            </button>
            <span className="text-sm text-dark-text-muted ml-2">hours / 2.0 goal</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSaveWeekly}
          disabled={isUpdating}
          className="w-full bg-accent-success text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isUpdating && (
            <div className="spinner w-4 h-4" />
          )}
          <span>{isUpdating ? 'Saving...' : 'Update Weekly Goals'}</span>
        </button>

        {/* Progress Indicators */}
        <div className="pt-2 border-t border-dark-border">
          <div className="space-y-2">
            {/* Work Blockers Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-text-secondary">Work Blockers</span>
              <span className={`font-medium ${workBlockers >= 1 ? 'text-accent-success' : 'text-dark-text-muted'}`}>
                {workBlockers >= 1 ? '✅ Complete' : `${workBlockers}/1`}
              </span>
            </div>
            
            {/* Family Hours Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-text-secondary">Family Hours</span>
              <span className={`font-medium ${familyHours >= 2 ? 'text-accent-success' : 'text-dark-text-muted'}`}>
                {familyHours >= 2 ? '✅ Complete' : `${familyHours.toFixed(1)}/2.0h`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}