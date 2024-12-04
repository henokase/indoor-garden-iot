import mongoose from 'mongoose'

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['fan', 'irrigation', 'lighting', 'fertilizer']
  },
  status: {
    type: Boolean,
    default: false
  },
  autoMode: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  powerRating: {
    type: Number,
    required: true
  },
  waterRate: {
    type: Number
  },
  operationStartTime: {
    type: Date
  }
})

deviceSchema.index({ name: 1 })

export const Device = mongoose.model('Device', deviceSchema) 