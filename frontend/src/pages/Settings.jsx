import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PreferencesForm from '../components/settings/PreferencesForm'
import NotificationForm from '../components/settings/NotificationForm'
import AlertForm from '../components/settings/AlertForm'
import { fetchSettings, updateSettings } from '../lib/api'

function Settings() {
  const queryClient = useQueryClient()
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  const handleSubmit = (section, values) => {
    mutation.mutate({ section, values })
  }

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-2xl font-bold text-gray-900 dark:text-white max-md:hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Settings
      </motion.h1>

      <div className="space-y-6">
        <PreferencesForm
          settings={settings?.preferences}
          isLoading={isLoading}
          onSubmit={(values) => handleSubmit('preferences', values)}
          isSubmitting={mutation.isPending}
        />

        <NotificationForm
          settings={settings?.notifications}
          isLoading={isLoading}
          onSubmit={(values) => handleSubmit('notifications', values)}
          isSubmitting={mutation.isPending}
        />

        <AlertForm
          settings={settings?.alerts}
          isLoading={isLoading}
          onSubmit={(values) => handleSubmit('alerts', values)}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  )
}

export default Settings