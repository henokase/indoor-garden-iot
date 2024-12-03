import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

export async function fetchSensorData(sensorType) {
  const { data } = await api.get(`/sensors/${sensorType}/current`)
  return data
}

export async function fetchSensorHistory(sensorType) {
  const { data } = await api.get(`/sensors/${sensorType}/history`)
  return data
}

export async function fetchLightingDuration() {
  const { data } = await api.get('/lighting/duration')
  return data
}

export async function fetchDeviceStates() {
  const { data } = await api.get('/devices/states')
  return data
}

export async function fetchAutoMode() {
  const { data } = await api.get('/system/auto-mode')
  return data
}

export async function toggleDevice(deviceId) {
  const { data } = await api.post(`/devices/${deviceId}/toggle`)
  return data
}

export async function toggleAutoMode() {
  const { data } = await api.post('/system/auto-mode/toggle')
  return data
}

export async function fetchAnalyticsData({ from, to }) {
  const { data } = await api.get('/analytics/data', {
    params: {
      from: from.toISOString(),
      to: to.toISOString()
    }
  })
  return data
}

export const fetchHistoricalData = async (sensorType, timeRange) => {
  const { data } = await api.get(`/sensors/${sensorType}/history`, {
    params: {
      timeRange
    }
  })
  return data
}

export async function fetchResourceUsage({ from, to }) {
  const { data } = await api.get('/analytics/resources', {
    params: {
      from: from.toISOString(),
      to: to.toISOString()
    }
  })
  return data
} 

export const fetchSettings = async () => {
  const { data } = await api.get('/settings')
  return data
}

export const updateSettings = async (section, values) => {
  const { data } = await api.post(`/settings/${section}`, values)
  return data
}
