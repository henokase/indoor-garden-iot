import mongoose from 'mongoose'

const resourceUsageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  energy: {
    total: {
      type: Number,
      required: true,
      default: 0
    },
    breakdown: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  water: {
    total: {
      type: Number,
      required: true,
      default: 0
    },
    breakdown: {
      type: Map,
      of: Number,
      default: new Map()
    }
  }
})

resourceUsageSchema.index({ date: -1 })

export const ResourceUsage = mongoose.model('ResourceUsage', resourceUsageSchema) 