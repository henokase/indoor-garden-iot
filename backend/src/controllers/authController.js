import { authService } from '../services/authService.js'

export const authController = {
  async login(req, res) {
    try {
      const { password } = req.body

      const isAuthenticated = await authService.login(password)
      
      if (isAuthenticated) {
        res.json({ message: 'Login successful' })
      } else {
        res.status(401).json({ message: 'Invalid password' })
      }

    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  }
} 