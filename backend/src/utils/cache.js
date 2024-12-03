import NodeCache from 'node-cache'

const cache = new NodeCache({
  stdTTL: 60, // Default TTL in seconds
  checkperiod: 120
})

export const cacheUtils = {
  get(key) {
    return cache.get(key)
  },

  set(key, value, ttl = 60) {
    return cache.set(key, value, ttl)
  },

  del(key) {
    return cache.del(key)
  },

  flush() {
    return cache.flushAll()
  },

  // Helper for caching API responses
  async withCache(key, ttl, fetchFn) {
    const cached = this.get(key)
    if (cached) return cached

    const fresh = await fetchFn()
    this.set(key, fresh, ttl)
    return fresh
  },

  // Generate consistent cache keys
  keys: {
    sensorReading: (type) => `sensor:${type}:current`,
    sensorHistory: (type, timeRange) => `sensor:${type}:history:${timeRange}`,
    deviceStatus: (deviceId) => `device:${deviceId}:status`,
    systemStatus: () => 'system:status',
    resourceUsage: (type, period) => `resource:${type}:usage:${period}`
  }
} 