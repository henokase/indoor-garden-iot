import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useAutoMode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, enabled }) => {
      const { data } = await axios.post(`/api/devices/${name}/auto-mode`, { enabled })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceStatus'] })
    }
  })
} 