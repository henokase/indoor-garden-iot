import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useSensorHistory } from '../../hooks/useSensorHistory'

export function SensorChart() {
  const [selectedMetric, setSelectedMetric] = useState('temperature')
  const { data: rawData, isLoading, error } = useSensorHistory(selectedMetric)

  const metrics = [
    { id: 'temperature', label: 'Temperature', color: '#f97316', bgColor: 'bg-orange-200 text-orange-900' },
    { id: 'moisture', label: 'Moisture', color: '#3b82f6', bgColor: 'bg-blue-200 text-blue-900' }
  ]

  // Format data for Recharts with validation
  const formattedData = useMemo(() => {
    if (!Array.isArray(rawData)) {
      console.warn('Expected array for rawData, got:', typeof rawData)
      return []
    }

    return rawData
      .filter(reading => reading && reading.timestamp && !isNaN(reading.value))
      .map(reading => ({
        timestamp: new Date(reading.timestamp).getTime(),
        value: Number(reading.value)
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [rawData])

  // Generate custom ticks for X-axis
  const formatXAxisTicks = () => {
    if (formattedData.length === 0) return []
    
    // Get min and max timestamps
    const minTime = Math.min(...formattedData.map(d => d.timestamp))
    const maxTime = Math.max(...formattedData.map(d => d.timestamp))
    
    // Calculate time difference in hours
    const diffHours = (maxTime - minTime) / (1000 * 60 * 60)
    
    // Determine tick count based on time range
    let tickCount = Math.min(6, formattedData.length) // default for < 24h
    if (diffHours > 24) {
      tickCount = Math.min(8, formattedData.length)
    }
    
    // Generate evenly spaced ticks
    const ticks = []
    const step = (maxTime - minTime) / (tickCount - 1)
    for (let i = 0; i < tickCount; i++) {
      const tickValue = minTime + (step * i)
      // Only add the tick if it's not already in the array
      if (!ticks.includes(tickValue)) {
        ticks.push(tickValue)
      }
    }
    
    return ticks
  }

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-pulse w-[96%] h-[96%] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 p-4">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedMetric === metric.id ? metric.bgColor : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300'}`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%" style={{ backgroundColor: 'transparent' }}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={formatXAxisTicks()}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp)
                const now = new Date()
                const diffHours = (now - date) / (1000 * 60 * 60)
                
                if (diffHours > 24) {
                  return date.toLocaleDateString()
                } else {
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              }}
              scale="time"
              stroke="#9CA3AF"
            />
            <YAxis 
              domain={selectedMetric === 'temperature' ? [0, 40] : [0, 100]}
              tickFormatter={(value) => `${value}${selectedMetric === 'temperature' ? '°C' : '%'}`}
              stroke="#9CA3AF"
            />
            <Tooltip 
              contentStyle={{ 
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
              formatter={(value) => [
                `${value}${selectedMetric === 'temperature' ? '°C' : '%'}`,
                selectedMetric === 'temperature' ? 'Temperature' : 'Moisture'
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={selectedMetric === 'temperature' ? '#f97316' : '#3b82f6'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 