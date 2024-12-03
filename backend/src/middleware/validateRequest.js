import { ApiError } from '../utils/ApiError.js'

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedBody = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true
      })
      req.body = validatedBody
      next()
    } catch (error) {
      next(new ApiError(400, 'Validation Error', error.details))
    }
  }
} 