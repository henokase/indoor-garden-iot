import { asyncHandler } from '../utils/asyncHandler.js'
import { resourceService } from '../services/resourceService.js'
import { exportUtils } from '../utils/exportUtils.js'
import { ApiError } from '../utils/ApiError.js'

export const resourceController = {
  getUsage: asyncHandler(async (req, res) => {
    const { type, startDate, endDate } = req.query
    const usage = await resourceService.getUsageStats(type, { startDate, endDate })
    res.json(usage)
  }),

  getDailyStats: asyncHandler(async (req, res) => {
    const { type, date } = req.query
    const stats = await resourceService.getDailyUsage(type, date)
    res.json(stats)
  }),

  exportUsageReport: asyncHandler(async (req, res) => {
    const { type, startDate, endDate, format } = req.query
    const data = await resourceService.getUsageStats(type, { startDate, endDate })
    
    if (format === 'csv') {
      const csv = exportUtils.generateCSV(data, [
        { key: 'date', label: 'Date' },
        { key: 'total', label: 'Total Usage' },
        { key: 'unit', label: 'Unit' }
      ])
      res.header('Content-Type', 'text/csv')
      res.attachment(`${type}-usage-report.csv`)
      return res.send(csv)
    }
    
    if (format === 'pdf') {
      const pdf = exportUtils.generatePDF({
        title: `${type.toUpperCase()} Usage Report`,
        table: {
          headers: ['Date', 'Total Usage', 'Unit'],
          data: data.map(d => [d.date, d.total, d.unit])
        }
      })
      res.header('Content-Type', 'application/pdf')
      res.attachment(`${type}-usage-report.pdf`)
      return res.send(pdf)
    }
    
    throw new ApiError(400, 'Invalid export format')
  })
} 