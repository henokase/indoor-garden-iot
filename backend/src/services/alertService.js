import { Alert } from '../models/Alert.js'
import { Setting } from '../models/Setting.js'
import { SystemLog } from '../models/SystemLog.js'
import { SYSTEM_CONSTANTS } from '../config/constants.js'

export const alertService = {
  async createAlert(data) {
    const alert = await Alert.create(data)
    
    // Log alert creation
    await SystemLog.create({
      level: 'warning',
      source: 'alert_service',
      message: `New alert created: ${data.type}`,
      details: data
    })

    // Handle notifications based on settings
    await this.handleAlertNotifications(alert)

    return alert
  },

  async handleAlertNotifications(alert) {
    const settings = await Setting.findOne()
    if (!settings) return

    const { notifications, alertFrequency } = settings

    // Implement notification logic based on settings
    if (notifications.email.enabled) {
      // Send email notification
      // TODO: Implement email service
    }

    if (notifications.sms.enabled) {
      // Send SMS notification
      // TODO: Implement SMS service
    }

    if (notifications.push.enabled) {
      // Send push notification
      // TODO: Implement push notification service
    }
  },

  async getActiveAlerts() {
    return await Alert.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .lean()
  },

  async acknowledgeAlert(alertId) {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: 'acknowledged',
        acknowledgedAt: new Date()
      },
      { new: true }
    )

    if (!alert) {
      throw new ApiError(404, 'Alert not found')
    }

    return alert
  },

  async resolveAlert(alertId) {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: 'resolved',
        resolvedAt: new Date()
      },
      { new: true }
    )

    if (!alert) {
      throw new ApiError(404, 'Alert not found')
    }

    return alert
  },

  async getAlertHistory(filters = {}) {
    const query = {}
    
    if (filters.type) query.type = filters.type
    if (filters.status) query.status = filters.status
    if (filters.startDate) query.createdAt = { $gte: new Date(filters.startDate) }
    if (filters.endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) }
    }

    return await Alert.find(query)
      .sort({ createdAt: -1 })
      .lean()
  }
} 