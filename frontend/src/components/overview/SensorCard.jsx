import { motion } from 'framer-motion'
import { Thermometer } from 'lucide-react'

function SensorCard({ 
  title, 
  value, 
  unit, 
  color = "text-gray-500",
  icon: Icon = Thermometer,
  isLoading 
}) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    //   whileHover={{ y: -5 }}
    //   transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {title}
          </h3>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline mt-1">
              <span className={`text-3xl font-bold ${color}`}>
                {value}
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                {unit}
              </span>
            </div>
          )}
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </motion.div>
  )
}

export default SensorCard 