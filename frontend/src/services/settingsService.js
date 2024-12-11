import api from '../lib/axios'

export const settingsService = {
  async fetchSettings() {
    const { data } = await api.get('/settings')
    return data
  },

  async updateSettings(settings) {
    const { data } = await api.put('/settings', settings)
    return data
  },

  async updatePassword(passwordData) {
    const { data } = await api.put('/settings/password', passwordData)
    return data
  }
}