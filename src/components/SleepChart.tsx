import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendData } from '../utils/analytics'

interface SleepChartProps {
  data: TrendData[]
  title: string
  className?: string
}

export const SleepChart = ({ data, title, className = "" }: SleepChartProps) => {
  // Filter out data points where sleep is undefined
  const filteredData = data.filter(point => point.sleep !== undefined)

  if (filteredData.length === 0) {
    return (
      <div className={`bg-dark-card border border-dark-border rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-dark-text-primary mb-4">{title}</h3>
        <div className="text-center py-8 text-dark-text-muted">
          <div className="text-4xl mb-2">😴</div>
          <p>No sleep data available yet</p>
          <p className="text-sm">Start logging your sleep hours to see patterns!</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-surface border border-dark-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-dark-text-primary">{label}</p>
          <p style={{ color: payload[0].color }} className="text-sm">
            Sleep: {payload[0].value?.toFixed(1)} hours
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate sleep quality indicators
  const averageSleep = filteredData.reduce((sum, d) => sum + (d.sleep || 0), 0) / filteredData.length
  const optimalNights = filteredData.filter(d => (d.sleep || 0) >= 7 && (d.sleep || 0) <= 9).length
  const sleepQualityPercentage = (optimalNights / filteredData.length) * 100

  return (
    <div className={`bg-dark-card border border-dark-border rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-dark-text-primary mb-4">{title}</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#a3a3a3"
              fontSize={12}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              stroke="#a3a3a3"
              fontSize={12}
              tick={{ fontSize: 11 }}
              domain={[0, 12]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="sleep"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Sleep Quality Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-xs text-dark-text-muted mb-1">Average Sleep</div>
          <div className="flex items-center justify-center space-x-2">
            <span className="font-medium text-purple-600">
              {averageSleep.toFixed(1)} hrs
            </span>
            <span className="text-xs">
              {averageSleep >= 7 && averageSleep <= 9 ? '😴' : averageSleep < 7 ? '😵' : '🥱'}
            </span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-dark-text-muted mb-1">Optimal Sleep</div>
          <div className="flex items-center justify-center space-x-2">
            <span className={`font-medium ${sleepQualityPercentage >= 70 ? 'text-green-600' : sleepQualityPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {sleepQualityPercentage.toFixed(0)}%
            </span>
            <span className="text-xs">
              {sleepQualityPercentage >= 70 ? '🌟' : sleepQualityPercentage >= 50 ? '👍' : '⚠️'}
            </span>
          </div>
          <div className="text-xs text-dark-text-muted mt-1">7-9 hours</div>
        </div>
      </div>
    </div>
  )
}