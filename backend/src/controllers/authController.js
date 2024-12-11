import { Settings } from '../models/Settings.js'
import bcryptjs from 'bcryptjs'

export const authController = {
  async login(req, res) {
    try {
      const { password } = req.body
      const settings = await Settings.findOne()

      if (!settings?.password) {
        return res.status(401).json({ message: 'System not initialized. Please set a password in settings.' })
      }

      const isMatch = await bcryptjs.compare(password, settings.password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' })
      }

      res.json({ message: 'Login successful' })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  }
} 