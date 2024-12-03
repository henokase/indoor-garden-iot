import { asyncHandler } from '../utils/asyncHandler.js'
import { alertService } from '../services/alertService.js'
import { ApiError } from '../utils/ApiError.js'

export const alertController = {
  getAlerts: asyncHandler(async (req, res) => {
    const { status, type, startDate, endDate } = req.query
    const alerts = await alertService.getAlerts({ status, type, startDate, endDate })
    res.json(alerts)
  }),

  acknowledgeAlert: asyncHandler(async (req, res) => {
    const { id } = req.params
    const alert = await alertService.acknowledgeAlert(id)
    if (!alert) {
      throw new ApiError(404, 'Alert not found')
    }
    res.json(alert)
  }),

  resolveAlert: asyncHandler(async (req, res) => {
    const { id } = req.params
    const { resolution } = req.body
    const alert = await alertService.resolveAlert(id, resolution)
    if (!alert) {
      throw new ApiError(404, 'Alert not found')
    }
    res.json(alert)
  })
} 