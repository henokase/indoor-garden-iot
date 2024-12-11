import express from 'express'
import { sensorService } from '../services/sensorService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

// Get current readings for all sensors
router.get('/current', asyncHandler(async (req, res) => {
  const readings = await sensorService.getCurrentReadings()
  res.json(readings)
}))

// Get historical data for a specific sensor
router.get('/:type/history', asyncHandler(async (req, res) => {
  const { type } = req.params
  const { timeRange } = req.query
  const data = await sensorService.getHistoricalData(type, timeRange)
  res.json(data)
}))

// Get current reading for a specific sensor
router.get('/:type/current', asyncHandler(async (req, res) => {
  const { type } = req.params
  const reading = await sensorService.getCurrentReading(type)
  res.json(reading)
}))

// Get sensor readings by date range
router.get('/:type/readings', asyncHandler(async (req, res) => {
  const { type } = req.params
  const { startDate, endDate } = req.query
  const readings = await sensorService.getSensorReadingsByDateRange(type, startDate, endDate)
  res.json(readings)
}))

export default router 