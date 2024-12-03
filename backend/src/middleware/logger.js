import { SystemLog } from '../models/SystemLog.js'

export const requestLogger = async (req, res, next) => {
  const start = Date.now()

  res.on('finish', async () => {
    const duration = Date.now() - start
    const level = res.statusCode >= 400 ? 'warning' : 'info'

    await SystemLog.create({
      level,
      source: 'system',
      message: `${req.method} ${req.originalUrl}`,
      details: {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    })
  })

  next()
} 