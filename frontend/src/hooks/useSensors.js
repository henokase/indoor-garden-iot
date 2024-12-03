import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchSensorData } from '../lib/api'
import { useSocket } from '../context/SocketContext'

export function useSensorData(sensorType) {
  const queryClient = useQueryClient()
  let socket = null
  
  try {
    socket = useSocket()
  } catch (error) {
    console.warn('Socket context not available, falling back to polling only')
  }

  const { data: currentReading, ...rest } = useQuery({
    queryKey: ['sensor', sensorType],
    queryFn: () => fetchSensorData(sensorType),
    refetchInterval: 30000, // Fallback polling
  })

  useEffect(() => {
    if (!socket) return

    // Listen for real-time sensor updates
    socket.on(`sensor:${sensorType}`, (newReading) => {
      queryClient.setQueryData(['sensor', sensorType], newReading)
    })

    return () => {
      socket.off(`sensor:${sensorType}`)
    }
  }, [socket, sensorType, queryClient])

  return { currentReading, ...rest }
}