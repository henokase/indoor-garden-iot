import { SystemLog } from '../models/SystemLog.js'
import { emitSystemStatus } from '../config/socket.js'
import { deviceService } from './deviceService.js'
import { sensorService } from './sensorService.js'

export const systemService = {
  async getSystemStatus() {
    const [devices, readings] = await Promise.all([
      deviceService.getAllDevices(),
      sensorService.getCurrentReadings()
    ])

    const status = {
      devices: devices.map(d => ({
        name: d.name,
        status: d.status,
        autoMode: d.autoMode,
        lastUpdated: d.lastUpdated
      })),
      sensors: readings,
      timestamp: new Date()
    }

    // Emit current status
    await emitSystemStatus(status)

    return status
  },

  async logSystemEvent(level, message, details = {}) {
    const log = await SystemLog.create({
      level,
      message,
      details,
      timestamp: new Date()
    })

    if (level === 'error' || level === 'warning') {
      await emitSystemStatus({
        type: 'system_log',
        level,
        message,
        timestamp: log.timestamp
      })
    }

    return log
  }
} 