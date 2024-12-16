import { asyncHandler } from '../utils/asyncHandler.js'
import { alertService } from '../services/alertService.js'
import { emailService } from '../services/emailService.js'
import { ApiError } from '../utils/ApiError.js'
import { Settings } from '../models/Settings.js'

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
  }),

  async sendEmailAlert(req, res) {
    try {
      const { type, value, isHigh } = req.body;
      
      // Get user's email from settings
      const settings = await Settings.findOne();
      if (!settings?.notifications?.email?.enabled || !settings?.notifications?.email?.address) {
        return res.status(400).json({ 
          message: 'Email notifications are disabled or email address is not set' 
        });
      }

      // Send email alert
      const emailSent = await emailService.sendAlertEmail(
        settings.notifications.email.address,
        { type, value, isHigh }
      );

      if (emailSent) {
        res.status(200).json({ message: 'Email alert sent successfully' });
      } else {
        res.status(500).json({ message: 'Failed to send email alert' });
      }
    } catch (error) {
      console.error('Error sending email alert:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}