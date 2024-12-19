import { resourceService } from '../services/resourceService.js'

export const resourceController = {
  async getUsageByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        res.status(400).json('Start date and end date are required')
      }

      const usage = await resourceService.getUsageByDateRange(startDate, endDate)
      res.json(usage)
    } catch (error) {
      res.status(500).json('Internal server error')
    }
  },

  async getUsageStats(req, res) {
    try {
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        res.status(400).json('Start date and end date are required')
      }

      const stats = await resourceService.getUsageStats(startDate, endDate)
      res.json(stats)
    } catch (error) {
      res.status(500).json('Internal server error')
    }
  },
}