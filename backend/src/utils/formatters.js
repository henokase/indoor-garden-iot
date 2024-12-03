export const formatters = {
  temperature: (value, unit = 'C') => {
    if (unit === 'F') {
      value = (value * 9/5) + 32
    }
    return `${value.toFixed(1)}°${unit}`
  },

  moisture: (value) => `${value.toFixed(1)}%`,

  duration: (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  },

  energy: (value) => `${value.toFixed(2)} kWh`,

  water: (value) => `${value.toFixed(1)} L`,

  timestamp: (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  csvData: (data, fields) => {
    const header = fields.map(f => f.label).join(',')
    const rows = data.map(item => 
      fields.map(f => item[f.key]).join(',')
    )
    return [header, ...rows].join('\n')
  },

  resourceUsage: (usage) => ({
    energy: {
      total: formatters.energy(usage.energy.total),
      breakdown: Object.entries(usage.energy.breakdown)
        .reduce((acc, [key, value]) => {
          acc[key] = formatters.energy(value)
          return acc
        }, {})
    },
    water: {
      total: formatters.water(usage.water.total),
      breakdown: Object.entries(usage.water.breakdown)
        .reduce((acc, [key, value]) => {
          acc[key] = formatters.water(value)
          return acc
        }, {})
    }
  })
} 