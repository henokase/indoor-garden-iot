import { connectDB } from '../config/database.js'
import { systemService } from '../services/systemService.js'
import { SystemLog } from '../models/SystemLog.js'

async function checkSystem() {
  try {
    await connectDB()
    console.log('Running system health check...')

    const health = await systemService.getSystemHealth()
    console.log('System Health:', JSON.stringify(health, null, 2))

    // Log the health check results
    await SystemLog.create({
      level: health.status === 'healthy' ? 'info' : 'warning',
      source: 'health_check',
      message: 'System health check completed',
      details: health
    })

    // If system is unhealthy, send notifications
    if (health.status !== 'healthy') {
      const unhealthyServices = Object.entries(health.checks)
        .filter(([, check]) => check.status !== 'healthy')
        .map(([service]) => service)

      await SystemLog.create({
        level: 'warning',
        source: 'health_check',
        message: 'Unhealthy services detected',
        details: { services: unhealthyServices }
      })
    }

    process.exit(0)
  } catch (error) {
    console.error('Error during health check:', error)
    await SystemLog.create({
      level: 'error',
      source: 'health_check',
      message: 'Health check failed',
      details: { error: error.message }
    })
    process.exit(1)
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkSystem()
}

export { checkSystem } 