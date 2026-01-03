import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendData } from '../utils/analytics'

interface TrendChartProps {
  data: TrendData[]
  title: string
  showWeight?: boolean
  showBodyFat?: boolean
  className?: string
}

export const TrendChart = ({ 
  data, 
  title, 
  showWeight = true, 
  showBodyFat = true, 
  className = "" 
}: TrendChartProps) => {
  // Filter out data points where both values are undefined
  const filteredData = data.filter(point => 
    (showWeight && point.weight !== undefined) || 
    (showBodyFat && point.bodyFat !== undefined)
  )

  if (filteredData.length === 0) {
    return (
      <div className={`bg-dark-card border border-dark-border rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-dark-text-primary mb-4">{title}</h3>
        <div className="text-center py-8 text-dark-text-muted">
          <div className="text-4xl mb-2">📈</div>
          <p>No data available yet</p>
          <p className="text-sm">Start logging your metrics to see trends!</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-dark-text-primary">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value?.toFixed(1)} {entry.dataKey === 'weight' ? 'lbs' : '%'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-dark-card border border-dark-border rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-dark-text-primary mb-4">{title}</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#a3a3a3"
              fontSize={12}
              tick={{ fontSize: 11, fill: '#a3a3a3' }}
            />
            <YAxis 
              stroke="#a3a3a3"
              fontSize={12}
              tick={{ fontSize: 11, fill: '#a3a3a3' }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} />
            {showWeight && showBodyFat && <Legend />}
            
            {showWeight && (
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                connectNulls={false}
                name="Weight (lbs)"
              />
            )}
            
            {showBodyFat && (
              <Line
                type="monotone"
                dataKey="bodyFat"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                connectNulls={false}
                name="Body Fat (%)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {showWeight && filteredData.some(d => d.weight !== undefined) && (
          <div className="text-center">
            <div className="text-xs text-dark-text-muted mb-1">Weight Trend</div>
            <div className="flex items-center justify-center space-x-2">
              {(() => {
                const weights = filteredData.filter(d => d.weight !== undefined).map(d => d.weight!)
                if (weights.length < 2) return <span className="text-dark-text-muted">Need more data</span>
                
                const first = weights[0]
                const last = weights[weights.length - 1]
                const change = last - first
                const isPositive = change > 0
                
                return (
                  <>
                    <span className={`font-medium ${isPositive ? 'text-accent-error' : 'text-accent-success'}`}>
                      {isPositive ? '+' : ''}{change.toFixed(1)} lbs
                    </span>
                    <span className="text-xs">
                      {isPositive ? '📈' : '📉'}
                    </span>
                  </>
                )
              })()}
            </div>
          </div>
        )}
        
        {showBodyFat && filteredData.some(d => d.bodyFat !== undefined) && (
          <div className="text-center">
            <div className="text-xs text-dark-text-muted mb-1">Body Fat Trend</div>
            <div className="flex items-center justify-center space-x-2">
              {(() => {
                const bodyFats = filteredData.filter(d => d.bodyFat !== undefined).map(d => d.bodyFat!)
                if (bodyFats.length < 2) return <span className="text-dark-text-muted">Need more data</span>
                
                const first = bodyFats[0]
                const last = bodyFats[bodyFats.length - 1]
                const change = last - first
                const isPositive = change > 0
                
                return (
                  <>
                    <span className={`font-medium ${isPositive ? 'text-accent-error' : 'text-accent-success'}`}>
                      {isPositive ? '+' : ''}{change.toFixed(1)}%
                    </span>
                    <span className="text-xs">
                      {isPositive ? '📈' : '📉'}
                    </span>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}