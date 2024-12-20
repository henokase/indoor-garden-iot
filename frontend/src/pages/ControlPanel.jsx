import { useDeviceStatus } from "../hooks/useDeviceStatus";
import { Fan, Droplets, FlaskConical, Lightbulb } from "lucide-react";
import { DeviceCard } from "../components/control/DeviceCard";
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function ControlPanel() {
    const { deviceStatusData = [], isLoading, error } = useDeviceStatus();
    const [deviceList, setDeviceList] = useState([
        {
            name: "irrigation",
            label: "Irrigation",
            icon: <Droplets className="w-6 h-6" />,
            iconColor: "text-blue-500",
        },
        {
            name: "fan",
            label: "Fan",
            icon: <Fan className="w-6 h-6" />,
            iconColor: "text-gray-500",
        },
        {
            name: "lighting",
            label: "Lighting",
            icon: <Lightbulb className="w-6 h-6" />,
            iconColor: "text-yellow-500",
        },
        {
            name: "fertilizer",
            label: "Fertilizer",
            icon: <FlaskConical className="w-6 h-6" />,
            iconColor: "text-green-500",
        },
    ]);

    // Merge device status with device list
    const mergedDevices = useMemo(() => {
        if (!Array.isArray(deviceStatusData)) return deviceList;
        return deviceList.map((device) => {
            const deviceStatus = deviceStatusData.find(
                (d) => d?.name === device.name
            );
            return {
                ...device,
                status: deviceStatus?.status ?? false,
                autoMode: deviceStatus?.autoMode ?? false,
                lastUpdated: deviceStatus?.lastUpdated,
            };
        });
    }, [deviceStatusData, deviceList]);

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load devices. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-1 sm:p-4 md:p-6 max-w-7xl mx-auto">
            <motion.h1
                className="text-2xl max-sm:pt-3 font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Control Panel
            </motion.h1>
            <div className="space-y-6">
                {mergedDevices.map((device) => (
                    <DeviceCard key={device.name} device={device} />
                ))}
            </div>
        </div>
    );
}
