import { asyncHandler } from '../utils/asyncHandler.js'
import { sensorService } from '../services/sensorService.js'
import { ApiError } from '../utils/ApiError.js'

export const sensorController = {
  getCurrentReading: asyncHandler(async (req, res) => {
    const { type } = req.params
    const reading = await sensorService.getCurrentReading(type)
    if (!reading) {
      throw new ApiError(404, 'Sensor reading not found')
    }
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
  }),

  // addReading: asyncHandler(async (req, res) => {
  //   const { type } = req.params
  //   const { value, unit } = req.body
  //   const reading = await sensorService.addReading(type, value, unit)
  //   res.status(201).json(reading)
  // })
} 