import { deviceService } from './deviceService.js'
import { sensorService } from './sensorService.js'
import { settingsService } from './settingsService.js'

export class AutomationService {
  constructor() {
    this.interval = null
    this.isRunning = false
    this.fertilizerTimers = new Map()
  }

  async startAutomation() {
    if (this.isRunning) return

    this.isRunning = true

    this.interval = setInterval(async () => {
      try {
        await this.checkConditionsAndAct()
      } catch (error) {
        console.error('Automation error:', error)
      }
    }, 30000) // Check every 30 seconds
  }

  async stopAutomation() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      this.isRunning = false

      await emitSystemStatus({
        automation: false,
        timestamp: new Date()
      })
    }
  }

  async checkConditionsAndAct() {
    const fan = deviceService.getDevice('fan')
    const irrigation = deviceService.getDevice('irrigation')
    const lighting = deviceService.getDevice('lighting')
    const fertilizer = deviceService.getDevice('fertilizer')

    await this.processReadings(fan, irrigation, lighting, fertilizer)
  }

  async processReadings(fan, irrigation, lighting, fertilizer) {
    try {
      const [settings, temperature, moisture] = await Promise.all([
        settingsService.getSettings(),
        sensorService.getCurrentReading('temperature'),
        sensorService.getCurrentReading('moisture')
      ])

      // Fan control logic
      if (fan && fan.autoMode) {
        if (temperature.value > settings.maxTemperatureThreshold) {
          await deviceService.toggleDevice('fan', true)
        } else if (temperature.value < settings.minTemperatureThreshold) {
          await deviceService.toggleDevice('fan', false)
        }
      }

      // Irrigation control logic
      if (irrigation && irrigation.autoMode) {
        if (moisture.value < settings.minMoistureThreshold) {
          await deviceService.toggleDevice('irrigation', true)
        } else if (moisture.value > settings.maxMoistureThreshold) {
          await deviceService.toggleDevice('irrigation', false)
        }
      }

      // Lighting control based on schedule
      if (lighting && lighting.autoMode) {
        const hour = new Date().getHours()
        const shouldLightBeOn = hour >= settings.lightingStartHour &&
          hour < settings.lightingEndHour

        await deviceService.toggleDevice('lighting', shouldLightBeOn)
      }

      // Fertilizer control logic
      if (fertilizer && fertilizer.autoMode) {
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

}