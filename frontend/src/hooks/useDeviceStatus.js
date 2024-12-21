import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { useSocket } from './useSocket';
import { useEffect } from 'react';

export function useDeviceStatus() {
  const { socket, subscribeTo, isConnected } = useSocket() || {}
  const queryClient = useQueryClient()

  const { data: deviceStatusData = [], isLoading, error } = useQuery({
    queryKey: ['deviceStatus'],
    queryFn: async () => {
      const { data } = await api.get('/devices')
      return Array.isArray(data) ? data : []
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  })

  useEffect(() => {
    if (socket && isConnected) {
      console.log('Setting up socket subscriptions')
      
      const subscribeToAll = () => {
        subscribeTo('device', 'fan')
        subscribeTo('device', 'irrigation')
        subscribeTo('device', 'lighting')
        subscribeTo('device', 'fertilizer')
      }

      subscribeToAll()

      socket.on('device:update', (data) => {
        queryClient.setQueryData(['deviceStatus'], (oldData = []) => {
          const updatedData = [...oldData]
          const deviceIndex = updatedData.findIndex(d => d.name === data.name)
          
          if (deviceIndex !== -1) {
            updatedData[deviceIndex] = { 
              ...updatedData[deviceIndex], 
              ...data,
              mode: data.autoMode ? 'auto' : 'manual'
            }
          } else {
            updatedData.push({
              ...data,
              mode: data.autoMode ? 'auto' : 'manual'
            })
          }
          
          return updatedData
        })
      })

      socket.on('connect', subscribeToAll)

      return () => {
        console.log('Cleaning up socket listeners')
        socket.off('device:update')
        socket.off('connect', subscribeToAll)
      }
    }
  }, [socket, isConnected, subscribeTo, queryClient])

  return { deviceStatusData, isLoading, error }
}

export function useDeviceStatusForNotifications() {
  const { deviceStatusData, isLoading, error } = useDeviceStatus();

  const transformedStatus = deviceStatusData.reduce((acc, device) => {
    acc[device.name] = {
      ...device,
      mode: device.autoMode ? 'auto' : 'manual'
    };
    return acc;
  }, {});

  return {
    data: transformedStatus,
    isLoading,
    error
  };
}

export function useToggleDevice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ name, status }) => {
      const { data } = await api.post(`/devices/${name}/toggle`, { status })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['deviceStatus'], (oldData = []) => {
        const updatedData = [...oldData]
        const deviceIndex = updatedData.findIndex(d => d.name === data.name)
        
        if (deviceIndex !== -1) {
          updatedData[deviceIndex] = { ...updatedData[deviceIndex], ...data }
        }
        
        return updatedData
      })
    },
    onError: (error) => {
      console.error('Toggle device error:', error)
    }
  })
}

export function useToggleAutoMode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ name, enabled }) => {
      const { data } = await api.post(`/devices/${name}/auto-mode`, { enabled })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['deviceStatus'], (oldData = []) => {
        const updatedData = [...oldData]
        const deviceIndex = updatedData.findIndex(d => d.name === data.name)
        
        if (deviceIndex !== -1) {
          updatedData[deviceIndex] = { ...updatedData[deviceIndex], ...data }
        }
        
        return updatedData
      })
    },
    onError: (error) => {
      console.error('Toggle auto mode error:', error)
    }
  })
}
