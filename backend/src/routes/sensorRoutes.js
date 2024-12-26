import express from 'express'
import { sensorController } from '../controllers/sensorController.js'

const router = express.Router()

// Get current readings for all sensors
router.get('/current', sensorController.getCurrentReadings)

// Get historical data for a specific sensor
router.get('/:type/history', sensorController.getHistoricalData)

// Get current reading for a specific sensor
router.get('/:type/current', sensorController.getCurrentReading)

// Get sensor readings by date range
router.get('/:type/readings', sensorController.getSensorReadingsByDateRange)

// Get sensor reading stats for a specific sensor
router.get('/:type/stats', sensorController.getStats)

// Add this route
router.get('/:type/download', sensorController.getSensorReadingsForDownload)

export default router 