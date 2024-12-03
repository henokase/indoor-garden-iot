import Joi from 'joi'
import { SYSTEM_CONSTANTS } from '../config/constants.js'

export const schemas = {
  sensor: {
    reading: Joi.object({
      type: Joi.string().required().valid('temperature', 'moisture'),
      value: Joi.number().required(),
      unit: Joi.string().required()
    }),
    timeRange: Joi.string()
      .pattern(/^\d+[hd]$/)
      .message('Time range must be in format: 24h, 7d, etc.')
  },

  device: {
    toggle: Joi.object({
      status: Joi.boolean().required()
    }),
    autoMode: Joi.object({
      enabled: Joi.boolean().required()
    })
  },

  settings: {
    preferences: Joi.object({
      temperatureUnit: Joi.string().valid('C', 'F'),
      temperatureThreshold: Joi.number()
        .min(SYSTEM_CONSTANTS.TEMPERATURE_LIMITS.MIN)
        .max(SYSTEM_CONSTANTS.TEMPERATURE_LIMITS.MAX),
      moistureThreshold: Joi.number()
        .min(SYSTEM_CONSTANTS.MOISTURE_LIMITS.MIN)
        .max(SYSTEM_CONSTANTS.MOISTURE_LIMITS.MAX),
      lightingStartHour: Joi.number()
        .min(SYSTEM_CONSTANTS.LIGHTING_HOURS.MIN)
        .max(SYSTEM_CONSTANTS.LIGHTING_HOURS.MAX),
      lightingEndHour: Joi.number()
        .min(SYSTEM_CONSTANTS.LIGHTING_HOURS.MIN)
        .max(SYSTEM_CONSTANTS.LIGHTING_HOURS.MAX)
    }),
    notifications: Joi.object({
      email: Joi.object({
        enabled: Joi.boolean(),
        address: Joi.when('enabled', {
          is: true,
          then: Joi.string().email().required()
        })
      }),
      sms: Joi.object({
        enabled: Joi.boolean(),
        number: Joi.when('enabled', {
          is: true,
          then: Joi.string().pattern(/^\+\d{10,15}$/).required()
        })
      }),
      push: Joi.object({
        enabled: Joi.boolean()
      }),
      frequency: Joi.string().valid('immediate', 'hourly', 'daily')
    })
  },

  resource: {
    usage: Joi.object({
      deviceId: Joi.string().required(),
      type: Joi.string().valid('energy', 'water').required(),
      value: Joi.number().positive().required(),
      unit: Joi.string().required()
    })
  },

  alert: {
    resolve: Joi.object({
      resolution: Joi.string()
        .required()
        .max(500)
        .messages({
          'string.empty': 'Resolution is required',
          'string.max': 'Resolution cannot be longer than 500 characters'
        })
    }),
    
    acknowledge: Joi.object({
      notes: Joi.string()
        .max(500)
        .optional()
        .messages({
          'string.max': 'Notes cannot be longer than 500 characters'
        })
    })
  }
}

// Helper function to sanitize date filters
export const sanitizeDateFilters = (filters) => {
  const sanitized = {}

  if (filters.startDate) {
    sanitized.startDate = new Date(filters.startDate)
    if (isNaN(sanitized.startDate)) {
      throw new Error('Invalid start date')
    }
  }

  if (filters.endDate) {
    sanitized.endDate = new Date(filters.endDate)
    if (isNaN(sanitized.endDate)) {
      throw new Error('Invalid end date')
    }
  }

  return {
    ...filters,
    ...sanitized
  }
} 