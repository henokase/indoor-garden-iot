import { motion } from "framer-motion";
import { Settings2 } from "lucide-react";

export function PreferencesCard({ formData, onChange }) {
  // Ensure formData has default values
  const preferences = {
    temperatureUnit: 'C',
    minTemperatureThreshold: 25,
    maxTemperatureThreshold: 25,
    minMoistureThreshold: 50,
    maxMoistureThreshold: 80,
    lightingStartHour: 6,
    lightingEndHour: 18,
    fertilizerSchedule: 'weekly',
    fertilizerTime: 8,
    fertilizerDayOfWeek: 'Monday',
    fertilizerDayOfMonth: 1,
    ...formData // Override defaults with actual data
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Settings2 className="w-6 h-6 text-green-500" />
        <h2 className="text-lg font-medium">Preferences</h2>
      </div>

      <div className="space-y-6">
        {/* Temperature Unit */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Temperature Unit
          </label>
          <select
            name="preferences.temperatureUnit"
            value={preferences.temperatureUnit}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
              dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="C">Celsius (°C)</option>
            <option value="F">Fahrenheit (°F)</option>
          </select>
        </div>

        {/* Min Temperature Threshold */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Min Temperature Threshold
          </label>
          <input
            type="number"
            name="preferences.minTemperatureThreshold"
            value={preferences.minTemperatureThreshold}
            onChange={onChange}
            min="0"
            max="50"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
              dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        {/* Max Temperature Threshold */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Max Temperature Threshold
          </label>
          <input
            type="number"
            name="preferences.maxTemperatureThreshold"
            value={preferences.maxTemperatureThreshold}
            onChange={onChange}
            min="0"
            max="50"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
              dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        {/* Min Moisture Threshold */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Min Moisture Threshold (%)
          </label>
          <input
            type="number"
            name="preferences.minMoistureThreshold"
            value={preferences.minMoistureThreshold}
            onChange={onChange}
            min="0"
            max="100"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
              dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        {/* Max Moisture Threshold */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Max Moisture Threshold (%)
          </label>
          <input
            type="number"
            name="preferences.maxMoistureThreshold"
            value={preferences.maxMoistureThreshold}
            onChange={onChange}
            min="0"
            max="100"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
              dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        {/* Lighting Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Lighting Start Hour
            </label>
            <input
              type="number"
              name="preferences.lightingStartHour"
              value={preferences.lightingStartHour}
              onChange={onChange}
              min="0"
              max="23"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
                dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Lighting End Hour
            </label>
            <input
              type="number"
              name="preferences.lightingEndHour"
              value={preferences.lightingEndHour}
              onChange={onChange}
              min="0"
              max="23"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
                dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Fertilizer Schedule */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Fertilizer Schedule
          </label>
          <select
            name="preferences.fertilizerSchedule"
            value={preferences.fertilizerSchedule}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
              dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Fertilizer Time */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Fertilizer Time (Hour)
          </label>
          <input
            type="number"
            name="preferences.fertilizerTime"
            value={preferences.fertilizerTime}
            onChange={onChange}
            min="0"
            max="23"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
              dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        {preferences.fertilizerSchedule === 'weekly' && (
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Fertilizer Day of Week
            </label>
            <select
              name="preferences.fertilizerDayOfWeek"
              value={preferences.fertilizerDayOfWeek}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
                dark:border-gray-600 dark:bg-gray-800"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        )}

        {preferences.fertilizerSchedule === 'monthly' && (
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Fertilizer Day of Month
            </label>
            <input
              type="number"
              name="preferences.fertilizerDayOfMonth"
              value={preferences.fertilizerDayOfMonth}
              onChange={onChange}
              min="1"
              max="31"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 
                dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
} 