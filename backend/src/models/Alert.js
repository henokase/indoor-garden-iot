import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: [
      'temperature_high',
      'temperature_low',
      'moisture_high',
      'moisture_low',
      'device_error',
      'system_error'
    ]
  },
  value: Number,
  threshold: Number,
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  resolved_at: Date,
  acknowledged_by: String,
  details: mongoose.Schema.Types.Mixed
})

const Alert = mongoose.model('Alert', alertSchema)

export { Alert } 