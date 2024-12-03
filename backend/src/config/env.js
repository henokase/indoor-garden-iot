import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env') })

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3001,
  MONGODB_URI: process.env.MONGODB_URI,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  MQTT: {
    HOST: process.env.MQTT_HOST,
    PORT: parseInt(process.env.MQTT_PORT) || 1883,
    USERNAME: process.env.MQTT_USERNAME,
    PASSWORD: process.env.MQTT_PASSWORD,
    TOPIC_PREFIX: process.env.MQTT_TOPIC_PREFIX || 'indoor-garden'
  },

  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  ALERTS: {
    EMAIL_ENABLED: process.env.ALERT_EMAIL_ENABLED === 'true',
    SMS_ENABLED: process.env.ALERT_SMS_ENABLED === 'true',
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    SMS_API_KEY: process.env.SMS_API_KEY
  }
} 