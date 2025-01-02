import { deviceService } from './deviceService.js'
import { sensorService } from './sensorService.js'
import { settingsService } from './settingsService.js'
import EventEmitter from 'events'
import { Device } from '../models/Device.js'

export class AutomationService extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
    this.isRunning = false;
    this.isProcessing = false; // Lock flag for race condition prevention
  }

  async startAutomation() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Use recursive setTimeout instead of setInterval
    const scheduleNextCheck = async () => {
      if (!this.isRunning) return;
      
      try {
        await this.checkConditionsAndAct();
      } catch (error) {
        console.error('Automation error:', error);
      } finally {
        // Schedule next check only if automation is still running
        if (this.isRunning) {
          this.interval = setTimeout(scheduleNextCheck, 5000);
        }
      }
    };
    
    // Start the first check
    scheduleNextCheck();
  }

  async stopAutomation() {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    
    // Wait for any ongoing processing to complete
    while (this.isProcessing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async checkConditionsAndAct() {
    if (this.isProcessing) return;
    
    try {
      this.isProcessing = true;
      const devices = {
        fan: await Device.findOne({ name: 'fan' }).lean(),
        irrigation: await Device.findOne({ name: 'irrigation' }).lean(),
        lighting: await Device.findOne({ name: 'lighting' }).lean(),
        fertilizer: await Device.findOne({ name: 'fertilizer' }).lean()
      };
      
      if (Object.values(devices).some(device => !device)) {
        console.error('Missing devices:', Object.entries(devices)
          .filter(([key, value]) => !value)
          .map(([key]) => key)
          .join(', '));
        return;
      }
      
      await this.processReadings(
        devices.fan,
        devices.irrigation,
        devices.lighting,
        devices.fertilizer
      );
    } finally {
      this.isProcessing = false;
    }
  }

  async processReadings(fan, irrigation, lighting, fertilizer) {
    try {
      const [settings, temperatureReading, moistureReading] = await Promise.all([
        settingsService.getSettings(),
        sensorService.getCurrentReading('temperature'),
        sensorService.getCurrentReading('moisture')
      ]);

      // Validate settings and readings
      if (!settings?.preferences) {
        throw new Error('Invalid settings data');
      }

      if (!temperatureReading || !moistureReading) {
        throw new Error('Invalid sensor readings');
      }

      await this.handleAutomationLogic(
        settings.preferences,
        temperatureReading,
        moistureReading,
        fan,
        irrigation,
        lighting,
        fertilizer
      );
    } catch (error) {
      console.error('Error processing readings:', error);
      throw error; // Propagate error for proper handling
    }
  }

  async handleAutomationLogic(settings, temperature, moisture, fan, irrigation, lighting, fertilizer) {
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

      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const jsToWeekDay = (jsDay) => weekDays[(jsDay + 6) % 7]; // Convert JS day (0=Sunday) to our day format (0=Monday)

      const shouldStartFertilizer = (
        // Daily schedule
        (settings.fertilizerSchedule === 'daily' &&
          currentHour === settings.fertilizerTime &&
          currentMinute === settings.fertilizerMinute) ||

        // Weekly schedule
        (settings.fertilizerSchedule === 'weekly' &&
          jsToWeekDay(dayOfWeek) === settings.fertilizerDayOfWeek &&
          currentHour === settings.fertilizerTime &&
          currentMinute === settings.fertilizerMinute) ||

        // Monthly schedule
        (settings.fertilizerSchedule === 'monthly' &&
          dayOfMonth === settings.fertilizerDayOfMonth &&
          currentHour === settings.fertilizerTime &&
          currentMinute === settings.fertilizerMinute)
      )

      if (shouldStartFertilizer) {
        // Turn on fertilizer
        await deviceService.toggleDevice('fertilizer', true)
      } else {
        // Turn off fertilizer
        await deviceService.toggleDevice('fertilizer', false)
      }
    }
  }
}