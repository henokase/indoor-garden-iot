import { Switch } from "../ui/Switch"
import { motion } from "framer-motion"
import { useToggleDevice, useToggleAutoMode } from '../../hooks/useDeviceStatus'
import { toast } from 'react-hot-toast'

export function DeviceCard({ device }) {
    const { mutateAsync: toggleDevice, isPending: isToggling } = useToggleDevice()
    const { mutateAsync: toggleAutoMode, isPending: isTogglingAuto } = useToggleAutoMode()

    const handleToggle = async (checked) => {
        try {
            await toggleDevice({
                name: device.name,
                status: checked
            })
            toast.success(`${device.label} ${checked ? 'turned on' : 'turned off'}`)
        } catch (error) {
            console.error('Toggle device error:', error)
            toast.error(`Failed to toggle ${device.label}`)
        }
    }

    const handleAutoModeToggle = async (checked) => {
        try {
            await toggleAutoMode({
                name: device.name,
                enabled: checked
            })
            toast.success(`Auto mode ${checked ? 'enabled' : 'disabled'} for ${device.label}`)
        } catch (error) {
            console.error('Toggle auto mode error:', error)
            if (error.response?.status === 400) {
                toast.error(error.response.data.message)
            } else {
                toast.error(`Failed to toggle auto mode for ${device.label}`)
            }
        }
    }

    return (
        <motion.div
            className="bg-green-50 dark:bg-gray-800 p-6 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`${device.iconColor}`}>
                        {device.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{device.label}</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Auto</span>
                        {isTogglingAuto ? (
                            <div className="w-10 h-6 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                            </div>
                        ) : (
                            <Switch
                                checked={device.autoMode}
                                onCheckedChange={handleAutoModeToggle}
                                disabled={isTogglingAuto}
                            />
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Power</span>
                        {isToggling ? (
                            <div className="w-10 h-6 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                            </div>
                        ) : (
                            <Switch
                                checked={device.status}
                                onCheckedChange={handleToggle}
                                disabled={isToggling || device.autoMode}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center mt-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                    device.status ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {device.status ? 'Running' : 'Stopped'}
                </span>
                {device.autoMode && (
                    <span className="ml-2 text-sm text-blue-500">
                        (Auto Mode)
                    </span>
                )}
            </div>
        </motion.div>
    )
} 