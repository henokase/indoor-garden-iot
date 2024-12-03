import { asyncHandler } from '../utils/asyncHandler.js'
import { deviceService } from '../services/deviceService.js'
import { ApiError } from '../utils/ApiError.js'

export const deviceController = {
  getAllDevices: asyncHandler(async (req, res) => {
    const devices = await deviceService.getAllDevices()
    res.json(devices)
  }),

  getDevice: asyncHandler(async (req, res) => {
    const { id } = req.params
    const device = await deviceService.getDevice(id)
    if (!device) {
      throw new ApiError(404, 'Device not found')
    }
    res.json(device)
  }),

  toggleDevice: asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status } = req.body
    const device = await deviceService.toggleDevice(id, status)
    res.json(device)
  }),

  setAutoMode: asyncHandler(async (req, res) => {
    const { id } = req.params
    const { enabled } = req.body
    const device = await deviceService.setAutoMode(id, enabled)
    res.json(device)
  })
} 