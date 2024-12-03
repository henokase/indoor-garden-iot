import { asyncHandler } from '../utils/asyncHandler.js'
import { systemService } from '../services/systemService.js'

export const systemController = {
  getStatus: asyncHandler(async (req, res) => {
    const status = await systemService.getSystemStatus()
    res.json(status)
  }),

  getLogs: asyncHandler(async (req, res) => {
    const { level, source, startDate, endDate, limit } = req.query
    const logs = await systemService.getLogs({
      level,
      source,
      startDate,
      endDate,
      limit: parseInt(limit)
    })
    res.json(logs)
  }),

  getHealth: asyncHandler(async (req, res) => {
    const health = await systemService.getSystemHealth()
    res.json(health)
  })
} 