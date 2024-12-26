import { useState, useEffect } from 'react'
import { useSocket } from './useSocket'
import api from '../lib/axios'

export function useSensorData() {
  const { socket, subscribeTo, isConnected } = useSocket() || { socket: null, subscribeTo: null, isConnected: false }
  const [sensorData, setSensorData] = useState({
    temperature: null,
    moisture: null,
    timestamp: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setIsLoading(true)
        const { data } = await api.get('/sensors/current')
        setSensorData(prevData => ({
          ...prevData,
          ...data
        }))
        setError(null)
      } catch (err) {
        console.error('Error fetching sensor data:', err)
        setError('Failed to fetch sensor data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSensorData()

    if (socket && isConnected) {
      console.log('Setting up socket subscriptions')
      
      // Subscribe to sensors
      const subscribeToAll = () => {
        subscribeTo('sensor', 'temperature')
        subscribeTo('sensor', 'moisture')
      }
      
      subscribeToAll()

      // Handle sensor updates
      socket.on('sensor:update', (data) => {
        // console.log('Received sensor update:', data)
        setSensorData(prevData => ({
          ...prevData,
          [data.type]: data.value,
          timestamp: data.timestamp
        }))
      })

      // Resubscribe on reconnection
      socket.on('connect', subscribeToAll)

      return () => {
        console.log('Cleaning up socket listeners')
        socket.off('sensor:update')
        socket.off('connect', subscribeToAll)
      }
    }
  }, [socket, isConnected, subscribeTo])

  return { sensorData, isLoading, error }
}

export function useSensorHistory(type, dateRange) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const { data: response } = await api.get(`/sensors/${type}/readings`, {
          params: {
            startDate: dateRange.start.toISOString(),
            endDate: dateRange.end.toISOString()
          }
        })
        setData(response.data || [])
        setError(null)
      } catch (err) {
        console.error(`Error fetching ${type} history:`, err)
        setError(`Failed to fetch ${type} history`)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    if (dateRange?.start && dateRange?.end) {
      fetchHistory()
    }
  }, [type, dateRange])

  return { data, isLoading, error }
}