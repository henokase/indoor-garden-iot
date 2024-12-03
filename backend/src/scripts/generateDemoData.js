import { connectDB } from '../config/database.js'
import { SensorReading } from '../models/Sensor.js'
import { Device } from '../models/Device.js'
import { Setting } from '../models/Setting.js'
import { ResourceUsage } from '../models/ResourceUsage.js'
import { SYSTEM_CONSTANTS } from '../config/constants.js'

async function generateDemoData() {
  try {
    await connectDB()
    console.log('Generating demo data...')

    // Create default devices
    await Device.create([
      { 
        name: 'fan', 
        status: false, 
        autoMode: true,
        powerRating: 35 // 35W fan
      },
      { 
        name: 'irrigation', 
        status: false, 
        autoMode: true,
        powerRating: 45, // 45W pump
        waterRate: 2 // 2 liters per minute
      },
      { 
        name: 'lighting', 
        status: true, 
        autoMode: true,
        powerRating: 50 // 50W LED panel
      }
    ])

    // Create default settings
    await Setting.create({
      preferences: {
        temperatureUnit: 'C',
        temperatureThreshold: 25,
        moistureThreshold: 60,
        lightingStartHour: 6,
        lightingEndHour: 18
      },
      notifications: {
        email: { enabled: false },
        sms: { enabled: false },
        push: { enabled: true },
        frequency: 'immediate'
      }
    })

    // Generate 24 hours of sensor readings
    const now = Date.now()
    const readings = []
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now - i * 60 * 60 * 1000)
      
      readings.push({
        type: 'temperature',
        value: 20 + Math.random() * 10,
        unit: 'C',
        timestamp
      })
      
      readings.push({
        type: 'moisture',
        value: 50 + Math.random() * 20,
        unit: '%',
        timestamp
      })
    }

    await SensorReading.create(readings)

    // Generate resource usage data
    const usageData = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      usageData.push({
        date,
        energy: {
          total: 10 + Math.random() * 5,
          breakdown: {
            fan: 2 + Math.random() * 1,
            irrigation: 3 + Math.random() * 1,
            lighting: 5 + Math.random() * 3
          }
        },
        water: {
          total: 50 + Math.random() * 20,
          breakdown: {
            irrigation: 50 + Math.random() * 20
          }
        }
      })
    }

    await ResourceUsage.create(usageData)

    console.log('Demo data generated successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error generating demo data:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateDemoData()
}

export { generateDemoData } 