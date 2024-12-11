import { ResourceUsage } from '../models/ResourceUsage.js'
import { Device } from '../models/Device.js'
import { ApiError } from '../utils/ApiError.js'

export const resourceService = {
  async trackUsage(usageData) {
    try {
      // Create a new ResourceUsage document
      const usage = new ResourceUsage({
        date: usageData.date,
        energy: {
          total: usageData.energy.total,
          breakdown: usageData.energy.breakdown
        },
        water: {
          total: usageData.water.total,
          breakdown: usageData.water.breakdown
        }
      })

      // Save the usage data
      await usage.save()
      
      return usage
    } catch (error) {
      console.error('Error tracking resource usage:', error)
      throw error
    }
  },

  async getUsageStats(type, startDate, endDate) {
    const query = { type }
    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = new Date(startDate)
      if (endDate) query.timestamp.$lte = new Date(endDate)
    }

    const usage = await ResourceUsage.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$deviceId',
          totalUsage: { $sum: '$value' },
          readings: { $push: { value: '$value', timestamp: '$timestamp' } }
        }
      },
      {
        $lookup: {
          from: 'devices',
          localField: '_id',
          foreignField: '_id',
          as: 'device'
        }
      },
      { $unwind: '$device' }
    ])

    return usage
  },

  async getDailyUsage(type, days = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return await ResourceUsage.aggregate([
      {
        $match: {
          type,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            deviceId: '$deviceId'
          },
          totalUsage: { $sum: '$value' }
        }
      },
      {
        $lookup: {
          from: 'devices',
          localField: '_id.deviceId',
          foreignField: '_id',
          as: 'device'
        }
      },
      { $unwind: '$device' },
      {
        $group: {
          _id: '$_id.date',
          usage: {
            $push: {
              device: '$device.name',
              value: '$totalUsage'
            }
          },
          totalUsage: { $sum: '$totalUsage' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  }
} 