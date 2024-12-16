import { ResourceUsage } from '../models/ResourceUsage.js'

export const resourceService = {
  async trackUsage({ date, energy, water }) {
    // Find or create resource usage record for the day
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    let usage = await ResourceUsage.findOne({
      date: {
        $gte: dayStart,
        $lte: dayEnd
      }
    })

    if (!usage) {
      usage = new ResourceUsage({
        date: dayStart,
        energy: { total: 0, breakdown: new Map() },
        water: { total: 0, breakdown: new Map() }
      })
    }

    // Update energy usage
    if (energy) {
      usage.energy.total += energy.total
      for (const [device, amount] of Object.entries(energy.breakdown)) {
        const current = usage.energy.breakdown.get(device) || 0
        usage.energy.breakdown.set(device, current + amount)
      }
    }

    // Update water usage
    if (water) {
      usage.water.total += water.total
      for (const [device, amount] of Object.entries(water.breakdown)) {
        const current = usage.water.breakdown.get(device) || 0
        usage.water.breakdown.set(device, current + amount)
      }
    }

    await usage.save()
    return usage
  },

  async getUsageByDateRange(startDate, endDate) {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const usageData = await ResourceUsage.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).lean()

    // Convert Map to Object and format the data for frontend
    return usageData.map(usage => ({
      date: usage.date,
      energy: {
        total: usage.energy?.total || 0,
        breakdown: usage.energy?.breakdown ? Object.fromEntries(Object.entries(usage.energy.breakdown)) : {}
      },
      water: {
        total: usage.water?.total || 0,
        breakdown: usage.water?.breakdown ? Object.fromEntries(Object.entries(usage.water.breakdown)) : {}
      }
    }))
  },

  async getUsageStats(startDate, endDate) {
    const usages = await this.getUsageByDateRange(startDate, endDate)
    if (!usages || usages.length === 0) {
      return {
        energy: {
          total: 0,
          daily: 0,
          weekly: 0
        },
        water: {
          total: 0,
          daily: 0,
          weekly: 0
        }
      }
    }

    // Calculate total days in range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

    // Calculate stats for energy
    const energyTotal = usages.reduce((sum, usage) => sum + (usage.energy?.total || 0), 0)
    const energyDaily = energyTotal / days
    const energyWeekly = energyTotal / (days / 7)

    // Calculate stats for water
    const waterTotal = usages.reduce((sum, usage) => sum + (usage.water?.total || 0), 0)
    const waterDaily = waterTotal / days
    const waterWeekly = waterTotal / (days / 7)

    return {
      energy: {
        total: Number(energyTotal.toFixed(1)),
        daily: Number(energyDaily.toFixed(1)),
        weekly: Number(energyWeekly.toFixed(1))
      },
      water: {
        total: Number(waterTotal.toFixed(1)),
        daily: Number(waterDaily.toFixed(1)),
        weekly: Number(waterWeekly.toFixed(1))
      }
    }
  }
}