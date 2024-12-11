import express from 'express'
import { resourceController } from '../controllers/resourceController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { schemas } from '../utils/validation.js'

const router = express.Router()

router.get('/usage', resourceController.getUsage)
router.get('/daily-stats', resourceController.getDailyStats)
router.get('/export',
  validateRequest(schemas.resource.export),
  resourceController.exportUsageReport
)

export default router 