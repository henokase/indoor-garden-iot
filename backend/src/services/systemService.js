import { SystemLog } from '../models/SystemLog.js'
import { Device } from '../models/Device.js'
import { Setting } from '../models/Setting.js'
import { ApiError } from '../utils/ApiError.js'
import { mqttService } from '../config/mqtt.js'

export const systemService = {
  async getSystemStatus() {
    const [devices, settings, latestLogs] = await Promise.all([
      Device.find().lean(),
      Setting.findOne().lean(),
      SystemLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .lean()
    ])

    const deviceStatus = devices.reduce((acc, device) => {
      acc[device.name] = {
        status: device.status,
        autoMode: device.autoMode,
        lastUpdated: device.lastUpdated
      }
      return acc
    }, {})

    return {
      devices: deviceStatus,
      settings,
      latestLogs,
      mqttConnected: mqttService.isConnected(),
      systemTime: new Date()
    }
  },

  async getSystemHealth() {
    const healthChecks = {
      mqtt: await this.checkMQTTConnection(),
      database: await this.checkDatabaseConnection(),
      devices: await this.checkDevicesStatus()
    }

    const isHealthy = Object.values(healthChecks)
      .every(check => check.status === 'healthy')

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      checks: healthChecks
    }
  },

  async checkMQTTConnection() {
    return {
      status: mqttService.isConnected() ? 'healthy' : 'unhealthy',
      latency: await mqttService.getLatency()
    }
  },

  async checkDatabaseConnection() {
    try {
      await SystemLog.findOne()
      return { status: 'healthy' }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  },

  async checkDevicesStatus() {
    const devices = await Device.find()
    const offlineDevices = devices.filter(device => {
      const lastUpdateDiff = Date.now() - device.lastUpdated
      return lastUpdateDiff > 5 * 60 * 1000 // 5 minutes threshold
    })

    return {
      status: offlineDevices.length === 0 ? 'healthy' : 'warning',
      offlineDevices: offlineDevices.map(d => d.name)
    }
  },

  async getLogs(filters = {}) {
    const query = {}
    
    if (filters.level) query.level = filters.level
    if (filters.source) query.source = filters.source
    if (filters.startDate) {
      query.timestamp = { $gte: new Date(filters.startDate) }
    }
    if (filters.endDate) {
      query.timestamp = { 
        ...query.timestamp, 
        $lte: new Date(filters.endDate) 
      }
    }

    return await SystemLog.find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100)
      .lean()
  }
} 