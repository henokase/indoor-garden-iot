import { motion } from 'framer-motion'
import { Bell, Info } from 'lucide-react'

export function AlertsCard({ formData, onChange }) {
  const alerts = formData.alerts || {
    enabled: false,
    temperatureMin: 18,
    temperatureMax: 30,
    moistureMin: 40,
    moistureMax: 80
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-yellow-500" />
          <h2 className="text-lg font-medium">Alert Settings</h2>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-800 
              text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
              whitespace-nowrap pointer-events-none">
              Alerts are in manual mode
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Temperature */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Temperature</h3>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Minimum (°{formData.preferences?.temperatureUnit || 'C'})
            </label>
            <input
              type="number"
              name="alerts.temperatureMin"
              value={alerts.temperatureMin}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 dark:border-gray-600 
                bg-transparent dark:bg-gray-800 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Maximum (°{formData.preferences?.temperatureUnit || 'C'})
            </label>
            <input
              type="number"
              name="alerts.temperatureMax"
              value={alerts.temperatureMax}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 dark:border-gray-600 
                bg-transparent dark:bg-gray-800 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Moisture */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Moisture</h3>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Minimum (%)
            </label>
            <input
              type="number"
              name="alerts.moistureMin"
              value={alerts.moistureMin}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 dark:border-gray-600 
                bg-transparent dark:bg-gray-800 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Maximum (%)
            </label>
            <input
              type="number"
              name="alerts.moistureMax"
              value={alerts.moistureMax}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 dark:border-gray-600 
                bg-transparent dark:bg-gray-800 focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
} 