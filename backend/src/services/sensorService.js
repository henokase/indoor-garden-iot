import { SensorReading } from '../models/Sensor.js'
import { emitSensorUpdate } from '../config/socket.js'

export const sensorService = {
  async getCurrentReadings() {
    const types = ['temperature', 'moisture']
    const readings = {}

    await Promise.all(
      types.map(async (type) => {
        try {
          const reading = await SensorReading.findOne({ type })
            .sort({ timestamp: -1 })
            .lean()

          readings[type] = reading ? reading.value : null
        } catch (error) {
          console.error(`Error fetching ${type} reading:`, error)
          readings[type] = null
        }
      })
    )

    return {
      temperature: readings.temperature,
      moisture: readings.moisture,
      timestamp: new Date()
    }
  },

  async getCurrentReading(type) {
    const reading = await SensorReading.findOne({ type })
      .sort({ timestamp: -1 })
      .lean()
    return reading
  },

  async getHistoricalData(type, timeRange) {
    const endDate = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1)
        break
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
    emitSensorUpdate(type, {
      type,
      value: reading.value,
      timestamp: reading.timestamp
    })

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
  },

  async getSensorReadingsByDateRange(type, startDate, endDate) {
    try {
      // If no dates provided, default to last 7 days
      const end = endDate ? new Date(endDate) : new Date()
      const start = startDate 
        ? new Date(startDate)
        : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)

      console.log('Fetching readings for:', { type, start, end }) // Debug log

      const readings = await SensorReading.find({
        type,
        timestamp: {
          $gte: start,
          $lte: end
        }
      })
        .sort({ timestamp: 1 })
        .lean()

      console.log('Found readings:', readings.length) // Debug log

      if (!readings || readings.length === 0) {
        console.log('No readings found for the query') // Debug log
        return {
          data: [],
          message: 'No records found for the selected date range'
        }
      }

      // Aggregate readings by hour
      const hourlyReadings = new Map()

      readings.forEach(reading => {
        const timestamp = new Date(reading.timestamp)
        // Set minutes and seconds to 0 to group by hour
        timestamp.setMinutes(0, 0, 0)
        const hourKey = timestamp.getTime()

        if (!hourlyReadings.has(hourKey)) {
          hourlyReadings.set(hourKey, {
            sum: reading.value,
            count: 1,
            timestamp: timestamp
          })
        } else {
          const current = hourlyReadings.get(hourKey)
          current.sum += reading.value
          current.count++
        }
      })

      // Calculate averages and format data
      const aggregatedData = Array.from(hourlyReadings.values())
        .map(({ sum, count, timestamp }) => ({
          timestamp: timestamp.toISOString(), // Convert to ISO string for consistent formatting
          value: Math.round((sum / count) * 100) / 100 // Round to 2 decimal places
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Ensure proper sorting

      console.log('Returning aggregated data:', aggregatedData.length) // Debug log

      return {
        data: aggregatedData
      }
    } catch (error) {
      console.error('Error in getSensorReadingsByDateRange:', error)
      throw error
    }
  },

  async getSensorReadingsForDownload(type, startDate, endDate) {
    // If no dates provided, default to last 7 days
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate 
      ? new Date(startDate)
      : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)

    const readings = await SensorReading.find({
      type,
      timestamp: {
        $gte: start,
        $lte: end
      }
    })
      .sort({ timestamp: 1 })
      .lean()

    if (readings.length === 0) {
      return {
        data: [],
        message: 'No records found for the selected date range'
      }
    }

    // Aggregate readings by day
    const dailyReadings = new Map()

    readings.forEach(reading => {
      const timestamp = new Date(reading.timestamp)
      // Set hours, minutes, seconds to 0 to group by day
      timestamp.setHours(0, 0, 0, 0)
      const dayKey = timestamp.getTime()

      if (!dailyReadings.has(dayKey)) {
        dailyReadings.set(dayKey, {
          sum: reading.value,
          count: 1,
          timestamp: timestamp,
          min: reading.value,
          max: reading.value
        })
      } else {
        const current = dailyReadings.get(dayKey)
        current.sum += reading.value
        current.count++
        current.min = Math.min(current.min, reading.value)
        current.max = Math.max(current.max, reading.value)
      }
    })

    // Calculate averages and format data
    const aggregatedData = Array.from(dailyReadings.values()).map(({ sum, count, timestamp, min, max }) => ({
      timestamp,
      value: Math.round((sum / count) * 100) / 100, // Daily average rounded to 2 decimal places
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      readings: count
    }))

    return {
      data: aggregatedData,
      summary: {
        totalReadings: readings.length,
        daysWithData: aggregatedData.length,
        averageReadingsPerDay: Math.round(readings.length / aggregatedData.length)
      }
    }
  },
}