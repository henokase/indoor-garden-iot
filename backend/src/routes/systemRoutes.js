import express from 'express'
import { systemController } from '../controllers/systemController.js'

const router = express.Router()

router.get('/status', systemController.getStatus)
router.get('/health', systemController.getHealth)
router.get('/logs', systemController.getLogs)

export default router 