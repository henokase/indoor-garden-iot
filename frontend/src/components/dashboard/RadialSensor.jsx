import { motion } from "framer-motion"

export function RadialSensor({ title, value, unit, color, icon: Icon, min = 0, max = 100 }) {
  const percentage = value ? Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100) : 0

  return (
    <motion.div 
      className="bg-green-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={`font-medium ${color} mb-2`}>{title}</h3>
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <div className={`absolute inset-0 rounded-full border-8 border-green-100 dark:border-gray-900`} />
        
        {/* Progress circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            className={`${color} transition-all duration-700 ease-out`}
            style={{
              strokeDasharray: `${percentage} 100`,
              strokeWidth: '8px',
              fill: 'none',
              stroke: 'currentColor'
            }}
            r="47"
            cx="64"
            cy="64"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-6 h-6 ${color} mb-1`} />
          <span className={`text-2xl font-bold ${color}`}>
            {value?.toFixed(1)}
          </span>
          <span className="text-md text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
      </div>
    </motion.div>
  )
} 