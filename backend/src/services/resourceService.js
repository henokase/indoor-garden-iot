import { ResourceUsage } from '../models/ResourceUsage.js'
import { Device } from '../models/Device.js'
import { ApiError } from '../utils/ApiError.js'

export const resourceService = {
  async trackUsage(deviceId, type, value, unit) {
    const device = await Device.findById(deviceId)
    if (!device) {
      throw new ApiError(404, 'Device not found')
    }

    const usage = await ResourceUsage.create({
      deviceId,
      type,
      value,
      unit
    })

    return usage
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