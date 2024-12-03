import { MongoClient } from 'mongodb'
import { faker } from '@faker-js/faker'

const MONGODB_URI = 'mongodb://localhost:27017/iot_dashboard'

async function generateData() {
  const client = await MongoClient.connect(MONGODB_URI)
  const db = client.db('iot_dashboard')

  // Clear existing data
  await Promise.all([
    db.collection('sensor_data').deleteMany({}),
    db.collection('device_states').deleteMany({}),
    db.collection('settings').deleteMany({}),
    db.collection('resource_usage').deleteMany({}),
    db.collection('alerts').deleteMany({}),
    db.collection('system_logs').deleteMany({})
  ])

  // Generate sensor data for the last 7 days
  const sensorData = []
  const now = new Date()
  for (let i = 0; i < 7 * 24; i++) {
    const timestamp = new Date(now - i * 60 * 60 * 1000)
    sensorData.push({
      timestamp,
      temperature: 20 + Math.random() * 10, // 20-30°C
      moisture: 50 + Math.random() * 30, // 50-80%
      lighting: timestamp.getHours() >= 6 && timestamp.getHours() <= 18,
      energy_consumption: 0.5 + Math.random() * 0.5,
      water_usage: Math.random() > 0.7 ? Math.random() * 0.5 : 0
    })
  }
  await db.collection('sensor_data').insertMany(sensorData)

  // Insert current device states
  await db.collection('device_states').insertOne({
    fan: false,
    irrigation: false,
    lighting: true,
    auto_mode: true,
    last_updated: new Date()
  })

  // Insert settings
  await db.collection('settings').insertOne({
    preferences: {
      temperatureUnit: 'celsius',
      temperatureThreshold: 25,
      moistureThreshold: 60,
      lightingDuration: 12
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      frequency: 'immediately'
    },
    alerts: {
      temperatureMin: 18,
      temperatureMax: 28,
      moistureMin: 40,
      moistureMax: 80
    },
    last_updated: new Date()
  })

  // Generate resource usage data
  const resourceUsage = Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(now - i * 24 * 60 * 60 * 1000),
    energy: {
      total: 10 + Math.random() * 5,
      breakdown: {
        fan: 2 + Math.random(),
        irrigation: 1 + Math.random(),
        lighting: 7 + Math.random() * 2
      }
    },
    water: {
      total: 5 + Math.random() * 2,
      breakdown: {
        irrigation: 5 + Math.random() * 2
      }
    }
  }))
  await db.collection('resource_usage').insertMany(resourceUsage)

  // Generate some alerts
  const alertTypes = ['temperature_high', 'temperature_low', 'moisture_high', 'moisture_low']
  const alerts = Array.from({ length: 5 }).map(() => ({
    timestamp: faker.date.recent({ days: 7 }),
    type: faker.helpers.arrayElement(alertTypes),
    value: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
    threshold: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
    status: faker.helpers.arrayElement(['active', 'acknowledged', 'resolved']),
    resolved_at: faker.helpers.maybe(() => faker.date.recent({ days: 1 }))
  }))
  await db.collection('alerts').insertMany(alerts)

  // Generate system logs
  const logTypes = ['device_state_change', 'settings_update', 'alert_triggered']
  const systemLogs = Array.from({ length: 20 }).map(() => ({
    timestamp: faker.date.recent({ days: 7 }),
    type: faker.helpers.arrayElement(logTypes),
    device: faker.helpers.maybe(() => faker.helpers.arrayElement(['fan', 'irrigation', 'lighting'])),
    state: faker.helpers.maybe(() => faker.datatype.boolean()),
    trigger: faker.helpers.arrayElement(['auto_mode', 'manual', 'schedule']),
    user: 'admin'
  }))
  await db.collection('system_logs').insertMany(systemLogs)

  console.log('Demo data generated successfully!')
  await client.close()
}

generateData().catch(console.error) 