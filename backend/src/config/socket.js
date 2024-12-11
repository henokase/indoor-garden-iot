import { Server } from 'socket.io'
import { env } from './env.js'

let io

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL || "http://localhost:5173",
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io',
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('subscribe:sensor', (sensorId) => {
      socket.join(`sensors:${sensorId}`)
      console.log(`Client ${socket.id} subscribed to sensor ${sensorId}`)
    })

    socket.on('subscribe:device', (deviceId) => {
      socket.join(`devices:${deviceId}`)
      console.log(`Client ${socket.id} subscribed to device ${deviceId}`)
    })

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`)
    })
  })

  return io
}

// Emit functions with delivery acknowledgment
export const emitSensorUpdate = async (type, data) => {
  if (!io) throw new Error('Socket.IO not initialized')
  
  const room = `sensors:${type}`
  const eventData = {
    type,
    value: data.value,
    timestamp: data.timestamp
  }

  const sockets = await io.in(room).fetchSockets()
  console.log(`Found ${sockets.length} clients in room ${room}`)
  
  if (sockets.length === 0) {
    console.log(`No clients in room ${room}, skipping emission`)
    return
  }

  io.to(room).emit('sensor:update', eventData)
  console.log(`Sensor update emitted to ${sockets.length} clients in ${room}`)
}

export const emitDeviceUpdate = async (deviceName, data) => {
  if (!io) throw new Error('Socket.IO not initialized')
  
  const room = `devices:${deviceName}`
  const sockets = await io.in(room).fetchSockets()
  
  if (sockets.length === 0) {
    console.log(`No clients in room ${room}, skipping emission`)
    return
  }

  io.to(room).emit('device:update', data)
  console.log(`Device update emitted to ${sockets.length} clients in ${room}`)
}

export const emitSystemAlert = async (alert) => {
  if (!io) throw new Error('Socket.IO not initialized')
  
  const sockets = await io.fetchSockets()
  const promises = sockets.map(socket => 
    new Promise((resolve) => {
      socket.emit('system:alert', alert, resolve)
    })
  )

  await Promise.all(promises)
  console.log(`System alert emitted to ${sockets.length} clients`)
}

export const emitSystemStatus = async (status) => {
  if (!io) throw new Error('Socket.IO not initialized')
  
  const sockets = await io.fetchSockets()
  const promises = sockets.map(socket => 
    new Promise((resolve) => {
      socket.emit('system:status', status, resolve)
    })
  )

  await Promise.all(promises)
  console.log(`System status emitted to ${sockets.length} clients`)
}

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized')
  return io
} 