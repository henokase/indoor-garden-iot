import mqtt from 'mqtt'
import { env } from './env.js'
import { getSocketService } from './socket.js'
import { sensorService } from '../services/sensorService.js'
import { deviceService } from '../services/deviceService.js'
import { SystemLog } from '../models/SystemLog.js'

class MQTTService {
  constructor() {
    this.client = null
    this.connected = false
    this.lastPingTime = null
    this.heartbeatInterval = null
  }

  async connect() {
    const options = {
      host: env.MQTT.HOST,
      port: env.MQTT.PORT,
      protocol: 'mqtts',
      username: env.MQTT.USERNAME,
      password: env.MQTT.PASSWORD,
      reconnectPeriod: 5000,
      keepalive: 60
    }

    console.log('MQTT Configuration:', {
      host: options.host,
      port: options.port,
      username: options.username
    })

    const url = `mqtts://${options.host}:${options.port}`
    
    try {
      this.client = mqtt.connect(url, options)

      this.client.on('connect', this.handleConnect.bind(this))
      this.client.on('message', this.handleMessage.bind(this))
      this.client.on('error', this.handleError.bind(this))
      this.client.on('close', this.handleClose.bind(this))

      // Start heartbeat check
      this.startHeartbeat()
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error)
      throw error
    }
  }

  startHeartbeat() {
    // Clear any existing interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    // Check connection every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      try {
        if (this.connected) {
          const latency = await this.getLatency()
          if (latency === null) {
            // Connection may be stale, attempt reconnect
            this.handleClose()
            this.client.reconnect()
          }
          this.lastPingTime = Date.now()
        }
      } catch (error) {
        await SystemLog.create({
          level: 'warning',
          source: 'mqtt',
          message: 'Heartbeat check failed',
          details: { error: error.message }
        })
      }
    }, 30000)
  }

  async handleConnect() {
    console.log('Connected to MQTT broker')
    this.connected = true
    this.lastPingTime = Date.now()

    // Subscribe to topics
    const topics = [
      `${env.MQTT_TOPIC_PREFIX}/sensors/#`,
      `${env.MQTT_TOPIC_PREFIX}/devices/#`
    ]

    topics.forEach(topic => this.client.subscribe(topic))

    await SystemLog.create({
      level: 'info',
      source: 'mqtt',
      message: 'Connected to MQTT broker'
    })
  }

  async handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString())
      const socketService = getSocketService()

      if (topic.includes('/sensors/')) {
        const sensorType = topic.split('/').pop()
        await sensorService.addReading(sensorType, payload.value, payload.unit)
        socketService.emitSensorUpdate(sensorType, payload)
      }

      if (topic.includes('/devices/')) {
        const deviceId = topic.split('/').pop()
        await deviceService.updateDeviceStatus(deviceId, payload)
        socketService.emitDeviceUpdate(deviceId, payload)
      }
    } catch (error) {
      console.error('Error handling MQTT message:', error)
      await SystemLog.create({
        level: 'error',
        source: 'mqtt',
        message: 'Error handling message',
        details: { error: error.message, topic }
      })
    }
  }

  async handleError(error) {
    console.error('MQTT error:', error)
    this.connected = false
    await SystemLog.create({
      level: 'error',
      source: 'mqtt',
      message: 'MQTT client error',
      details: { error: error.message }
    })
  }

  async handleClose() {
    console.log('MQTT connection closed')
    this.connected = false
    this.lastPingTime = null
    
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
      if (!this.connected) {
        console.log('Attempting to reconnect to MQTT...')
        this.connect()
      }
    }, 5000)
  }

  publish(topic, message) {
    if (!this.connected) {
      throw new Error('MQTT client not connected')
    }
    this.client.publish(`${env.MQTT_TOPIC_PREFIX}/${topic}`, JSON.stringify(message))
  }

  isConnected() {
    return this.connected &&
      this.lastPingTime &&
      (Date.now() - this.lastPingTime) < 60000 // Consider stale after 1 minute
  }

  async getLatency() {
    if (!this.connected) return null

    const start = Date.now()
    await new Promise((resolve) => {
      this.client.publish('$SYS/ping', '', { qos: 1 }, resolve)
    })
    return Date.now() - start
  }

  async disconnect() {
    if (this.client) {
      // Clear heartbeat interval
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }

      // End MQTT connection
      return new Promise((resolve) => {
        this.client.end(false, () => {
          this.connected = false
          this.lastPingTime = null
          resolve()
        })
      })
    }
  }
}

// Create and export singleton instance
const mqttService = new MQTTService()
export { mqttService }