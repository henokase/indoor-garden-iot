import { Device } from '../models/Device.js'
import { resourceService } from './resourceService.js'
import { emitDeviceUpdate } from '../config/socket.js'
import { mqttService } from '../config/mqtt.js'

export const deviceService = {
  async getAllDevices() {
    return await Device.find().lean()
  },

  async getDevice(name) {
    const device = await Device.findOne({ name }).lean()
    // console.log(`Getting device ${name}:`, device);
    if (!device) {
      throw new Error('Device not found')
    }
    return device
  },

  async toggleDevice(name, status) {
    const device = await Device.findOne({ name })
    if (!device) {
      throw new Error('Device not found')
    }

    // Store the original state in case we need to rollback
    const originalState = {
      status: device.status,
      lastUpdated: device.lastUpdated,
      operationStartTime: device.operationStartTime
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
    const updatedDevice = await Device.findOneAndUpdate(
      { name },
      {
        $set: {
          status,
          lastUpdated: new Date(),
          ...(status ? { operationStartTime: new Date() } : {})
        }
      },
      { new: true }
    )

    // Notify microcontroller via MQTT first
    try {
      await mqttService.publish('indoor-garden/devices', {
        device: name,
        status,
        autoMode: updatedDevice.autoMode
      })
    } catch (error) {
      console.error('Failed to notify microcontroller:', error)
      
      // Rollback the database change
      const revertedDevice = await Device.findOneAndUpdate(
        { name },
        {
          $set: originalState
        },
        { new: true }
      )

      // Notify clients about the revert via Socket.IO
      await emitDeviceUpdate(name, revertedDevice)

      throw new Error('Failed to communicate with device. Changes reverted.')
    }
  },

  async toggleAutoMode(name, enabled) {
    const device = await Device.findOne({ name })
    if (!device) {
      throw new Error('Device not found')
    }

    device.autoMode = enabled
    const updatedDevice = await device.save()

    // Notify clients
    await emitDeviceUpdate(name, updatedDevice)

    return updatedDevice
  },

  async updateDeviceStatus(deviceName, status) {
    const checkDevice = await Device.findOne({ name: deviceName })
    if (!checkDevice) {
      throw new Error('Device not found')
    }

    if (!checkDevice.autoMode) {
      throw new Error('Device is not in auto mode')
    }

    // Find device by name instead of _id
    const device = await Device.findOneAndUpdate(
      { name: deviceName },
      {
        $set: {
          status: status.status,
          autoMode: status.autoMode,
          lastUpdated: new Date()
        }
      },
      { new: true }
    )

    if (!device) {
      throw new Error('Device not found')
    }

    // Emit device update via Socket.IO
    await emitDeviceUpdate(deviceName, {
      name: deviceName,
      status: status.status,
      autoMode: status.autoMode,
      lastUpdated: new Date()
    })

    return device
  }
} 