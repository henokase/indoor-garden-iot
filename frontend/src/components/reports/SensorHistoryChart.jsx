import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useSensorReadings } from "../../hooks/useSensorReadings";

export function SensorHistoryChart({ dateRange }) {
    const [selectedMetrics, setSelectedMetrics] = useState([
        "temperature",
        "moisture",
    ]);

    const {
        data: temperatureData,
        isLoading: temperatureLoading,
        message: temperatureMessage,
    } = useSensorReadings("temperature", dateRange);

    const {
        data: moistureData,
        isLoading: moistureLoading,
        message: moistureMessage,
    } = useSensorReadings("moisture", dateRange);

    const metrics = [
        { id: "temperature", label: "Temperature", color: "#f97316", unit: "°C" },
        { id: "moisture", label: "Moisture", color: "#3b82f6", unit: "%" },
    ];

    // Format and combine data with proper date range filtering
    const formattedData = temperatureData
        .map((temp, index) => ({
            timestamp: new Date(temp.timestamp).getTime(),
            temperature: temp.value,
            moisture: moistureData[index]?.value,
        }))
        .filter((reading) => {
            const timestamp = new Date(reading.timestamp);
            // Convert dateRange values to timestamps for proper comparison
            const startTime = dateRange?.start?.getTime();
            const endTime = dateRange?.end?.getTime();
            
            // Only filter if we have valid date range values
            if (startTime && endTime) {
                return timestamp >= startTime && timestamp <= endTime;
            }
            return true; // Include all data if no date range is specified
        });

    if (temperatureLoading || moistureLoading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (temperatureMessage || moistureMessage) {
        return (
            <div className="text-center py-8 text-gray-500">
                {temperatureMessage || moistureMessage}
            </div>
        );
    }

    // Format X-axis ticks based on the date range
    const formatXAxisTicks = () => {
        if (!formattedData.length) return [];
        
        const minTime = Math.min(...formattedData.map(d => d.timestamp));
        const maxTime = Math.max(...formattedData.map(d => d.timestamp));
        const diffHours = (maxTime - minTime) / (1000 * 60 * 60);
        
        let tickCount = 6;
        if (diffHours > 168) { // > 1 week
            tickCount = 7;
        } else if (diffHours > 24) { // > 1 day
            tickCount = 8;
        }
        
        // Generate evenly spaced ticks
        const ticks = [];
        for (let i = 0; i < tickCount; i++) {
            const tickTime = minTime + ((maxTime - minTime) * i) / (tickCount - 1);
            ticks.push(Math.round(tickTime)); // Round to avoid floating point issues
        }
        
        return Array.from(new Set(ticks)); // Remove any duplicates
    };

    return (
        <div>
            <div className="flex gap-2 mb-6 max-sm:p-6">
                {metrics.map((metric) => (
                    <button
                        key={metric.id}
                        onClick={() => {
                            setSelectedMetrics((prev) =>
                                prev.includes(metric.id)
                                    ? prev.filter((id) => id !== metric.id)
                                    : [...prev, metric.id]
                            );
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${selectedMetrics.includes(metric.id)
                                ? metric.id === "temperature"
                                    ? "bg-orange-200 text-orange-900"
                                    : "bg-blue-200 text-blue-900"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        {metric.label}
                    </button>
                ))}
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            ticks={formatXAxisTicks()}
                            tickFormatter={(timestamp) => {
                                const date = new Date(timestamp);
                                if (dateRange.end - dateRange.start > 7 * 24 * 60 * 60 * 1000) {
                                    return date.toLocaleDateString();
                                } else if (dateRange.end - dateRange.start > 24 * 60 * 60 * 1000) {
                                    return `${date.toLocaleDateString()} ${date.getHours()}:00`;
                                } else {
                                    return date.toLocaleTimeString();
                                }
                            }}
                            scale="time"
                            stroke="#9CA3AF"
                        />
                        {selectedMetrics.includes("temperature") && (
                            <>
                                <YAxis
                                    yAxisId="temperature"
                                    orientation="left"
                                    stroke="#f97316"
                                    domain={[0, 40]}
                                    tickFormatter={(value) => `${value}°C`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#f97316"
                                    yAxisId="temperature"
                                    dot={false}
                                />
                            </>
                        )}
                        {selectedMetrics.includes("moisture") && (
                            <>
                                <YAxis
                                    yAxisId="moisture"
                                    orientation="right"
                                    stroke="#3b82f6"
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="moisture"
                                    stroke="#3b82f6"
                                    yAxisId="moisture"
                                    dot={false}
                                />
                            </>
                        )}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                            }}
                            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
