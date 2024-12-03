import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchHistoricalData } from '../lib/api'
import { useSocket } from '../context/SocketContext'

export function useHistoricalData(sensorType, timeRange = '24h') {
  const queryClient = useQueryClient()
  const socket = useSocket()

  const { data: history = [], ...rest } = useQuery({
    queryKey: ['history', sensorType, timeRange],
    queryFn: () => fetchHistoricalData(sensorType, timeRange),
    refetchInterval: 60000,
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data.map(reading => ({
        timestamp: new Date(reading.timestamp).getTime(),
        value: reading.value
      }));
    }
  })

  useEffect(() => {
    if (!socket) return

    socket.on(`history:${sensorType}`, (newData) => {
      queryClient.setQueryData(['history', sensorType, timeRange], newData)
    })

    return () => {
      socket.off(`history:${sensorType}`)
    }
  }, [socket, sensorType, timeRange, queryClient])

  return { history, ...rest }
} 