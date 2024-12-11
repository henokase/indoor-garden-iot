import { useState, useEffect } from 'react'
import api from '../lib/axios'

export function useSensorHistory(sensorType, timeRange = '1h') {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const { data } = await api.get(`/sensors/${sensorType}/history`, {
          params: { timeRange }
        })
        setData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching sensor history:', err)
        setError('Failed to fetch sensor history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [sensorType, timeRange])

  return { data, isLoading, error }
} 