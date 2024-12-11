import { fileURLToPath } from 'url'
import { connectDB } from '../config/database.js'
import { SensorReading } from '../models/Sensor.js'

async function initializeSensorData() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    const now = Date.now()
    const readings = []

    // Generate last hour of readings
    for (let i = 0; i < 12; i++) {
      const timestamp = new Date(now - i * 5 * 60 * 1000) // Every 5 minutes

      // Temperature reading
      readings.push({
        type: 'temperature',
        value: 23 + (Math.random() - 0.5) * 2,
        unit: 'C',
        timestamp
      })

      // Moisture reading
      readings.push({
        type: 'moisture',
        value: 60 + (Math.random() - 0.5) * 10,
        unit: '%',
        timestamp
      })
    }

    await SensorReading.insertMany(readings)
    console.log('Initial sensor readings created successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing sensor data:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeSensorData()
}

export { initializeSensorData } 