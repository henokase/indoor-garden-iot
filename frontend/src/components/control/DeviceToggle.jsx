import { motion } from 'framer-motion'

function DeviceToggle({ 
  title, 
  icon: Icon, 
  isEnabled, 
  isLoading, 
  isDisabled, 
  onToggle 
}) {
  return (
    <motion.div
      className={`
        relative p-4 rounded-lg border-2
        ${isEnabled 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}
        ${isDisabled ? 'opacity-50' : ''}
      `}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <button
        className="w-full text-left"
        onClick={onToggle}
        disabled={isLoading || isDisabled}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="font-medium text-gray-900 dark:text-white">
              {title}
            </span>
          </div>

          <motion.div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${isEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
            `}
            animate={{ rotate: isEnabled ? 360 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white text-xs">
              {isEnabled ? 'ON' : 'OFF'}
            </span>
          </motion.div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </button>
    </motion.div>
  )
}

export default DeviceToggle 