import { motion } from 'framer-motion'

export function UsageStats({ title, icon, color, stats, unit, isLoading }) {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-green-50 rounded-lg shadow-sm p-6 dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className={color}>{icon}</div>
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3 dark:bg-gray-700"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
        </div>
      </div>
    )
  }

  // No data state
  if (!stats) {
    return (
      <div className="bg-green-50 rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className={color}>{icon}</div>
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
        <div className="text-gray-500 text-center py-4">
          No data available for the selected period
        </div>
      </div>
    )
  }

  const metrics = [
    { label: 'Daily Average', value: stats.daily },
    { label: 'Weekly Total', value: stats.weekly },
    { label: 'Period Total', value: stats.total }
  ]

  return (
    <div className="bg-green-50 rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className={color}>
          {icon}
        </div>
        <h2 className="text-lg font-medium">{title}</h2>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div 
            key={metric.label} 
            className="flex items-center justify-between"
          >
            <span className="text-gray-600 dark:text-gray-300">{metric.label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold">
                {typeof metric.value === 'number' 
                  ? metric.value.toLocaleString(undefined, { 
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1 
                    })
                  : '0.0'
                }
              </span>
              <span className="text-gray-500 text-sm">{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}