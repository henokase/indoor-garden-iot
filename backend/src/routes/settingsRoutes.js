import express from 'express'
import { settingsController } from '../controllers/settingsController.js'

const router = express.Router()

router.get('/', settingsController.getSettings)
router.put('/', settingsController.updateSettings)
router.put('/password', settingsController.updatePassword)

export default router