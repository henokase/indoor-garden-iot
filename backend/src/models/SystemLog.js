import mongoose from 'mongoose'

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warning', 'error'],
    required: true
  },
  source: {
    type: String,
    enum: ['system', 'mqtt', 'socket.io', 'automation', 'device', 'sensor'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

export const SystemLog = mongoose.model('SystemLog', systemLogSchema) 