import { motion } from 'framer-motion'
import { Thermometer, Droplets, Clock } from 'lucide-react'
import FormField from './FormField'
import { Button } from '../common/Button'

function PreferencesForm({ settings, isLoading, onSubmit, isSubmitting }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onSubmit({
      temperatureUnit: formData.get('temperatureUnit'),
      temperatureThreshold: Number(formData.get('temperatureThreshold')),
      moistureThreshold: Number(formData.get('moistureThreshold')),
      lightingDuration: Number(formData.get('lightingDuration'))
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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        System Preferences
      </h2>

      <div className="space-y-4">
        <FormField
          label="Temperature Unit"
          name="temperatureUnit"
          type="select"
          icon={Thermometer}
          options={[
            { value: 'celsius', label: 'Celsius (°C)' },
            { value: 'fahrenheit', label: 'Fahrenheit (°F)' }
          ]}
          defaultValue={settings?.temperatureUnit}
          isLoading={isLoading}
        />

        <FormField
          label="Temperature Threshold"
          name="temperatureThreshold"
          type="number"
          icon={Thermometer}
          defaultValue={settings?.temperatureThreshold}
          min={0}
          max={50}
          step={0.5}
          isLoading={isLoading}
        />

        <FormField
          label="Moisture Threshold"
          name="moistureThreshold"
          type="number"
          icon={Droplets}
          defaultValue={settings?.moistureThreshold}
          min={0}
          max={100}
          step={1}
          isLoading={isLoading}
        />

        <FormField
          label="Daily Lighting Duration (hours)"
          name="lightingDuration"
          type="number"
          icon={Clock}
          defaultValue={settings?.lightingDuration}
          min={0}
          max={24}
          step={0.5}
          isLoading={isLoading}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </motion.form>
  )
}

export default PreferencesForm 