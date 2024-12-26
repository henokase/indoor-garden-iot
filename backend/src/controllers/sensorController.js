import { sensorService } from '../services/sensorService.js'

export const sensorController = {
  getCurrentReadings: async (req, res) => {
    const readings = await sensorService.getCurrentReadings()
    res.json(readings)
  },

  getCurrentReading: async (req, res) => {
    const { type } = req.params
    const reading = await sensorService.getCurrentReading(type)
    res.json(reading)
  },

  getHistoricalData: async (req, res) => {
    const { type } = req.params
    const { timeRange } = req.query
    const data = await sensorService.getHistoricalData(type, timeRange)
    res.status(200).json(data)
  },

  getSensorReadingsByDateRange: async (req, res) => {
    const { type } = req.params
    const { startDate, endDate } = req.query
    const readings = await sensorService.getSensorReadingsByDateRange(type, startDate, endDate)
    res.status(200).json(readings)
  },

  getStats: async (req, res) => {
    const { type } = req.params
    const { startDate, endDate } = req.query
    const stats = await sensorService.getStats(type, startDate, endDate)
    res.status(200).json(stats)
  },

  getSensorReadingsForDownload: async (req, res) => {
    try {
      const { type } = req.params
      const { startDate, endDate } = req.query
      const readings = await sensorService.getSensorReadingsForDownload(type, startDate, endDate)
      res.status(200).json(readings)
    } catch (error) {
      console.error('Get combined readings error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  }
}