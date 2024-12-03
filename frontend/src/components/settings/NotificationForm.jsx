import { motion } from 'framer-motion'
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'
import FormField from './FormField'
import { Button } from '../common/Button'

function NotificationForm({ settings, isLoading, onSubmit, isSubmitting }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onSubmit({
      email: formData.get('email') === 'true',
      sms: formData.get('sms') === 'true',
      push: formData.get('push') === 'true',
      frequency: formData.get('frequency')
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
        Notification Settings
      </h2>

      <div className="space-y-4">
        <FormField
          label="Alert Frequency"
          name="frequency"
          type="select"
          icon={Bell}
          options={[
            { value: 'immediately', label: 'Immediately' },
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' }
          ]}
          defaultValue={settings?.frequency}
          isLoading={isLoading}
        />

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notification Methods
          </h3>
          
          <FormField
            label="Email Notifications"
            name="email"
            type="checkbox"
            icon={Mail}
            defaultChecked={settings?.email}
            isLoading={isLoading}
          />

          <FormField
            label="SMS Notifications"
            name="sms"
            type="checkbox"
            icon={MessageSquare}
            defaultChecked={settings?.sms}
            isLoading={isLoading}
          />

          <FormField
            label="Push Notifications"
            name="push"
            type="checkbox"
            icon={Smartphone}
            defaultChecked={settings?.push}
            isLoading={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </div>
    </motion.form>
  )
}

export default NotificationForm 