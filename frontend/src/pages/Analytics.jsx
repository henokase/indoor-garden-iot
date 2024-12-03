import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, BarChart2, Droplets } from "lucide-react";
import DateRangePicker from "../components/analytics/DateRangePicker";
import ResourceCard from "../components/analytics/ResourceCard";
import AnalyticsChart from "../components/analytics/AnalyticsChart";
import ExportButton from "../components/analytics/ExportButton";
import { fetchAnalyticsData, fetchResourceUsage } from "../lib/api";

function Analytics() {
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        to: new Date(),
    });

    const { data: analyticsData, isLoading: chartsLoading } = useQuery({
        queryKey: ["analytics", dateRange],
        queryFn: () => fetchAnalyticsData(dateRange),
        keepPreviousData: true,
    });

    const { data: resourceData, isLoading: resourceLoading } = useQuery({
        queryKey: ["resources", dateRange],
        queryFn: () => fetchResourceUsage(dateRange),
        keepPreviousData: true,
    });

    return (
        <div className="space-y-6 w-full ">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <motion.h1
                    className="text-2xl font-bold text-gray-900 dark:text-white max-md:hidden"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    Analytics & Reports
                </motion.h1>

                <div className="flex items-center gap-2 max-md:w-full max-md:justify-evenly max-sm:flex-col max-sm:items-end">
                    <DateRangePicker
                        dateRange={dateRange}
                        onChange={setDateRange}
                    />
                    <ExportButton dateRange={dateRange} data={analyticsData} />
                </div>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <ResourceCard
                    title="Energy Consumption"
                    value={resourceData?.energy}
                    unit="kWh"
                    icon={BarChart2}
                    isLoading={resourceLoading}
                />
                <ResourceCard
                    title="Water Usage"
                    value={resourceData?.water}
                    unit="L"
                    icon={Droplets}
                    isLoading={resourceLoading}
                />
            </motion.div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-sm:w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <AnalyticsChart
                    title="Temperature Trends"
                    data={analyticsData?.temperature}
                    dataKey="temperature"
                    unit="°C"
                    color="#ef4444"
                    isLoading={chartsLoading}
                />
                <AnalyticsChart
                    title="Moisture Trends"
                    data={analyticsData?.moisture}
                    dataKey="moisture"
                    unit="%"
                    color="#3b82f6"
                    isLoading={chartsLoading}
                />
            </motion.div>
        </div>
    );
}

export default Analytics;
