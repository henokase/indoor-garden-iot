import { Settings } from '../models/Settings.js'
import bcryptjs from 'bcryptjs'

export const settingsService = {
  async getSettings() {
    let settings = await Settings.findOne().select('-password')
    if (!settings) {
      settings = await Settings.create({})
    }
    return settings
  },

  async updateSettings(settingsData) {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: settingsData },
      { new: true, upsert: true }
    ).select('-password')
    return settings
  },

  async updatePassword({ currentPassword, newPassword }) {
    const settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({})
    }

    if (settings.password) {
      const isMatch = await bcryptjs.compare(currentPassword, settings.password)
      if (!isMatch) {
        throw new Error('Current password is incorrect')
      }
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(newPassword, salt)

    settings.password = hashedPassword

    await settings.save()
    return { message: 'Password updated successfully' }
  }
} 