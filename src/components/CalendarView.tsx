import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from 'date-fns'
import { useAppStore } from '../stores/appStore'
import { calculateDailyGoalStatus } from '../utils/analytics'

interface CalendarViewProps {
  onDateSelect: (date: string) => void
  selectedDate: string
}

export const CalendarView = ({ onDateSelect, selectedDate }: CalendarViewProps) => {
  const { dailyEntries } = useAppStore()
  const [viewDate, setViewDate] = useState(new Date())

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart)
  
  // Create empty cells for days before month starts
  const emptyCells = Array.from({ length: startDay }, (_, i) => i)

  const getDayCompletionData = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const entry = dailyEntries.find(e => e.date === dateString)
    
    if (!entry) {
      return { score: 0, hasData: false }
    }

    const goalStatus = calculateDailyGoalStatus(entry)
    return { 
      score: goalStatus.completionScore, 
      hasData: true,
      entry: goalStatus
    }
  }

  const getCompletionColor = (score: number, hasData: boolean) => {
    if (!hasData) return 'bg-gray-100 text-gray-400'
    
    if (score >= 7) return 'bg-green-500 text-white'
    if (score >= 5) return 'bg-yellow-500 text-white'
    if (score >= 3) return 'bg-orange-500 text-white'
    if (score >= 1) return 'bg-red-500 text-white'
    return 'bg-gray-300 text-gray-600'
  }

  const getCompletionEmoji = (score: number, hasData: boolean) => {
    if (!hasData) return ''
    
    if (score >= 7) return '🟢'
    if (score >= 5) return '🟡'
    if (score >= 3) return '🟠'
    if (score >= 1) return '🔴'
    return '⚪'
  }

  const handlePrevMonth = () => {
    setViewDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setViewDate(prev => addMonths(prev, 1))
  }

  const handleDateClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    onDateSelect(dateString)
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors tap-target focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Previous month, ${format(subMonths(viewDate, 1), 'MMMM yyyy')}`}
        >
          <span className="sr-only">Previous month</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {format(viewDate, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors tap-target focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Next month, ${format(addMonths(viewDate, 1), 'MMMM yyyy')}`}
        >
          <span className="sr-only">Next month</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[
          { short: 'S', full: 'Sunday' },
          { short: 'M', full: 'Monday' }, 
          { short: 'T', full: 'Tuesday' },
          { short: 'W', full: 'Wednesday' },
          { short: 'T', full: 'Thursday' },
          { short: 'F', full: 'Friday' },
          { short: 'S', full: 'Saturday' }
        ].map((day, index) => (
          <div 
            key={index} 
            className="text-center text-xs font-medium text-gray-500 p-2"
            aria-label={day.full}
          >
            {day.short}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="h-10" />
        ))}
        
        {/* Month days */}
        {monthDays.map((date) => {
          const dateString = format(date, 'yyyy-MM-dd')
          const isSelected = dateString === selectedDate
          const isTodayDate = isToday(date)
          const completion = getDayCompletionData(date)
          
          return (
            <button
              key={dateString}
              onClick={() => handleDateClick(date)}
              className={`
                h-10 sm:h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 relative tap-target
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                ${isSelected 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : 'hover:scale-105 hover:shadow-md'
                }
                ${getCompletionColor(completion.score, completion.hasData)}
                ${isTodayDate && !isSelected ? 'ring-1 ring-blue-300' : ''}
              `}
              title={completion.hasData 
                ? `${format(date, 'MMM d')}: ${completion.score}/9 goals completed`
                : `${format(date, 'MMM d')}: No data logged`
              }
              aria-label={`${format(date, 'EEEE, MMMM d, yyyy')}${completion.hasData ? `, ${completion.score} out of 9 goals completed` : ', no data logged'}${isTodayDate ? ', today' : ''}`}
              aria-pressed={isSelected}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs leading-none">
                  {format(date, 'd')}
                </span>
                {completion.hasData && (
                  <span className="text-[8px] leading-none mt-0.5">
                    {getCompletionEmoji(completion.score, completion.hasData)}
                  </span>
                )}
              </div>
              
              {/* Today indicator */}
              {isTodayDate && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">Completion Legend:</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>7+ goals</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>5-6 goals</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>3-4 goals</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>1-2 goals</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>No goals</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>No data</span>
          </div>
        </div>
      </div>
    </div>
  )
}