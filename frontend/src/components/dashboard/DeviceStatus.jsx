import { motion } from 'framer-motion'
import { Fan, Droplets, Sun, FlaskConical } from 'lucide-react'

export function DeviceStatus({ devices, loading }) {
  const deviceList = [
    {
      name: 'fan',
      label: 'Fan',
      icon: <Fan className="w-5 h-5" />,
      color: 'text-gray-600'
    },
    {
      name: 'irrigation',
      label: 'Irrigation',
      icon: <Droplets className="w-5 h-5" />,
      color: 'text-blue-500'
    },
    {
      name: 'lighting',
      label: 'Lighting',
      icon: <Sun className="w-5 h-5" />,
      color: 'text-yellow-500'
    },
    {
      name: 'fertilizer',
      label: 'Fertilizer',
      icon: <FlaskConical className="w-5 h-5" />,
      color: 'text-green-500'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Device Status</h2>
        <div className="space-y-2">
          {deviceList.map((device) => (
            <div 
              key={device.name}
              className="bg-gray-50 rounded-lg p-4 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Device Status</h2>
      <div className="space-y-2">
        {deviceList.map((device, index) => (
          <motion.div
            key={device.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={device.color}>
                  {device.icon}
                </div>
                <span className="font-medium">{device.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Auto:</span>
                  <span className={`text-sm ${devices?.[device.name]?.autoMode ? 'text-green-500' : 'text-gray-500'}`}>
                    {devices?.[device.name]?.autoMode ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      devices?.[device.name]?.status 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm ${
                      devices?.[device.name]?.status 
                        ? 'text-green-500' 
                        : 'text-gray-500'
                    }`}>
                      {devices?.[device.name]?.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 