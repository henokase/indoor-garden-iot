import { deviceService } from './deviceService.js'
import { sensorService } from './sensorService.js'
import { settingService } from './settingService.js'

export class AutomationService {
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

    } catch (error) {
      console.error('Automation error:', error)
    }
  }

  startAutomation() {
    // Run automation check every minute
    setInterval(() => this.processReadings(), 60000)
    console.log('Automation service started')
  }
}

// Export singleton instance for services that need it
export const automationService = new AutomationService() 