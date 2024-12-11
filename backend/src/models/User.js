import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  temperatureUnit: { type: String, default: 'C' },
  temperatureThreshold: { type: Number, default: 25 },
  moistureThreshold: { type: Number, default: 50 },
  temperatureMin: { type: Number, default: 15 },
  temperatureMax: { type: Number, default: 35 },
  moistureMin: { type: Number, default: 20 },
  moistureMax: { type: Number, default: 80 },
  enableAlerts: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: false },
  smsNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: false },
  emailAddress: String,
  phoneNumber: String,
  notificationFrequency: { type: String, default: 'immediate' },
  fertilizerSchedule: { type: String, default: 'weekly' },
  fertilizerDayOfWeek: String,
  fertilizerDayOfMonth: Number
})

const userSchema = new mongoose.Schema({
  // ... existing user fields ...
  settings: { type: settingsSchema, default: () => ({}) }
})

export const User = mongoose.model('User', userSchema) 