export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors)
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message)
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message)
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message)
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message)
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message)
  }
} 