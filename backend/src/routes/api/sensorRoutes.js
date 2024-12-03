import express from 'express'
import { sensorController } from '../../controllers/sensorController.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { schemas } from '../../utils/validation.js'

const router = express.Router()

router.get('/:type/current', sensorController.getCurrentReading)
router.get('/:type/history', sensorController.getHistoricalData)
router.get('/:type/stats', sensorController.getStats)
// router.post('/:type/reading', 
//   validateRequest(schemas.sensor.reading),
//   sensorController.addReading
// )

export default router 