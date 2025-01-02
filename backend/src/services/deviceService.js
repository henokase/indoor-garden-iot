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

  async updateDeviceStatus(deviceName, deviceState) {
    // console.log('\n=== Device Status Update ===');
    // console.log('Looking for device:', deviceName);
    
    // Get all devices to debug
    const allDevices = await Device.find({}, 'name');
    // console.log('Available devices in DB:', allDevices.map(d => d.name));

    // Find the device
    const device = await Device.findOne({ name: deviceName });
    
    if (!device) {
      console.error(`Device "${deviceName}" not found in database`);
      console.log('Expected one of:', allDevices.map(d => d.name).join(', '));
      console.log('========================\n');
      throw new Error('Device not found');
    }

    // Update the device
    device.status = deviceState.status;
    device.autoMode = deviceState.autoMode;
    device.lastUpdated = deviceState.lastUpdated;

    const updatedDevice = await device.save();
    console.log(updatedDevice.name,' updated successfully:', {
      name: updatedDevice.name,
      status: updatedDevice.status,
      autoMode: updatedDevice.autoMode
    });
    console.log('========================\n');

    // Emit the update via WebSocket
    await emitDeviceUpdate(deviceName, updatedDevice);
    
    return updatedDevice;
  }
} 