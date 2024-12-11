import express from 'express'
import { alertController } from '../controllers/alertController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { schemas } from '../utils/validation.js'

const router = express.Router()

router.get('/', alertController.getAlerts)
router.post('/:id/acknowledge', alertController.acknowledgeAlert
)
router.post('/:id/resolve', alertController.resolveAlert
)

export default router 