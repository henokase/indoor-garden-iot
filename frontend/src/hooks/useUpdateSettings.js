import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings) => {
      const { data } = await axios.put('/api/settings', settings)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })
} 