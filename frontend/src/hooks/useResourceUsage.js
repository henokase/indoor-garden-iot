import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export function useResourceUsage(dateRange) {
  return useQuery({
    queryKey: ['resourceUsage', dateRange?.start, dateRange?.end],
    queryFn: async () => {
      if (!dateRange?.start || !dateRange?.end) {
        return []
      }

      const { data } = await api.get('/resources/usage', {
        params: {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
        }
      })
      return data
    },
    enabled: !!dateRange?.start && !!dateRange?.end
  })
}

export function useResourceStats(dateRange) {
  return useQuery({
    queryKey: ['resourceStats', dateRange?.start, dateRange?.end],
    queryFn: async () => {
      if (!dateRange?.start || !dateRange?.end) {
        return null
      }

      const { data } = await api.get('/resources/stats', {
        params: {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
        }
      })
      return data
    },
    enabled: !!dateRange?.start && !!dateRange?.end
  })
}