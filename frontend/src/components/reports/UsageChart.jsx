import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useResourceUsage } from '../../hooks/useResourceUsage'

export function UsageChart({ dateRange }) {
  const [selectedMetrics, setSelectedMetrics] = useState(['energy', 'water'])
  const { data: rawData = [], isLoading } = useResourceUsage(dateRange)

  const metrics = [
    { id: 'energy', label: 'Energy', color: '#22c55e', unit: 'kWh' },
    { id: 'water', label: 'Water', color: '#3b82f6', unit: 'L' }
  ]

  // Format data for Recharts
  const formattedData = rawData.map(usage => ({
    date: new Date(usage.date).toLocaleDateString(),
    energy: usage.energy?.total || 0,
    water: usage.water?.total || 0
  }))

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  const formatValue = (value, name) => {
    const metric = metrics.find(m => m.id === name.toLowerCase())
    if (!metric) return value
    return `${value} ${metric.unit}`
  }

  return (
    <div>
      <div className="flex gap-4 mb-4 max-sm:p-6">
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedMetrics.includes(metric.id)
                ? metric.id === 'energy' 
                  ? 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric'
                })
              }}
            />
            <YAxis yAxisId="energy" orientation="left" stroke="#22c55e" />
            <YAxis yAxisId="water" orientation="right" stroke="#3b82f6" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem'
              }}
              formatter={formatValue}
            />
            <Legend />
            {selectedMetrics.includes('energy') && (
              <Bar
                yAxisId="energy"
                dataKey="energy"
                name="Energy"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            )}
            {selectedMetrics.includes('water') && (
              <Bar
                yAxisId="water"
                dataKey="water"
                name="Water"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}