import { settingsService } from '../services/settingsService.js'

export const settingsController = {
  async getSettings(req, res) {
    try {
      const settings = await settingsService.getSettings()
      res.status(200).json(settings)
    } catch (error) {
      console.error('Get settings error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  },

  async updateSettings(req, res) {
    try {
      const settings = await settingsService.updateSettings(req.body)
      res.status(200).json(settings)
    } catch (error) {
      console.error('Update settings error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  },

  async updatePassword(req, res) {
    try {
      await settingsService.updatePassword(req.body)
      res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
      console.error('Update password error:', error)
      res.status(400).json({ message: error.message })
    }
  }
}