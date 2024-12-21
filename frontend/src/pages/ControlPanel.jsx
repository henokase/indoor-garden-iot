import { useDeviceStatus } from "../hooks/useDeviceStatus";
import { Fan, Droplets, FlaskConical, Lightbulb } from "lucide-react";
import { DeviceCard } from "../components/control/DeviceCard";
import { useMemo } from "react";

// Move deviceList outside component to prevent recreation on each render
const deviceList = [
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
];

export default function ControlPanel() {
    const { deviceStatusData = [], isLoading, error } = useDeviceStatus();

    // Optimize merging logic
    const mergedDevices = useMemo(() => {
        if (!Array.isArray(deviceStatusData)) return deviceList;
        const statusMap = new Map(deviceStatusData.map(d => [d.name, d]));
        
        return deviceList.map((device) => {
            const deviceStatus = statusMap.get(device.name);
            if (!deviceStatus) return device;
            
            return {
                ...device,
                status: deviceStatus.status ?? false,
                autoMode: deviceStatus.autoMode ?? false,
                lastUpdated: deviceStatus.lastUpdated,
            };
        });
    }, [deviceStatusData]);

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
            <h1 className="text-2xl max-sm:pt-3 font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                Control Panel
            </h1>
            <div className="space-y-6">
                {mergedDevices.map((device) => (
                    <DeviceCard key={device.name} device={device} />
                ))}
            </div>
        </div>
    );
}
