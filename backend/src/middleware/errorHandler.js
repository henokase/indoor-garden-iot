import { ApiError } from '../utils/ApiError.js'
import { SystemLog } from '../models/SystemLog.js'

export const errorHandler = async (err, req, res, next) => {
  // Log error
  console.error(err)

  // Log to database if it's a server error
  if (!err.statusCode || err.statusCode >= 500) {
    await SystemLog.create({
      level: 'error',
      source: 'system',
      message: err.message,
      details: {
        stack: err.stack,
        path: req.path,
        method: req.method
      }
    })
  }

  // Handle API Errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    })
  }

  // Handle Validation Errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }

  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  })
} 