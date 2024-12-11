import { useMutation } from '@tanstack/react-query'
import api from '../lib/axios'

export function useToggleDevice() {
    const { mutate: toggleDevice, isPending: isToggling } = useMutation({
        mutationFn: async ({ name, status }) => {
            try {
                const { data } = await api.post(`/api/devices/${name}/toggle`, { status })
                return data
            } catch (error) {
                console.error('Error toggling device:', {
                    name,
                    status,
                    error: error.response?.data || error.message
                })
                throw error
            }
        }
    })

    return { toggleDevice, isToggling }
} 