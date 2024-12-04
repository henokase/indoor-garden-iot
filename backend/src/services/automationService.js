import { deviceService } from './deviceService.js'
import { sensorService } from './sensorService.js'
import { settingService } from './settingService.js'
import { Device } from '../models/Device.js'

export class AutomationService {
  constructor() {
    this.fertilizerTimers = new Map()
  }

  async processReadings() {
    try {
      const [settings, temperature, moisture] = await Promise.all([
        settingService.getSettings(),
        sensorService.getCurrentReading('temperature'),
        sensorService.getCurrentReading('moisture')
      ])

      // Fan control logic
      if (temperature.value > settings.temperatureThreshold) {
        await deviceService.toggleDevice('fan', true)
      } else if (temperature.value < settings.temperatureThreshold - 2) {
        await deviceService.toggleDevice('fan', false)
      }

      // Irrigation control logic
      if (moisture.value < settings.moistureThreshold) {
        await deviceService.toggleDevice('irrigation', true)
      } else if (moisture.value > settings.moistureThreshold + 5) {
        await deviceService.toggleDevice('irrigation', false)
      }

      // Lighting control based on schedule
      const hour = new Date().getHours()
      const shouldLightBeOn = hour >= settings.lightingStartHour && 
                             hour < settings.lightingEndHour

      await deviceService.toggleDevice('lighting', shouldLightBeOn)

      // Fertilizer control logic
      const currentDate = new Date()
      const currentHour = currentDate.getHours()
      const currentMinute = currentDate.getMinutes()
      const dayOfWeek = currentDate.getDay() // 0-6 (Sunday-Saturday)
      const dayOfMonth = currentDate.getDate() // 1-31

      const shouldStartFertilizer = (
        // Daily schedule
        (settings.preferences.fertilizerSchedule === 'daily' && 
         currentHour === settings.preferences.fertilizerTime && 
         currentMinute < 10) ||
        
        // Weekly schedule
        (settings.preferences.fertilizerSchedule === 'weekly' && 
         dayOfWeek === settings.preferences.fertilizerDayOfWeek && 
         currentHour === settings.preferences.fertilizerTime && 
         currentMinute < 10) ||
        
        // Monthly schedule
        (settings.preferences.fertilizerSchedule === 'monthly' && 
         dayOfMonth === settings.preferences.fertilizerDayOfMonth &&
         currentHour === settings.preferences.fertilizerTime && 
         currentMinute < 10)
      )

      const fertilizer = await Device.findOne({ name: 'fertilizer' })
      
      if (fertilizer && fertilizer.autoMode) {
        if (shouldStartFertilizer && !fertilizer.status) {
          // Turn on fertilizer
          await deviceService.toggleDevice('fertilizer', true)
          
          // Set timer to turn off after 10 minutes
          this.setFertilizerTimer(fertilizer._id)
        } else if (!shouldStartFertilizer && fertilizer.status) {
          // Turn off fertilizer if it's outside the operation window
          await deviceService.toggleDevice('fertilizer', false)
        }
      }

    } catch (error) {
      console.error('Automation error:', error)
    }
  }

  setFertilizerTimer(deviceId) {
    // Clear existing timer if any
    if (this.fertilizerTimers.has(deviceId)) {
      clearTimeout(this.fertilizerTimers.get(deviceId))
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        await deviceService.toggleDevice('fertilizer', false)
        this.fertilizerTimers.delete(deviceId)
      } catch (error) {
        console.error('Error turning off fertilizer:', error)
      }
    }, 10 * 60 * 1000) // 10 minutes

    this.fertilizerTimers.set(deviceId, timer)
  }

  startAutomation() {
    // Run automation check every minute
    setInterval(() => this.processReadings(), 60000)
    console.log('Automation service started')
  }
}

// Export singleton instance for services that need it
export const automationService = new AutomationService() 