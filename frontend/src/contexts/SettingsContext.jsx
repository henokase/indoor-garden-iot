import { createContext, useContext, useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'
import { toast } from 'react-hot-toast'

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    try {
      const data = await settingsService.fetchSettings()
      setSettings(data)
    } catch (error) {
      console.error('Load settings error:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true)
      const data = await settingsService.updateSettings(newSettings)
      setSettings(data)
      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Update settings error:', error)
      toast.error('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      loading, 
      updateSettings,
      reloadSettings: loadSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)