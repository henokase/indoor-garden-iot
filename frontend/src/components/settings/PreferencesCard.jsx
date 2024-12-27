import { motion } from "framer-motion";
import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

// Utility functions for temperature conversion
const celsiusToFahrenheit = (celsius) => (celsius * 9/5) + 32;
const fahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5/9;
 
export function PreferencesCard({ formData = {}, onChange, isLoading = false }) {
  // Ensure formData has default values
  const preferences = {
    temperatureUnit: formData.temperatureUnit || 'C',
    minTemperatureThreshold: formData.minTemperatureThreshold ?? 25,
    maxTemperatureThreshold: formData.maxTemperatureThreshold ?? 25,
    minMoistureThreshold: formData.minMoistureThreshold ?? 50,
    maxMoistureThreshold: formData.maxMoistureThreshold ?? 80,
    lightingStartHour: formData.lightingStartHour ?? 6,
    lightingEndHour: formData.lightingEndHour ?? 18,
    fertilizerSchedule: formData.fertilizerSchedule || 'weekly',
    fertilizerTime: formData.fertilizerTime ?? 8,
    fertilizerMinute: formData.fertilizerMinute ?? 0,
    fertilizerDayOfWeek: formData.fertilizerDayOfWeek || 'Monday',
    fertilizerDayOfMonth: formData.fertilizerDayOfMonth ?? 1,
  };

  // Local state for displayed temperature values
  const [displayValues, setDisplayValues] = useState({
    minTemp: preferences.minTemperatureThreshold,
    maxTemp: preferences.maxTemperatureThreshold
  });

  // Update display values when temperature unit changes
  useEffect(() => {
    const minTemp = preferences.temperatureUnit === 'F' 
      ? celsiusToFahrenheit(preferences.minTemperatureThreshold)
      : preferences.minTemperatureThreshold;
    
    const maxTemp = preferences.temperatureUnit === 'F'
      ? celsiusToFahrenheit(preferences.maxTemperatureThreshold)
      : preferences.maxTemperatureThreshold;

    setDisplayValues({ minTemp, maxTemp });
  }, [preferences.temperatureUnit, preferences.minTemperatureThreshold, preferences.maxTemperatureThreshold]);

  // Custom handler for temperature-related changes
  const handleTempChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    // Convert to Celsius if in Fahrenheit mode
    const celsiusValue = preferences.temperatureUnit === 'F' 
      ? fahrenheitToCelsius(numValue)
      : numValue;

    // Update the display value
    setDisplayValues(prev => ({
      ...prev,
      [name === 'preferences.minTemperatureThreshold' ? 'minTemp' : 'maxTemp']: numValue
    }));

    // Create a synthetic event with the converted Celsius value
    const syntheticEvent = {
      target: {
        name,
        value: Math.round(celsiusValue)
      }
    };

    onChange(syntheticEvent);
  };

  // Get min/max values for temperature inputs based on unit
  const getTempRange = () => {
    if (preferences.temperatureUnit === 'F') {
      return {
        min: celsiusToFahrenheit(0),
        max: celsiusToFahrenheit(50)
      };
    }
    return { min: 0, max: 50 };
  };

  const tempRange = getTempRange();

  const SkeletonInput = () => (
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
  );

  const SkeletonSelect = () => (
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
  );

  return (
    <motion.div
      className="bg-green-50 dark:bg-gray-800 rounded-lg shadow-sm p-6"
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
          {isLoading ? (
            <SkeletonSelect />
          ) : (
            <select
              name="preferences.temperatureUnit"
              value={preferences.temperatureUnit}
              onChange={onChange}
            className="w-full bg-transparent text-black dark:text-white dark:bg-gray-800 select select-success"
            >
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
            </select>
          )}
        </div>

        {/* Min Temperature Threshold */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Min Temperature Threshold
          </label>
          {isLoading ? (
            <SkeletonInput />
          ) : (
            <input
              type="range"
              name="preferences.minTemperatureThreshold"
              value={displayValues.minTemp}
              onChange={handleTempChange}
              min={tempRange.min}
              max={tempRange.max}
              step="1"
            className="w-full range range-success range-sm"
            />
          )}
          {!isLoading && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {`${Math.round(displayValues.minTemp)}°${preferences.temperatureUnit}`}
            </span>
          )}
        </div>

        {/* Max Temperature Threshold */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Max Temperature Threshold
          </label>
          {isLoading ? (
            <SkeletonInput />
          ) : (
            <input
              type="range"
              name="preferences.maxTemperatureThreshold"
              value={displayValues.maxTemp}
              onChange={handleTempChange}
              min={tempRange.min}
              max={tempRange.max}
              step="1"
            className="w-full range range-success range-sm"
            />
          )}
          {!isLoading && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {`${Math.round(displayValues.maxTemp)}°${preferences.temperatureUnit}`}
            </span>
          )}
        </div>

        {/* Min Moisture Threshold */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Min Moisture Threshold (%)
          </label>
          {isLoading ? (
            <SkeletonInput />
          ) : (
            <input
              type="range"
              name="preferences.minMoistureThreshold"
              value={preferences.minMoistureThreshold}
              onChange={onChange}
              min="0"
              max="100"
            className="w-full range range-success range-sm"
            />
          )}
          {!isLoading && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {preferences.minMoistureThreshold}%
            </span>
          )}
        </div>

        {/* Max Moisture Threshold */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Max Moisture Threshold (%)
          </label>
          {isLoading ? (
            <SkeletonInput />
          ) : (
            <input
              type="range"
              name="preferences.maxMoistureThreshold"
              value={preferences.maxMoistureThreshold}
              onChange={onChange}
              min="0"
              max="100"
            className="w-full range range-success range-sm"
            />
          )}
          {!isLoading && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {preferences.maxMoistureThreshold}%
            </span>
          )}
        </div>

        {/* Lighting Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Lighting Start Hour
            </label>
            {isLoading ? (
              <SkeletonInput />
            ) : (
              <input
                type="number"
                name="preferences.lightingStartHour"
                value={preferences.lightingStartHour}
                onChange={onChange}
                min="0"
                max="23"
              className="w-full input input-success bg-transparent text-black dark:text-white"
              />
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Lighting End Hour
            </label>
            {isLoading ? (
              <SkeletonInput />
            ) : (
              <input
                type="number"
                name="preferences.lightingEndHour"
                value={preferences.lightingEndHour}
                onChange={onChange}
                min="0"
                max="23"
              className="w-full input input-success bg-transparent text-black dark:text-white"
              />
            )}
          </div>
        </div>

        {/* Fertilizer Schedule */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Fertilizer Schedule
          </label>
          {isLoading ? (
            <SkeletonSelect />
          ) : (
            <select
              name="preferences.fertilizerSchedule"
              value={preferences.fertilizerSchedule}
              onChange={onChange}
            className="select select-success w-full text-black dark:text-white bg-transparent dark:bg-gray-800"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>

        {/* Fertilizer Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Fertilizer Hour
            </label>
            {isLoading ? (
              <SkeletonInput />
            ) : (
              <input
                type="number"
                name="preferences.fertilizerTime"
                value={preferences.fertilizerTime}
                onChange={onChange}
                min="0"
                max="23"
                className="w-full input input-success bg-transparent text-black dark:text-white"
              />
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Fertilizer Minute
            </label>
            {isLoading ? (
              <SkeletonInput />
            ) : (
              <input
                type="number"
                name="preferences.fertilizerMinute"
                value={preferences.fertilizerMinute}
                onChange={onChange}
                min="0"
                max="59"
                className="w-full input input-success bg-transparent text-black dark:text-white"
              />
            )}
          </div>
        </div>

        {preferences.fertilizerSchedule === 'weekly' && (
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Fertilizer Day of Week
            </label>
            {isLoading ? (
              <SkeletonSelect />
            ) : (
              <select
                name="preferences.fertilizerDayOfWeek"
                value={preferences.fertilizerDayOfWeek}
                onChange={onChange}
              className="select select-success w-full text-black dark:text-white bg-transparent dark:bg-gray-800"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {preferences.fertilizerSchedule === 'monthly' && (
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Fertilizer Day of Month
            </label>
            {isLoading ? (
              <SkeletonInput />
            ) : (
              <input
                type="number"
                name="preferences.fertilizerDayOfMonth"
                value={preferences.fertilizerDayOfMonth}
                onChange={onChange}
                min="1"
                max="31"
              className="w-full input input-success bg-transparent text-black dark:text-white"
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}