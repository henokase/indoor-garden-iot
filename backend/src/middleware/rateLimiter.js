import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT.WINDOW_MS,
  max: env.RATE_LIMIT.MAX_REQUESTS,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later'
  }
}) 