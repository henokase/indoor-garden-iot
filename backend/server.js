import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import morgan from 'morgan'
import { env } from './src/config/env.js'
import { connectDB } from './src/config/database.js'
import { initializeSocket } from './src/config/socket.js'
import { errorHandler } from './src/middleware/errorHandler.js'
import { mqttService } from './src/config/mqtt.js'
import { AutomationService } from './src/services/automationService.js'
import routes from './src/routes/index.js'

const app = express()

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Routes
app.use('/api', routes)

// Error handling
app.use(errorHandler)

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
    const socketService = initializeSocket(httpServer)

    // Start automation service
    const automationService = new AutomationService()
    automationService.startAutomation()

    // Start server
    httpServer.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`)
    })

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('Shutting down gracefully...')
      
      // Stop services
      await mqttService.disconnect()
      
      // Close server
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err)
  process.exit(1)
})

startServer() 