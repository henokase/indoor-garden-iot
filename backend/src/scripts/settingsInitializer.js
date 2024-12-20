import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Setup path to .env file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../../.env') })

// Define Settings Schema (copied from your model to make it standalone)
const settingsSchema = new mongoose.Schema({
  password: { type: String },
  preferences: {
    temperatureUnit: { type: String, default: 'C' },
    minTemperatureThreshold: { type: Number, default: 15 },
    maxTemperatureThreshold: { type: Number, default: 25 },
    minMoistureThreshold: { type: Number, default: 40 },
    maxMoistureThreshold: { type: Number, default: 60 },
    lightingStartHour: { type: Number, default: 6 },
    lightingEndHour: { type: Number, default: 18 },
    fertilizerSchedule: { type: String, default: 'weekly' },
    fertilizerTime: { type: Number, default: 8 },
    fertilizerDayOfWeek: { type: String, default: 'Monday' },
    fertilizerDayOfMonth: { type: Number, default: 1 }
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: false },
      address: String
    },
    push: { type: Boolean, default: false },
  }
})

const Settings = mongoose.model('Settings', settingsSchema)

const initializeSettings = async () => {
  try {
    // Check if settings already exist
    const existingSettings = await Settings.findOne()
    
    if (!existingSettings) {
      // Create default settings if none exist
      const defaultSettings = new Settings({
        password: '123456789', // Remember to change this!
        preferences: {
          temperatureUnit: 'C',
          minTemperatureThreshold: 15,
          maxTemperatureThreshold: 25,
          minMoistureThreshold: 40,
          maxMoistureThreshold: 60,
          lightingStartHour: 6,
          lightingEndHour: 18,
          fertilizerSchedule: 'weekly',
          fertilizerTime: 8,
          fertilizerDayOfWeek: 'Monday',
          fertilizerDayOfMonth: 1
        },
        notifications: {
          email: {
            enabled: false,
            address: ''
          },
          push: false
        }
      })

      await defaultSettings.save()
      console.log('Default settings initialized successfully')
      return defaultSettings
    }

    console.log('Settings already exist, skipping initialization')
    return existingSettings

  } catch (error) {
    console.error('Error initializing settings:', error)
    throw error
  }
}

// Main function to run the script
const main = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Connected to MongoDB')

    // Initialize settings
    await initializeSettings()
    console.log('Settings initialization complete')

  } catch (error) {
    console.error('Script failed:', error)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('Database connection closed')
    process.exit(0)
  }
}

// Run the script
main()
