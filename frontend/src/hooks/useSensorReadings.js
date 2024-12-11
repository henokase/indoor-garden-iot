import { useState, useEffect } from 'react'
import api from '../lib/axios'

export function useSensorReadings(type, dateRange) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setMessage(null)

        // Only fetch if we have a valid date range
        if (!dateRange?.start || !dateRange?.end) {
          setMessage('Please select a date range')
          setData([])
          return
        }

        const { data: response } = await api.get(`/sensors/${type}/readings`, {
          params: {
            startDate: new Date(dateRange.start).toISOString(),
            endDate: new Date(dateRange.end).toISOString()
          }
        })

        if (response.message) {
          setMessage(response.message)
          setData([])
        } else {
          setData(response.data || [])
        }
      } catch (err) {
        console.error('Error fetching sensor readings:', err)
        setError('Failed to fetch sensor readings')
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchReadings()
  }, [type, dateRange])

  return { data, isLoading, error, message }
} 