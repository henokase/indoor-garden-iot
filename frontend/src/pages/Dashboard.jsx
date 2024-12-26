import { motion } from "framer-motion";
import { useSensorData } from "../hooks/useSensorData";
import { RadialSensor } from "../components/dashboard/RadialSensor";
import { Thermometer, Droplets } from "lucide-react";
import { SensorChart } from "../components/dashboard/SensorChart";
import { useFetchSettings } from "../hooks/useSettings";
import { toast } from 'react-hot-toast'

export default function Dashboard() {
    const { sensorData, isLoading, error } = useSensorData();
    const { data: settings } = useFetchSettings();

    // Temperature conversion function
    const convertTemperature = (celsius) => {
        if (settings?.preferences?.temperatureUnit === "F") {
            return (celsius * 9) / 5 + 32;
        }
        return celsius;
    };

    // Get temperature range based on unit
    const getTempRange = () => {
        if (settings?.preferences?.temperatureUnit === "F") {
            return { min: convertTemperature(10), max: convertTemperature(35) };
        }
        return { min: 10, max: 35 };
    };

    // Check if values are within thresholds
    const getTemperatureColor = (value) => {
        if (!value || !settings?.preferences) return "text-orange-500";
        const temp =
            settings?.preferences?.temperatureUnit === "F"
                ? ((value - 32) * 5) / 9 // Convert to Celsius for comparison
                : value;
        
        const minTemp = settings?.preferences?.minTemperatureThreshold;
        const maxTemp = settings?.preferences?.maxTemperatureThreshold;
        
        // Only return red if both thresholds are set and value is outside range
        if (minTemp !== undefined && maxTemp !== undefined) {
            return (temp < minTemp || temp > maxTemp)
                ? "text-red-500"
                : "text-orange-500";
        }
        return "text-orange-500";
    };

    const getMoistureColor = (value) => {
        if (!value || !settings?.preferences) return "text-blue-500";
        
        const minMoisture = settings?.preferences?.minMoistureThreshold;
        const maxMoisture = settings?.preferences?.maxMoistureThreshold;
        
        // Only return red if both thresholds are set and value is outside range
        if (minMoisture !== undefined && maxMoisture !== undefined) {
            return (value < minMoisture || value > maxMoisture)
                ? "text-red-500"
                : "text-blue-500";
        }
        return "text-blue-500";
    };

    const toastId = 'sensor error'
    if (error) {
        toast.error(error, { id: toastId } )
    }

    const tempRange = getTempRange();
    const currentTemp = isLoading
        ? null
        : convertTemperature(sensorData?.temperature);

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <motion.h1
                className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Garden Overview
            </motion.h1>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <RadialSensor
                    title="Temperature" 
                    value={currentTemp}
                    unit={`°${settings?.preferences?.temperatureUnit || "C"}`}
                    icon={Thermometer}
                    color={getTemperatureColor(currentTemp)}
                    min={tempRange.min}
                    max={tempRange.max}
                />
                <RadialSensor
                    title="Moisture"
                    value={isLoading ? null : sensorData?.moisture}
                    unit="%"
                    icon={Droplets}
                    color={getMoistureColor(sensorData?.moisture)}
                    min={0}
                    max={100}
                />
            </motion.div>

            {/* Sensor Chart */}
            <motion.div
                className="bg-green-50 dark:bg-gray-800 rounded-lg shadow-sm p-1 sm:p-4 md:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <SensorChart temperatureUnit={settings?.preferences?.temperatureUnit} />
            </motion.div>
        </div>
    );
}
