import express from 'express'
import sensorRoutes from './api/sensorRoutes.js'
import deviceRoutes from './api/deviceRoutes.js'
import settingRoutes from './api/settingRoutes.js'
import alertRoutes from './api/alertRoutes.js'
import resourceRoutes from './api/resourceRoutes.js'
import systemRoutes from './api/systemRoutes.js'
import { rateLimiter } from '../middleware/rateLimiter.js'
import { requestLogger } from '../middleware/logger.js'

const router = express.Router()

// Apply middleware to all routes
router.use(requestLogger)
router.use(rateLimiter)

// API routes
router.use('/api/sensors', sensorRoutes)
router.use('/api/devices', deviceRoutes)
router.use('/api/settings', settingRoutes)
router.use('/api/alerts', alertRoutes)
router.use('/api/resources', resourceRoutes)
router.use('/api/system', systemRoutes)

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

export default router 