import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useSocket } from './useSocket';
import { useEffect, useState } from 'react';

export function useDeviceStatus() {
  const { socket, subscribeTo, isConnected } = useSocket() || {}
  const [deviceStatusData, setDeviceStatusData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDeviceStatusData = async () => {
      try {
        setIsLoading(true)
        const { data } = await api.get('/devices')
        setDeviceStatusData(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        console.error('Error fetching device status:', err)
        setError('Failed to fetch device status')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeviceStatusData()

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
        setDeviceStatusData(prevData => {
          const updatedData = Array.isArray(prevData) ? [...prevData] : []
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
  }, [socket, isConnected, subscribeTo])

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
      queryClient.setQueryData(['deviceStatus'], (oldData) => {
        if (!oldData) return { [data.name]: data }
        return { ...oldData, [data.name]: data }
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
      queryClient.setQueryData(['deviceStatus'], (oldData) => {
        if (!oldData) return { [data.name]: data }
        return { ...oldData, [data.name]: data }
      })
    },
    onError: (error) => {
      console.error('Toggle auto mode error:', error)
    }
  })
}
