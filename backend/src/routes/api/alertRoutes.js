import express from 'express'
import { alertController } from '../../controllers/alertController.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { schemas } from '../../utils/validation.js'

const router = express.Router()

router.get('/', alertController.getAlerts)
router.post('/:id/acknowledge',
  validateRequest(schemas.alert.acknowledge),
  alertController.acknowledgeAlert
)
router.post('/:id/resolve',
  validateRequest(schemas.alert.resolve),
  alertController.resolveAlert
)

export default router