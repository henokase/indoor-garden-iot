import { deviceService } from '../services/deviceService.js'

export const deviceController = {
  async getAllDevices(req, res) {
    try {
      const devices = await deviceService.getAllDevices()
      res.json(devices)
    } catch (error) {
      console.error('Get devices error:', error)
      res.status(500).json({ message: 'Failed to fetch devices' })
    }
  },

  toggleDevice: async (req, res) => {
    try {
      const { name } = req.params
      const { status } = req.body
      const device = await deviceService.toggleDevice(name, status)
      res.json(device)
    } catch (error) {
      console.error('Toggle device error:', error)
      res.status(error.status || 500).json({ message: error.message })
    }
  },

  async toggleAutoMode(req, res) {
    try {
      const { name } = req.params
      const { enabled } = req.body
      const updatedDevice = await deviceService.toggleAutoMode(name, enabled)
      res.json(updatedDevice)
    } catch (error) {
      console.error('Toggle auto mode error:', error)
      res.status(error.status || 500).json({ message: error.message })
    }
  }
}