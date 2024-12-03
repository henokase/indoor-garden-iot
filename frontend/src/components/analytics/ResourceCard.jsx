import { motion } from 'framer-motion'

function ResourceCard({ title, value, unit, icon: Icon, isLoading }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    //   whileHover={{ y: -2 }}
    //   transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {value?.toFixed(1)}
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                {unit}
              </span>
            </div>
          )}
        </div>
        <Icon className="w-8 h-8 text-blue-500" />
      </div>
    </motion.div>
  )
}

export default ResourceCard 