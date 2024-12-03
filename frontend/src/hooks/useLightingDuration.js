import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchLightingDuration } from '../lib/api'
import { useSocket } from '../context/SocketContext'

export function useLightingDuration() {
  const queryClient = useQueryClient()
  const socket = useSocket()

  const { data: lighting, ...rest } = useQuery({
    queryKey: ['lighting-duration'],
    queryFn: fetchLightingDuration,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (!socket) return

    socket.on('lighting:duration', (newDuration) => {
      queryClient.setQueryData(['lighting-duration'], newDuration)
    })

    return () => {
      socket.off('lighting:duration')
    }
  }, [socket, queryClient])

  return { lighting, ...rest }
} 