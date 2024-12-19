import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { env } from './src/config/env.js'
import connectDB from './src/config/database.js'
import { initializeSocket } from './src/config/socket.js'
import { mqttService } from './src/config/mqtt.js'
import { AutomationService } from './src/services/automationService.js'

// Import routes
import alertRoute from './src/routes/alertRoutes.js'
import authRoute from './src/routes/authRoutes.js'
import deviceRoute from './src/routes/deviceRoutes.js'
import resourceRoute from './src/routes/resourceRoutes.js'
import sensorRoute from './src/routes/sensorRoutes.js'
import settingsRoute from './src/routes/settingsRoutes.js'


const app = express()

// Middleware
app.use(cors({
  origin: [
    env.FRONTEND_URL || "https://gardensense.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()
    console.log('Connected to MongoDB')

    // Connect to MQTT broker
    try {
      await mqttService.connect()
      console.log('Connected to MQTT broker')
    } catch (mqttError) {
      console.error('Failed to connect to MQTT broker:', mqttError)
      // Continue server startup even if MQTT fails
    }

    // Create HTTP server
    const httpServer = createServer(app)

    // Initialize WebSocket
    initializeSocket(httpServer)

    // Routes
    app.use('/api/alerts', alertRoute)
    app.use('/api/auth', authRoute)
    app.use('/api/devices', deviceRoute)
    app.use('/api/resources', resourceRoute)
    app.use('/api/sensors', sensorRoute)
    app.use('/api/settings', settingsRoute)

    // Start automation service
    const automationService = new AutomationService()
    automationService.startAutomation()

    // Start server
    httpServer.listen(env.PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${env.PORT}`)
    })

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('Shutting down gracefully...')
      await mqttService.disconnect()
      httpServer.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    }

    // Handle shutdown signals
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer() 