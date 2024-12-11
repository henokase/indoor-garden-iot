import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PreferencesCard } from "../components/settings/PreferencesCard";
// import { AlertsCard } from "../components/settings/AlertsCard";
import { NotificationsCard } from "../components/settings/NotificationsCard";
import { PasswordCard } from "../components/settings/PasswordCard";
import { useFetchSettings, useUpdateSettings } from "../hooks/useSettings";
import { toast } from "react-hot-toast";

export default function Settings() {
    const [formData, setFormData] = useState({
        preferences: {
            temperatureUnit: 'C',
            minTemperatureThreshold: 15,
            maxTemperatureThreshold: 25,
            minMoistureThreshold: 40,
            maxMoistureThreshold: 60,
            lightingStartHour: 6,
            lightingEndHour: 18,
            fertilizerSchedule: 'weekly',
            fertilizerTime: 8,
            fertilizerDayOfWeek: 'Monday',
            fertilizerDayOfMonth: 1
        },
        notifications: {
            email: {
                enabled: false,
                address: ''
            },
            push: false
        }
    });

    const { data: settings, isLoading, isFetching } = useFetchSettings();
    const updateSettingsMutation = useUpdateSettings();

    useEffect(() => {
        if (settings) {
            setFormData(prev => ({
                ...prev,
                ...settings,
                notifications: {
                    email: {
                        enabled: settings.notifications?.email?.enabled ?? false,
                        address: settings.notifications?.email?.address || ''
                    },
                    push: settings.notifications?.push ?? false
                }
            }));
        }
    }, [settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = { ...prev };
            const keys = name.split('.');
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
            
            console.log('Updated formData:', newData);
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.notifications.email.enabled && !formData.notifications.email.address) {
            toast.error("Email address is required when email notifications are enabled");
            return;
        }
        if (formData.notifications.email.address) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.notifications.email.address)) {
                toast.error("Invalid email address");
                return;
            }
        }
        try {
            console.log('Submitting formData:', formData);
            await updateSettingsMutation.mutateAsync(formData);
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error('Settings update error:', error);
            toast.error(error.response?.data?.message || "Failed to update settings");
        }
    };

    if (isLoading || isFetching || !formData) {
        return (
            <div className="p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <motion.h1
                className="text-2xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Settings
            </motion.h1>

            <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <PreferencesCard
                    formData={formData.preferences}
                    onChange={handleChange}
                />
                {/* <AlertsCard
                    formData={formData.alerts}
                    onChange={handleChange}
                /> */}
                <NotificationsCard
                    formData={formData.notifications}
                    onChange={handleChange}
                />
                <PasswordCard />

                <motion.button
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={updateSettingsMutation.isLoading}
                >
                    {updateSettingsMutation.isLoading ? "Saving..." : "Save Settings"}
                </motion.button>
            </motion.form>
        </div>
    );
}
