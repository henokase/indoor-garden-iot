import express from 'express'
import { settingController } from '../../controllers/settingController.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { schemas } from '../../utils/validation.js'

const router = express.Router()

router.get('/', settingController.getSettings)
router.put('/preferences',
  validateRequest(schemas.settings.preferences),
  settingController.updatePreferences
)
router.put('/notifications',
  validateRequest(schemas.settings.notifications),
  settingController.updateNotifications
)

export default router 