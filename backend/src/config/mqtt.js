import mqtt from 'mqtt'
import { env } from './env.js'
import { emitSensorUpdate } from './socket.js'
import { deviceService } from '../services/deviceService.js'
import { SensorReading } from '../models/Sensor.js'

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

      this.startHeartbeat()
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error)
      throw error
    }
  }

  startHeartbeat() {
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(async () => {
      try {
        if (this.connected) {
          const latency = await this.getLatency()
          if (latency === null) {
            
            this.handleClose()
            this.client.reconnect()
          }
          this.lastPingTime = Date.now()
        }
      } catch (error) {
        console.error('Heartbeat check failed:', error)
      }
    }, 30000)
  }

  async handleConnect() {
    console.log('Connected to MQTT broker')
    this.connected = true
    this.lastPingTime = Date.now()

    const topics = [
      'indoor-garden/sensors',
      'indoor-garden/devices'  
    ]

    topics.forEach(topic => this.client.subscribe(topic))
    console.log('Subscribed to topics:', topics)
  }

  async handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString())

      if (topic === 'indoor-garden/sensors') {
        // console.log('MQTT Message Received:', { topic, payload })
        
        let timestamp;
        try {
          timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
          
          if (isNaN(timestamp.getTime())) {
            console.warn('Invalid timestamp received:', payload.timestamp);
            timestamp = new Date();
          }
        } catch (error) {
          console.warn('Error parsing timestamp:', error);
          timestamp = new Date();
        }

        // console.log('Processing sensor reading with timestamp:', timestamp.toISOString())

        const sensorPromises = [
          SensorReading.create({
            type: 'temperature',
            value: payload.temperature,
            unit: 'C',
            timestamp: timestamp
          }),
          SensorReading.create({
            type: 'moisture',
            value: payload.moisture,
            unit: '%',
            timestamp: timestamp
          })
        ]

        const [tempReading, moistureReading] = await Promise.all(sensorPromises)
        // console.log('Saved sensor readings:', {
        //   temperature: {
        //     value: tempReading.value,
        //     timestamp: tempReading.timestamp
        //   },
        //   moisture: {
        //     value: moistureReading.value,
        //     timestamp: moistureReading.timestamp
        //   }
        // })

        emitSensorUpdate('temperature', {
          type: 'temperature',
          value: payload.temperature || null,
          timestamp: timestamp
        })
        emitSensorUpdate('moisture', {
          type: 'moisture',
          value: payload.moisture || null,
          timestamp: timestamp
        })
      }

      if (topic === 'indoor-garden/devices') {
        try {
          const deviceName = payload.device;
          // console.log('\n=== Device Update Request ===');
          // console.log('Received device name:', deviceName);
          
          // console.log('Full payload:', payload);

          const deviceState = {
            status: payload.status,
            autoMode: payload.autoMode,
            lastUpdated: payload.lastUpdated || new Date()
          };
          
          const updatedDevice = await deviceService.updateDeviceStatus(deviceName, deviceState);
          // console.log(deviceName, ' result:', updatedDevice ? 'Success' : 'Failed');
          // console.log('===========================\n');
        } catch (error) {
          console.error('Error updating device:', error);
        }
      }
    } catch (error) {
      console.error('Error handling MQTT message:', error)
    }
  }

  async handleError(error) {
    console.error('MQTT error:', error)
    this.connected = false
  }

  async handleClose() {
    console.log('MQTT connection closed')
    this.connected = false
    this.lastPingTime = null

    setTimeout(() => {
      if (!this.connected) {
        console.log('Attempting to reconnect to MQTT...')
        this.connect()
      }
    }, 5000)
  }

  async publish(topic, message) {
    if (!this.connected) {
      throw new Error('MQTT client not connected')
    }
    this.client.publish(topic, JSON.stringify(message))
    console.log(`Published message to ${topic}:`, message)
  }

  isConnected() {
    return this.connected &&
      this.lastPingTime &&
      (Date.now() - this.lastPingTime) < 60000
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
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }

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

const mqttService = new MQTTService()
export { mqttService }