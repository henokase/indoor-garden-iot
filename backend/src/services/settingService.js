import { Setting } from '../models/Setting.js'
import { ApiError } from '../utils/ApiError.js'
import { getSocketService } from '../config/socket.js'

export const settingService = {
  async getSettings() {
    const settings = await Setting.findOne().lean()
    if (!settings) {
      throw new ApiError(404, 'Settings not found')
    }
    return settings
  },

  async updatePreferences(preferences) {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: { preferences } },
      { new: true, upsert: true }
    ).lean()

    // Notify clients about settings update
    const socketService = getSocketService()
    socketService.emitSettingsUpdate(settings)

    return settings
  },

  async updateNotifications(notifications) {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: { notifications } },
      { new: true, upsert: true }
    ).lean()

    const socketService = getSocketService()
    socketService.emitSettingsUpdate(settings)

    return settings
  },

  async updateAlertThresholds(alerts) {
    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: { alerts } },
      { new: true, upsert: true }
    ).lean()

    const socketService = getSocketService()
    socketService.emitSettingsUpdate(settings)

    return settings
  }
} 