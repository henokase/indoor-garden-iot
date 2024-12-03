import mongoose from 'mongoose'

const systemLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  level: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error']
  },
  source: {
    type: String,
    required: true,
    enum: ['system', 'device', 'sensor', 'automation', 'mqtt', 'health_check']
  },
  message: {
    type: String,
    required: true
  },
  details: mongoose.Schema.Types.Mixed
})

// Index for efficient querying
systemLogSchema.index({ timestamp: -1 })
systemLogSchema.index({ level: 1, timestamp: -1 })
systemLogSchema.index({ source: 1, timestamp: -1 })

const SystemLog = mongoose.model('SystemLog', systemLogSchema)

export { SystemLog } 