import express from 'express'
import { resourceController } from '../controllers/resourceController.js'

const router = express.Router()

// Get resource usage data by date range
router.get('/usage', resourceController.getUsageByDateRange)

// Get resource usage statistics
router.get('/stats', resourceController.getUsageStats)

// Track resource usage
router.post('/track', resourceController.trackUsage)

export default router