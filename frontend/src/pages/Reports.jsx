import { motion } from 'framer-motion'
import { useState } from 'react'
import { UsageStats } from '../components/reports/UsageStats'
import { UsageChart } from '../components/reports/UsageChart'
import { Battery, Droplets } from 'lucide-react'
import { SensorHistoryChart } from '../components/reports/SensorHistoryChart'
import DateRangePicker from '../components/reports/DateRangePicker'
import { useResourceStats } from '../hooks/useResourceUsage'

export default function Reports() {
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
    return { start, end }
  })
  const [selectedChartType, setSelectedChartType] = useState('resources') // 'resources' or 'sensors'
  const { data: resourceStats, isLoading } = useResourceStats(dateRange)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <motion.h1 
        className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text"
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
          stats={resourceStats?.energy}
          unit="kWh"
          isLoading={isLoading}
        />
        <UsageStats
          title="Water Usage"
          icon={<Droplets className="w-6 h-6" />}
          color="text-blue-500"
          stats={resourceStats?.water}
          unit="L"
          isLoading={isLoading}
        />
      </motion.div>

      {/* Chart Type Selector */}
      <motion.div 
        className="flex max-md:flex-col justify-between gap-4 mb-6 bg-green-50 rounded-lg shadow-sm p-6 dark:bg-gray-800"
        {...fadeIn}
      >
        <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
        <div className='flex gap-10'>
        <button
          className={`px-4 py-2 rounded-lg ${
            selectedChartType === 'resources'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setSelectedChartType('resources')}
        >
          Resource Usage
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            selectedChartType === 'sensors'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setSelectedChartType('sensors')}
        >
          Sensor Data
        </button>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        className="bg-green-50 rounded-lg shadow-sm p-6 dark:bg-gray-800"
        {...fadeIn}
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