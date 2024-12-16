import express from 'express'
import { alertController } from '../controllers/alertController.js'

const router = express.Router()

router.get('/', alertController.getAlerts)
router.post('/:id/acknowledge', alertController.acknowledgeAlert)
router.post('/:id/resolve', alertController.resolveAlert)
router.post('/email', alertController.sendEmailAlert)

export default router