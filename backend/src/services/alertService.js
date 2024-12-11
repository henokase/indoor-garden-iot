import { Alert } from '../models/Alert.js'
import { emitSystemAlert } from '../config/socket.js'

export const alertService = {
  async createAlert(data) {
    const alert = await Alert.create({
      ...data,
      timestamp: new Date()
    })

    // Emit alert via Socket.IO
    await emitSystemAlert({
      id: alert._id,
      type: alert.type,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp
    })

    return alert
  },

  async getAlerts(filter = {}) {
    return await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(100)
      .lean()
  },

  async markAsRead(alertId) {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { $set: { read: true } },
      { new: true }
    )

    if (alert) {
      // Emit alert update
      await emitSystemAlert({
        id: alert._id,
        read: true,
        type: 'alert_update'
      })
    }

    return alert
  }
} 