import { motion } from 'framer-motion'
import { useState } from 'react'
import { UsageStats } from '../components/reports/UsageStats'
import { UsageChart } from '../components/reports/UsageChart'
import { Battery, Droplets, Thermometer } from 'lucide-react'
import { SensorHistoryChart } from '../components/reports/SensorHistoryChart'
import DateRangePicker from '../components/reports/DateRangePicker'

export default function Reports() {
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
    return { start, end }
  })
  const [selectedChartType, setSelectedChartType] = useState('resources') // 'resources' or 'sensors'

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <motion.h1 
        className="text-xl md:text-2xl font-bold mb-6"
        {...fadeIn}
      >
        Reports & Analysis
      </motion.h1>

      {/* Usage Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <UsageStats
          title="Energy Usage"
          icon={<Battery className="w-6 h-6" />}
          color="text-green-500"
          metrics={[
            { label: 'Daily', value: '2.5', unit: 'kWh' },
            { label: 'Weekly', value: '15.8', unit: 'kWh' },
            { label: 'Monthly', value: '65.3', unit: 'kWh' }
          ]}
        />
        <UsageStats
          title="Water Usage"
          icon={<Droplets className="w-6 h-6" />}
          color="text-blue-500"
          metrics={[
            { label: 'Daily', value: '1.2', unit: 'L' },
            { label: 'Weekly', value: '8.5', unit: 'L' },
            { label: 'Monthly', value: '34.2', unit: 'L' }
          ]}
        />
      </motion.div>

      {/* Date Range and Chart Type Selection */}
      <motion.div 
        className="bg-white rounded-2xl p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Calendar Selection */}
          <div className="flex items-center gap-4">
            <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
          </div> 

          {/* Chart Type Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedChartType('resources')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedChartType === 'resources' 
                  ? 'bg-green-50 text-green-600' 
                  : 'hover:bg-gray-50'}`}
            >
              Resource Usage
            </button>
            <button
              onClick={() => setSelectedChartType('sensors')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedChartType === 'sensors' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'hover:bg-gray-50'}`}
            >
              Sensor Data
            </button>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div 
        className="bg-white rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {selectedChartType === 'resources' ? (
          <UsageChart dateRange={dateRange} />
        ) : (
          <SensorHistoryChart dateRange={dateRange} />
        )}
      </motion.div>
    </div>
  )
} 