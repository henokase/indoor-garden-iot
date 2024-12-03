import { motion } from 'framer-motion'
import { AlertTriangle, Thermometer, Droplets } from 'lucide-react'
import FormField from './FormField'
import { Button } from '../common/Button'

function AlertForm({ settings, isLoading, onSubmit, isSubmitting }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onSubmit({
      temperatureMin: Number(formData.get('temperatureMin')),
      temperatureMax: Number(formData.get('temperatureMax')),
      moistureMin: Number(formData.get('moistureMin')),
      moistureMax: Number(formData.get('moistureMax'))
    })
  }

  return (
    <motion.form
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Alert Thresholds
        </h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Temperature Thresholds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Minimum (°C)"
              name="temperatureMin"
              type="number"
              defaultValue={settings?.temperatureMin}
              min={0}
              max={50}
              step={0.5}
              isLoading={isLoading}
            />
            <FormField
              label="Maximum (°C)"
              name="temperatureMax"
              type="number"
              defaultValue={settings?.temperatureMax}
              min={0}
              max={50}
              step={0.5}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Moisture Thresholds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Minimum (%)"
              name="moistureMin"
              type="number"
              defaultValue={settings?.moistureMin}
              min={0}
              max={100}
              step={1}
              isLoading={isLoading}
            />
            <FormField
              label="Maximum (%)"
              name="moistureMax"
              type="number"
              defaultValue={settings?.moistureMax}
              min={0}
              max={100}
              step={1}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save Alert Thresholds'}
          </Button>
        </div>
      </div>
    </motion.form>
  )
}

export default AlertForm 