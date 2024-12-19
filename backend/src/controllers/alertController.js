import { emailService } from '../services/emailService.js'
import { Settings } from '../models/Settings.js'

export const alertController = {
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