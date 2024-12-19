import express from 'express'
import { alertController } from '../controllers/alertController.js'

const router = express.Router()

router.post('/email', alertController.sendEmailAlert)

export default router