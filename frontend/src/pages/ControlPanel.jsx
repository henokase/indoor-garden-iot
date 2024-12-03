import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Power } from 'lucide-react'
import DeviceToggle from '../components/control/DeviceToggle'
import AutoModeToggle from '../components/control/AutoModeToggle'
import { fetchDeviceStates, fetchAutoMode, toggleDevice, toggleAutoMode } from '../lib/api'

function ControlPanel() {
  const queryClient = useQueryClient()
  
  const { data: deviceStates, isLoading: devicesLoading } = useQuery({
    queryKey: ['device-states'],
    queryFn: fetchDeviceStates,
    refetchInterval: 5000
  })

  const { data: autoMode, isLoading: autoModeLoading } = useQuery({
    queryKey: ['auto-mode'],
    queryFn: fetchAutoMode,
    refetchInterval: 5000
  })

  const deviceMutation = useMutation({
    mutationFn: toggleDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-states'] })
    }
  })

  const autoModeMutation = useMutation({
    mutationFn: toggleAutoMode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-mode'] })
    }
  })

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-2xl font-bold text-gray-900 dark:text-white max-md:hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Control Panel
      </motion.h1>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col space-y-4">
          <AutoModeToggle
            isEnabled={autoMode?.enabled}
            isLoading={autoModeLoading}
            onToggle={() => autoModeMutation.mutate()}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <DeviceToggle
              title="Fan"
              icon={Power}
              isEnabled={deviceStates?.fan}
              isLoading={devicesLoading}
              isDisabled={autoMode?.enabled}
              onToggle={() => deviceMutation.mutate('fan')}
            />
            <DeviceToggle
              title="Irrigation"
              icon={Power}
              isEnabled={deviceStates?.irrigation}
              isLoading={devicesLoading}
              isDisabled={autoMode?.enabled}
              onToggle={() => deviceMutation.mutate('irrigation')}
            />
            <DeviceToggle
              title="Lighting"
              icon={Power}
              isEnabled={deviceStates?.lighting}
              isLoading={devicesLoading}
              isDisabled={autoMode?.enabled}
              onToggle={() => deviceMutation.mutate('lighting')}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ControlPanel 