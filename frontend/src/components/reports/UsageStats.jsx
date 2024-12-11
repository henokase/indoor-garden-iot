import { motion } from 'framer-motion'

export function UsageStats({ title, icon, color, metrics }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
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
            <span className="text-gray-600">{metric.label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold">{metric.value}</span>
              <span className="text-gray-500 text-sm">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 