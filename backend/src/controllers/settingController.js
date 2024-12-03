import { asyncHandler } from '../utils/asyncHandler.js'
import { settingService } from '../services/settingService.js'

export const settingController = {
  getSettings: asyncHandler(async (req, res) => {
    const settings = await settingService.getSettings()
    res.json(settings)
  }),

  updatePreferences: asyncHandler(async (req, res) => {
    const preferences = req.body
    const updated = await settingService.updatePreferences(preferences)
    res.json(updated)
  }),

  updateNotifications: asyncHandler(async (req, res) => {
    const notifications = req.body
    const updated = await settingService.updateNotifications(notifications)
    res.json(updated)
  })
} 