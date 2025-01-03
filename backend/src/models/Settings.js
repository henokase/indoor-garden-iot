import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  password: { type: String, default: '' },
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
    fertilizerMinute: { type: Number, default: 0 },
    fertilizerDayOfWeek: { type: String, default: 'Monday' },
    fertilizerDayOfMonth: { type: Number, default: 1 }
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: false },
      address: { type: String, default: '' }
    },
    push: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export const Settings = mongoose.model('Settings', settingsSchema) 