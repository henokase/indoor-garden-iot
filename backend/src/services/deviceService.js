import { Device } from '../models/Device.js'
import { ApiError } from '../utils/ApiError.js'
import { getSocketService } from '../config/socket.js'
import { mqttService } from '../config/mqtt.js'
import { resourceService } from './resourceService.js'

export const deviceService = {
  async getAllDevices() {
    return await Device.find().lean()
  },

  async getDevice(id) {
    const device = await Device.findById(id).lean()
    if (!device) {
      throw new ApiError(404, 'Device not found')
    }
    return device
  },

  async toggleDevice(id, status) {
    const device = await Device.findById(id)
    if (!device) {
      throw new ApiError(404, 'Device not found')
    }

    if (device.autoMode) {
      throw new ApiError(400, 'Cannot toggle device in auto mode')
    }

    // If device is being turned off, calculate and track resource usage
    if (!status && device.status && device.operationStartTime) {
      const operationDuration = (new Date() - device.operationStartTime) / (1000 * 60 * 60) // hours
      
      // Calculate energy usage
      const energyUsed = (device.powerRating * operationDuration) / 1000 // kWh

      // Calculate water usage for irrigation
      let waterUsed = 0
      if (device.name === 'irrigation' && device.waterRate) {
        waterUsed = device.waterRate * operationDuration * 60 // liters
      }

      // Track resource usage
      await resourceService.trackUsage({
        date: new Date(),
        energy: {
          total: energyUsed,
          breakdown: {
            [device.name]: energyUsed
          }
        },
        water: {
          total: waterUsed,
          breakdown: {
            irrigation: waterUsed
          }
        }
      })
    }

    // Update device status
    device.status = status
    device.lastUpdated = new Date()
    
    // Set operation start time only when turning on
    if (status) {
      device.operationStartTime = new Date()
    }

    await device.save()

    // Publish to MQTT
    mqttService.publish(`devices/${id}/control`, { status })

    // Notify clients
    const socketService = getSocketService()
    socketService.emitDeviceUpdate(id, device)

    return device
  },

  async setAutoMode(id, enabled) {
    const device = await Device.findById(id)
    if (!device) {
      throw new ApiError(404, 'Device not found')
    }

    if (enabled && device.name === "irrigation" && device.status === true) {
      throw new ApiError(400, 'Irrigation cannot be enabled when it is already running')
    }

    device.autoMode = enabled
    device.lastUpdated = new Date()
    await device.save()

    // Notify clients
    const socketService = getSocketService()
    socketService.emitDeviceUpdate(id, device)

    return device
  },

  async updateDeviceStatus(id, status) {
    const device = await Device.findByIdAndUpdate(
      id,
      {
        $set: {
          status: status.status,
          lastUpdated: new Date()
        }
      },
      { new: true }
    )

    if (!device) {
      throw new ApiError(404, 'Device not found')
    }

    // Notify clients
    const socketService = getSocketService()
    socketService.emitDeviceUpdate(id, device)

    return device
  }
} 