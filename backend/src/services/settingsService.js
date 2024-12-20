import { Settings } from '../models/Settings.js'
import bcryptjs from 'bcryptjs'

export const settingsService = {
  async getSettings() {
    let settings = await Settings.findOne().select('-password')
    if (!settings) {
      settings = await Settings.create({})
    }
    // Convert to plain object to ensure all defaults are included
    return settings.toObject()
  },

  async updateSettings(settingsData) {
    // First get the current settings
    const currentSettings = await Settings.findOne().select('-password')
    if (!currentSettings) {
      const newSettings = await Settings.create(settingsData)
      return newSettings.toObject()
    }

    // Convert current settings to plain object
    const currentSettingsObj = currentSettings.toObject()

    // Merge the updates with current settings
    const updatedSettings = {
      preferences: {
        ...currentSettingsObj.preferences,
        ...(settingsData.preferences || {})
      },
      notifications: {
        email: {
          ...currentSettingsObj.notifications.email,
          ...(settingsData.notifications?.email || {})
        },
        push: settingsData.notifications?.push !== undefined 
          ? settingsData.notifications.push 
          : currentSettingsObj.notifications.push
      }
    }

    // Update with merged data
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updatedSettings },
      { new: true, upsert: true }
    ).select('-password')
    
    // Convert to plain object before returning
    return settings.toObject()
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