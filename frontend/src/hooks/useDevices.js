import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchDeviceStates, toggleDevice } from '../lib/api'
import { useSocket } from '../context/SocketContext'

export function useDevices() {
  const queryClient = useQueryClient()
  const socket = useSocket()

  const { data: devices, ...rest } = useQuery({
    queryKey: ['devices'],
    queryFn: fetchDeviceStates,
    refetchInterval: 30000,
  })

  const toggleMutation = useMutation({
    mutationFn: toggleDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })

  useEffect(() => {
    if (!socket) return

    // Listen for real-time device state updates
    socket.on('device:state', (newStates) => {
      queryClient.setQueryData(['devices'], newStates)
    })

    // Listen for auto-mode changes
    socket.on('system:auto-mode', (autoModeState) => {
      queryClient.setQueryData(['auto-mode'], autoModeState)
    })

    return () => {
      socket.off('device:state')
      socket.off('system:auto-mode')
    }
  }, [socket, queryClient])

  return {
    devices,
    toggleDevice: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    ...rest,
  }
}