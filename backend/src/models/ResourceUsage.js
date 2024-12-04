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
      required: true
    },
    breakdown: {
      fan: { type: Number, default: 0 },
      irrigation: { type: Number, default: 0 },
      lighting: { type: Number, default: 0 },
      fertilizer: { type: Number, default: 0 }
    }
  },
  water: {
    total: {
      type: Number,
      required: true
    },
    breakdown: {
      irrigation: { type: Number, default: 0 }
    }
  }
})

const ResourceUsage = mongoose.model('ResourceUsage', resourceUsageSchema)

export { ResourceUsage } 