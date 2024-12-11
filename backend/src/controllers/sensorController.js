import { asyncHandler } from '../utils/asyncHandler.js'
import { sensorService } from '../services/sensorService.js'
import { ApiError } from '../utils/ApiError.js'

export const sensorController = {
  getCurrentReadings: asyncHandler(async (req, res) => {
    const readings = await sensorService.getCurrentReadings()
    if (!readings) {
      throw new ApiError(404, 'Sensor reading not found')
    }
    res.json(readings)
  }),

  getCurrentReading: asyncHandler(async (req, res) => {
    const { type } = req.params
    const reading = await sensorService.getCurrentReading(type)
    res.json(reading)
  }),

  getHistoricalData: asyncHandler(async (req, res) => {
    const { type } = req.params
    const { timeRange = '24h' } = req.query
    const data = await sensorService.getHistoricalData(type, timeRange)
    res.json(data)
  }),

  getStats: asyncHandler(async (req, res) => {
    const { type } = req.params
    const { startDate, endDate } = req.query
    const stats = await sensorService.getStats(type, startDate, endDate)
    res.json(stats)
  })
}