export const SYSTEM_CONSTANTS = {
  TEMPERATURE_LIMITS: {
    MIN: -10,
    MAX: 50
  },
  MOISTURE_LIMITS: {
    MIN: 0,
    MAX: 100
  },
  LIGHTING_HOURS: {
    MIN: 0,
    MAX: 23
  },
  TIME_RANGES: {
    HOUR: '1h',
    DAY: '24h',
    WEEK: '7d',
    MONTH: '30d'
  },
  DEVICES: {
    FAN: 'fan',
    IRRIGATION: 'irrigation',
    LIGHTING: 'lighting'
  },
  ALERT_TYPES: {
    TEMPERATURE_HIGH: 'temperature_high',
    TEMPERATURE_LOW: 'temperature_low',
    MOISTURE_HIGH: 'moisture_high',
    MOISTURE_LOW: 'moisture_low',
    DEVICE_ERROR: 'device_error',
    SYSTEM_ERROR: 'system_error'
  },
  LOG_LEVELS: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error'
  },
  LOG_SOURCES: {
    SYSTEM: 'system',
    DEVICE: 'device',
    SENSOR: 'sensor',
    AUTOMATION: 'automation',
    MQTT: 'mqtt',
    HEALTH_CHECK: 'health_check'
  }
} 