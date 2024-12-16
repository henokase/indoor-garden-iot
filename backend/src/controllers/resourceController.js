import { resourceService } from '../services/resourceService.js'
import { ApiError } from '../utils/ApiError.js'

export const resourceController = {
  async getUsageByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required')
      }

      const usage = await resourceService.getUsageByDateRange(startDate, endDate)
      res.json(usage)
    } catch (error) {
      next(error instanceof ApiError ? error : new ApiError(500, error.message))
    }
  },

  async getUsageStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required')
      }

      const stats = await resourceService.getUsageStats(startDate, endDate)
      res.json(stats)
    } catch (error) {
      next(error instanceof ApiError ? error : new ApiError(500, error.message))
    }
  },

  async trackUsage(req, res, next) {
    try {
      const { date, energy, water } = req.body

      if (!date) {
        throw new ApiError(400, 'Date is required')
      }

      if (!energy && !water) {
        throw new ApiError(400, 'At least one resource usage (energy or water) must be provided')
      }

      const usage = await resourceService.trackUsage({
        date: new Date(date),
        energy,
        water
      })
      res.status(201).json(usage)
    } catch (error) {
      next(error instanceof ApiError ? error : new ApiError(500, error.message))
    }
  }
}