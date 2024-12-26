import { deviceService } from './deviceService.js'
import { sensorService } from './sensorService.js'
import { settingsService } from './settingsService.js'
import { mqttService } from '../config/mqtt.js'
import EventEmitter from 'events'
import { Device } from '../models/Device.js'

export class AutomationService extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
    this.isRunning = false;
    this.fertilizerTimers = new Map();
    this.isProcessing = false; // Lock flag for race condition prevention
    
    // Subscribe to MQTT sensor updates
    mqttService.client?.on('message', async (topic, message) => {
      if (!this.isRunning || this.isProcessing) return;
      
      try {
        if (topic === 'indoor-garden/sensors') {
          const payload = JSON.parse(message.toString());
          if (this.validateSensorData(payload)) {
            await this.handleImmediateSensorReading({
              temperature: payload.temperature,
              moisture: payload.moisture,
              timestamp: new Date(payload.timestamp)
            });
          }
        }
      } catch (error) {
        console.error('Error processing MQTT sensor message:', error);
      }
    });

    // Fallback: Listen to sensor updates from socket for redundancy
    this.on('sensorUpdate', async (data) => {
      if (this.isRunning && !this.isProcessing && this.validateSensorData(data)) {
        await this.handleImmediateSensorReading(data);
      }
    });
  }

  validateSensorData(data) {
    return data && 
           typeof data.temperature === 'number' && 
           typeof data.moisture === 'number' &&
           !isNaN(data.temperature) && 
           !isNaN(data.moisture);
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
    
    // Clear all fertilizer timers
    for (const timer of this.fertilizerTimers.values()) {
      clearTimeout(timer);
    }
    this.fertilizerTimers.clear();
    
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

  async handleImmediateSensorReading(data) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      console.log('Processing sensor reading:', data);
      const settings = await settingsService.getSettings();
      
      // Change the device lookup to use type instead of name
      const [fan, pump, light, fertilizer] = await Promise.all([
        Device.findOne({ name: 'fan' }).lean(),
        Device.findOne({ name: 'irrigation' }).lean(),
        Device.findOne({ name: 'lighting' }).lean(),
        Device.findOne({ name: 'fertilizer' }).lean()
      ]);

      // console.log('Retrieved devices:', {
      //   fan: fan?._id ? 'found' : 'not found',
      //   pump: pump?._id ? 'found' : 'not found',
      //   light: light?._id ? 'found' : 'not found',
      //   fertilizer: fertilizer?._id ? 'found' : 'not found'
      // });
      
      if (!settings?.preferences) {
        console.error('No settings found or invalid settings');
        return;
      }

      // Temperature control
      if (fan) {
        if (fan.autoMode) {
          // console.log(`Fan control - Temperature: ${data.temperature}°C, Thresholds: ${settings.preferences.minTemperatureThreshold}-${settings.preferences.maxTemperatureThreshold}°C`);
          if (data.temperature > settings.preferences.maxTemperatureThreshold && !fan.status) {
            await deviceService.toggleDevice('fan', true);
          } else if (data.temperature < settings.preferences.minTemperatureThreshold && fan.status) {
            await deviceService.toggleDevice('fan', false);
          }
        }
      }
      
      // Moisture control
      if (pump) {
        if (pump.autoMode) {
          // console.log(`Pump control - Moisture: ${data.moisture}%, Thresholds: ${settings.preferences.minMoistureThreshold}-${settings.preferences.maxMoistureThreshold}%`);
          if (data.moisture < settings.preferences.minMoistureThreshold && !pump.status) {
            await deviceService.toggleDevice('irrigation', true);
          } else if (data.moisture > settings.preferences.maxMoistureThreshold && pump.status) {
            await deviceService.toggleDevice('irrigation', false);
          }
        }
      }

    } catch (error) {
      console.error('Error in handleImmediateSensorReading:', error.stack);
    } finally {
      this.isProcessing = false;
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

      const shouldStartFertilizer = (
        // Daily schedule
        (settings.fertilizerSchedule === 'daily' &&
          currentHour === settings.fertilizerTime &&
          currentMinute < 10) ||

        // Weekly schedule
        (settings.fertilizerSchedule === 'weekly' &&
          dayOfWeek === settings.fertilizerDayOfWeek &&
          currentHour === settings.fertilizerTime &&
          currentMinute < 10) ||

        // Monthly schedule
        (settings.fertilizerSchedule === 'monthly' &&
          dayOfMonth === settings.fertilizerDayOfMonth &&
          currentHour === settings.fertilizerTime &&
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
  }

  async setFertilizerTimer(deviceId) {
    // Clear existing timer if present
    if (this.fertilizerTimers.has(deviceId)) {
      clearTimeout(this.fertilizerTimers.get(deviceId));
      this.fertilizerTimers.delete(deviceId);
    }

    const timer = setTimeout(async () => {
      try {
        await deviceService.toggleDevice('fertilizer', false);
      } catch (error) {
        console.error('Error stopping fertilizer:', error);
      } finally {
        // Clean up timer reference
        this.fertilizerTimers.delete(deviceId);
      }
    }, 10 * 60 * 1000); // 10 minutes

    this.fertilizerTimers.set(deviceId, timer);
  }
}