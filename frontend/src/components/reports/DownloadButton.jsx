import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';

export function DownloadButton({ type, dateRange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownloadClick = (downloadType) => {
    setIsOpen(false);
    downloadData(downloadType);
  };

  const downloadData = async (downloadType) => {
    try {
      let csvContent = '';
      let fileName = '';

      if (downloadType === 'resources') {
        // Fetch resource data directly
        const { data: resourceData } = await api.get('/resources/usage', {
          params: {
            startDate: dateRange.start.toISOString(),
            endDate: dateRange.end.toISOString()
          }
        });

        // Format resource data
        csvContent = 'Date,Energy Usage (kWh),Water Usage (L)\n';
        if (Array.isArray(resourceData)) {
          resourceData.forEach(entry => {
            const date = formatDate(entry.date);
            const energy = entry.energy?.total || 0;
            const water = entry.water?.total || 0;
            csvContent += `${date},${energy.toFixed(2)},${water.toFixed(2)}\n`;
          });
        }
        fileName = `resource_usage_${formatDate(dateRange.start)}_to_${formatDate(dateRange.end)}.csv`;
      } else if (downloadType === 'sensors') {
        // Fetch both sensor readings
        const [tempResponse, moistResponse] = await Promise.all([
          api.get('/sensors/temperature/download', {
            params: {
              startDate: dateRange.start.toISOString(),
              endDate: dateRange.end.toISOString()
            }
          }),
          api.get('/sensors/moisture/download', {
            params: {
              startDate: dateRange.start.toISOString(),
              endDate: dateRange.end.toISOString()
            }
          })
        ]);

        const temperatureData = tempResponse.data.data || [];
        const moistureData = moistResponse.data.data || [];

        // Format sensor data
        csvContent = 'Date,Temperature (°C),Moisture (%)\n';
        
        // Create a map of timestamps to combine readings
        const readingsMap = new Map();
        
        temperatureData.forEach(entry => {
          const timestamp = new Date(entry.timestamp).getTime();
          if (!readingsMap.has(timestamp)) {
            readingsMap.set(timestamp, { temperature: entry.value });
          } else {
            readingsMap.get(timestamp).temperature = entry.value;
          }
        });

        moistureData.forEach(entry => {
          const timestamp = new Date(entry.timestamp).getTime();
          if (!readingsMap.has(timestamp)) {
            readingsMap.set(timestamp, { moisture: entry.value });
          } else {
            readingsMap.get(timestamp).moisture = entry.value;
          }
        });

        // Convert map to CSV
        Array.from(readingsMap.entries())
          .sort(([a], [b]) => a - b)
          .forEach(([timestamp, values]) => {
            const date = formatDate(new Date(timestamp));
            const temp = values.temperature?.toFixed(2) || '';
            const moisture = values.moisture?.toFixed(2) || '';
            csvContent += `${date},${temp},${moisture}\n`;
          });

        fileName = `sensor_readings_${formatDate(dateRange.start)}_to_${formatDate(dateRange.end)}.csv`;
      }

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data. Please try again.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 bg-green-600 hover:bg-green-700'
      >
          <Download className="w-4 h-4" />
          <span>Download</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 mt-2 w-48 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow-lg shadow-gray-700 overflow-hidden z-50"
          >
            <button
              onClick={() => handleDownloadClick('resources')}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Resource Usage
            </button>
            <button
              onClick={() => handleDownloadClick('sensors')}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Sensor History
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
