import mongoose from 'mongoose'

const sensorReadingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['temperature', 'moisture']
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const SensorReading = mongoose.model('SensorReading', sensorReadingSchema)

export { SensorReading } 