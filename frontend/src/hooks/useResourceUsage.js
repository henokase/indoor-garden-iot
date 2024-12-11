import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useResourceUsage(dateRange) {
  return useQuery({
    queryKey: ['resourceUsage', dateRange],
    queryFn: async () => {
      const { data } = await axios.get('/api/resources/usage', {
        params: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString()
        }
      })
      return data
    }
  })
} 