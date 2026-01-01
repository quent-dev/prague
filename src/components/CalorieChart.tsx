import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendData } from '../utils/analytics'

interface CalorieChartProps {
  data: TrendData[]
  title: string
  className?: string
}

export const CalorieChart = ({ data, title, className = "" }: CalorieChartProps) => {
  // Filter out data points where calories is undefined
  const filteredData = data.filter(point => point.calories !== undefined)

  if (filteredData.length === 0) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🍽️</div>
          <p>No calorie data available yet</p>
          <p className="text-sm">Start logging your daily calories to see patterns!</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p style={{ color: payload[0].color }} className="text-sm">
            Calories: {payload[0].value?.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate calorie insights
  const averageCalories = filteredData.reduce((sum, d) => sum + (d.calories || 0), 0) / filteredData.length
  const maxCalories = Math.max(...filteredData.map(d => d.calories || 0))
  const minCalories = Math.min(...filteredData.map(d => d.calories || 0))
  const calorieVariance = maxCalories - minCalories

  // Estimate if calories are in healthy range (rough estimate)
  const healthyRange = averageCalories >= 1500 && averageCalories <= 2500
  const consistentIntake = calorieVariance <= 800 // Less than 800 calorie daily variation

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 11 }}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="calories"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="#fef3c7"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Calorie Insights */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Daily Average</div>
          <div className="flex items-center justify-center space-x-2">
            <span className={`font-medium ${healthyRange ? 'text-green-600' : 'text-amber-600'}`}>
              {averageCalories.toFixed(0)}
            </span>
            <span className="text-xs">
              {healthyRange ? '✅' : averageCalories < 1500 ? '⚠️' : '🔥'}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">calories</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Consistency</div>
          <div className="flex items-center justify-center space-x-2">
            <span className={`font-medium ${consistentIntake ? 'text-green-600' : 'text-orange-600'}`}>
              ±{(calorieVariance / 2).toFixed(0)}
            </span>
            <span className="text-xs">
              {consistentIntake ? '🎯' : '📊'}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">variance</div>
        </div>
      </div>
    </div>
  )
}