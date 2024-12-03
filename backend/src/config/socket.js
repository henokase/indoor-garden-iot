import { Server } from 'socket.io'
import { env } from './env.js'
import { SystemLog } from '../models/SystemLog.js'

export class SocketService {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    })
0
    this.io.on('connection', this.handleConnection.bind(this))
  }

  async handleConnection(socket) {
    console.log('Client connected:', socket.id)

    try {
      await SystemLog.create({
        level: 'info',
        source: 'system',
        message: 'New socket connection',
        details: { socketId: socket.id }
      })
    } catch (error) {
      console.error('Error logging socket connection:', error)
    }

    // Subscribe to sensor updates
    socket.on('subscribe:sensor', (type) => {
      socket.join(`sensor:${type}`)
    })

    // Subscribe to device updates
    socket.on('subscribe:device', (deviceId) => {
      socket.join(`device:${deviceId}`)
    })

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id)
      try {
        await SystemLog.create({
          level: 'info',
          source: 'system',
          message: 'Socket disconnected',
          details: { socketId: socket.id }
        })
      } catch (error) {
        console.error('Error logging socket disconnection:', error)
      }
    })
  }

  // Emit sensor updates to subscribed clients
  emitSensorUpdate(type, data) {
    this.io.to(`sensor:${type}`).emit('sensor:update', {
      type,
      data
    })
  }

  // Emit device status updates
  emitDeviceUpdate(deviceId, status) {
    this.io.to(`device:${deviceId}`).emit('device:update', {
      deviceId,
      status
    })
  }

  // Emit system alerts
  emitAlert(alert) {
    this.io.emit('alert', alert)
  }

  // Broadcast system status updates
  emitSystemStatus(status) {
    this.io.emit('system:status', status)
  }
}

// Create and export socket instance
let socketService = null

export const initializeSocket = (httpServer) => {
  socketService = new SocketService(httpServer)
  return socketService
}

export const getSocketService = () => {
  if (!socketService) {
    throw new Error('Socket service not initialized')
  }
  return socketService
} 