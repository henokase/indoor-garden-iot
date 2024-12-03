import { SensorReading } from '../models/Sensor.js'
import { ApiError } from '../utils/ApiError.js'
import { getSocketService } from '../config/socket.js'

export const sensorService = {
  async getCurrentReading(type) {
    const reading = await SensorReading.findOne({ type })
      .sort({ timestamp: -1 })
      .lean()

    if (!reading) {
      throw new ApiError(404, `No readings found for sensor type: ${type}`)
    }

    return reading
  },

  async getHistoricalData(type, timeRange) {
    const endDate = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      default:
        startDate.setHours(startDate.getHours() - 24)
    }

    const readings = await SensorReading.find({
      type,
      timestamp: { $gte: startDate, $lte: endDate }
    })
      .sort({ timestamp: 1 })
      .lean()

    // Transform data to the format expected by the chart
    return readings.map(reading => ({
      timestamp: reading.timestamp.getTime(),
      value: reading.value
    }))
  },

  async addReading(type, value, unit) {
    const reading = await SensorReading.create({
      type,
      value,
      unit,
      timestamp: new Date()
    })

    // Notify clients about new reading
    const socketService = getSocketService()
    socketService.emitSensorUpdate(type, reading)

    return reading
  },

  async getStats(type, startDate, endDate) {
    const query = { type }
    if (startDate) query.timestamp = { $gte: new Date(startDate) }
    if (endDate) query.timestamp = { ...query.timestamp, $lte: new Date(endDate) }

    const readings = await SensorReading.find(query).lean()

    const values = readings.map(r => r.value)
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: readings.length,
      unit: readings[0]?.unit
    }
  }
}