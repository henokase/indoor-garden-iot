import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import SensorCard from "../components/overview/SensorCard";
import HistoryChart from "../components/overview/HistoryChart";
import { useState } from "react";
import { useSensorData } from "../hooks/useSensors";
import { useLightingDuration } from "../hooks/useLightingDuration";
import { useHistoricalData } from "../hooks/useHistoricalData";

function Overview() {
    const [filter, setFilter] = useState("temperature");

    const { currentReading: temperature, isLoading: tempLoading } = useSensorData("temperature");
    const { currentReading: moisture, isLoading: moistureLoading } = useSensorData("moisture");
    const { lighting, isLoading: lightingLoading } = useLightingDuration();
    const { history, isLoading: historyLoading } = useHistoricalData(filter);

    return (
        <div className="space-y-6">
            <motion.h1
                className="text-2xl font-bold text-gray-900 dark:text-white max-md:hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                System Overview
            </motion.h1>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <SensorCard
                    title="Temperature"
                    value={temperature?.value}
                    unit="°C"
                    color="text-red-500"
                    isLoading={tempLoading}
                />
                <SensorCard
                    title="Moisture"
                    value={moisture?.value}
                    unit="%"
                    color="text-blue-500"
                    isLoading={moistureLoading}
                />
                <SensorCard
                    title="Lighting Duration"
                    value={lighting?.duration}
                    unit="hours"
                    icon={Clock}
                    color="text-yellow-500"
                    isLoading={lightingLoading}
                />
            </motion.div>

            <motion.div className="flex p-2 bg-gray-200 dark:bg-gray-950 w-fit rounded-md">
                <button
                    className={`p-2 rounded-md w-32 font-medium text-gray-400 ${
                        filter === "temperature"
                            ? "bg-blue-500 text-white "
                            : ""
                    }`}
                    onClick={() => setFilter("temperature")}
                >
                    Temperature
                </button>
                <button
                    className={`p-2 rounded-md w-32 font-medium text-gray-400 ${
                        filter === "moisture"
                            ? "bg-blue-500 text-white"
                            : ""
                    }`}
                    onClick={() => setFilter("moisture")}
                >
                    Moisture
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <HistoryChart
                    title={filter === "temperature" ? "Temperature History" : "Moisture History"}
                    data={history}
                    dataKey={filter}
                    unit={filter === "temperature" ? "°C" : "%"}
                    color={filter === "temperature" ? "#ef4444" : "#3b82f6"}
                    isLoading={historyLoading}
                />
            </motion.div>
        </div>
    );
}

export default Overview;
