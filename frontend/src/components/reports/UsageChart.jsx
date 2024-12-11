import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useResourceUsage } from '../../hooks/useResourceUsage'

export function UsageChart({ dateRange }) {
  const [selectedMetrics, setSelectedMetrics] = useState(['energy', 'water'])
  const { data: rawData, isLoading } = useResourceUsage(dateRange)

  const metrics = [
    { id: 'energy', label: 'Energy', color: '#22c55e', unit: 'kWh' },
    { id: 'water', label: 'Water', color: '#3b82f6', unit: 'L' }
  ]

  // Format data for Recharts
  const formattedData = rawData ? Object.entries(rawData).map(([timestamp, values]) => ({
    timestamp: new Date(timestamp).getTime(),
    energy: values.energy,
    water: values.water
  })).sort((a, b) => a.timestamp - b.timestamp) : []

  if (isLoading) {
    return <div className="h-[400px] flex items-center justify-center">Loading...</div>
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={() => {
              setSelectedMetrics(prev => 
                prev.includes(metric.id)
                  ? prev.filter(id => id !== metric.id)
                  : [...prev, metric.id]
              )
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedMetrics.includes(metric.id)
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()} 
              scale="time"
            />
            <YAxis yAxisId="energy" orientation="left" stroke="#22c55e" />
            <YAxis yAxisId="water" orientation="right" stroke="#3b82f6" />
            <Tooltip 
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
              formatter={(value, name, props) => {
                const metric = metrics.find(m => m.id === name)
                return [`${value} ${metric.unit}`, metric.label]
              }}
            />
            <Legend />
            {selectedMetrics.includes('energy') && (
              <Line
                yAxisId="energy"
                type="monotone"
                dataKey="energy"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Energy"
              />
            )}
            {selectedMetrics.includes('water') && (
              <Line
                yAxisId="water"
                type="monotone"
                dataKey="water"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Water"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 