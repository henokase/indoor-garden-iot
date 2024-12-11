import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useSensorHistory } from "../../hooks/useSensorHistory";

export function SensorHistoryChart({ dateRange }) {
    const [selectedMetrics, setSelectedMetrics] = useState([
        "temperature",
        "moisture",
    ]);
    const { data: temperatureData } = useSensorHistory("temperature");
    const { data: moistureData } = useSensorHistory("moisture");

    const metrics = [
        {
            id: "temperature",
            label: "Temperature",
            color: "#f97316",
            unit: "°C",
        },
        { id: "moisture", label: "Moisture", color: "#3b82f6", unit: "%" },
    ];

    // Format and combine data
    const formattedData = temperatureData
        .map((temp, index) => ({
            timestamp: new Date(temp.timestamp).getTime(),
            temperature: temp.value,
            moisture: moistureData[index]?.value,
        }))
        .filter((reading) => {
            const timestamp = new Date(reading.timestamp);
            return timestamp >= dateRange.start && timestamp <= dateRange.end;
        });

    return (
        <div>
            <div className="flex gap-2 mb-6">
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
              ${
                  selectedMetrics.includes(metric.id)
                      ? metric.id === "temperature"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50"
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
                            tickFormatter={(timestamp) =>
                                new Date(timestamp).toLocaleString()
                            }
                            scale="time"
                            stroke="#9CA3AF"
                        />
                        <YAxis
                            yAxisId="temperature"
                            orientation="left"
                            stroke="#f97316"
                            domain={[0, 40]}
                            tickFormatter={(value) => `${value}°C`}
                        />
                        <YAxis
                            yAxisId="moisture"
                            orientation="right"
                            stroke="#3b82f6"
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "white",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            }}
                            labelFormatter={(timestamp) =>
                                new Date(timestamp).toLocaleString()
                            }
                        />
                        <Legend />
                        {selectedMetrics.includes("temperature") && (
                            <Line
                                yAxisId="temperature"
                                type="monotone"
                                dataKey="temperature"
                                stroke="#f97316"
                                name="Temperature"
                                dot={false}
                            />
                        )}
                        {selectedMetrics.includes("moisture") && (
                            <Line
                                yAxisId="moisture"
                                type="monotone"
                                dataKey="moisture"
                                stroke="#3b82f6"
                                name="Moisture"
                                dot={false}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
