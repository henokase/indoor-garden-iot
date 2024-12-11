import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import { toast } from 'react-toastify'

export const useFetchSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings')
      return data
    }
  })
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings) => {
      const { data } = await api.put('/settings', settings)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings'])
    }
  })
}

export const useUpdatePassword = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (passwordData) => {
      const { data } = await api.put('/settings/password', passwordData)
      return data
    },
    onSuccess: () => {
      toast.success('Password updated successfully')
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })
}
