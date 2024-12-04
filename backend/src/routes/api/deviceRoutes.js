import express from 'express'
import { deviceController } from '../../controllers/deviceController.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { schemas } from '../../utils/validation.js'

const router = express.Router()

router.get('/', deviceController.getAllDevices)
router.get('/:id', deviceController.getDevice)
router.post('/:name/toggle',
  validateRequest(schemas.device.toggle),
  deviceController.toggleDevice
)
router.post('/:id/auto-mode',
  validateRequest(schemas.device.autoMode),
  deviceController.setAutoMode
)

export default router 