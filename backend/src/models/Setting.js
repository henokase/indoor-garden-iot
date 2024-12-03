import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema({
  preferences: {
    temperatureUnit: {
      type: String,
      enum: ['C', 'F'],
      default: 'C'
    },
    temperatureThreshold: {
      type: Number,
      default: 25
    },
    moistureThreshold: {
      type: Number,
      default: 60
    },
    lightingStartHour: {
      type: Number,
      min: 0,
      max: 23,
      default: 6
    },
    lightingEndHour: {
      type: Number,
      min: 0,
      max: 23,
      default: 18
    }
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: false },
      address: String
    },
    sms: {
      enabled: { type: Boolean, default: false },
      number: String
    },
    push: {
      enabled: { type: Boolean, default: true }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily'],
      default: 'immediate'
    }
  },
  alerts: {
    temperatureMin: { type: Number, default: 18 },
    temperatureMax: { type: Number, default: 28 },
    moistureMin: { type: Number, default: 40 },
    moistureMax: { type: Number, default: 80 }
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
})

const Setting = mongoose.model('Setting', settingSchema)

export { Setting } 