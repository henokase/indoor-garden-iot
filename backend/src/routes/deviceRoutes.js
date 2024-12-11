import express from 'express'
import { deviceController } from '../controllers/deviceController.js'

const router = express.Router()

router.get('/', deviceController.getAllDevices)
router.post('/:name/toggle', deviceController.toggleDevice)
router.post('/:name/auto-mode', deviceController.toggleAutoMode)

export default router 