import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PreferencesCard } from "../components/settings/PreferencesCard";
import { NotificationsCard } from "../components/settings/NotificationsCard";
import { PasswordCard } from "../components/settings/PasswordCard";
import { useFetchSettings, useUpdateSettings } from "../hooks/useSettings";
import { toast } from "react-hot-toast";

export default function Settings() {
    const [formData, setFormData] = useState({
        preferences: {},
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
                preferences: settings.preferences || {},
                notifications: {
                    email: {
                        enabled: settings.notifications?.email?.enabled ?? false,
                        address: settings.notifications?.email?.address ?? ''
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

            // Navigate to the correct nested object
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            // Set the value
            current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email if enabled
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

        const toastId = toast.loading("Saving settings...");
        try {
            // Ensure we're sending the complete data structure
            const dataToUpdate = {
                preferences: formData.preferences,
                notifications: formData.notifications
            };
            await updateSettingsMutation.mutateAsync(dataToUpdate);
            toast.success("Settings updated successfully", { id: toastId });
        } catch (error) {
            console.error('Settings update error:', error);
            toast.error(error.response?.data?.message || "Failed to update settings", { id: toastId });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="text-gray-500">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <motion.h1
                className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Settings
            </motion.h1>

            <motion.form
                onSubmit={handleSubmit}
                className="space-y-6 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {isFetching && (
                    <div className="fixed top-4 right-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                    </div>
                )}
                
                <PreferencesCard
                    formData={formData.preferences}
                    onChange={handleChange}
                />
                <NotificationsCard
                    formData={formData.notifications}
                    onChange={handleChange}
                />

                <motion.button
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={updateSettingsMutation.isPending || isFetching}
                >
                    {updateSettingsMutation.isPending ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                        </div>
                    ) : (
                        "Save Settings"
                    )}
                </motion.button>
            </motion.form>
            <PasswordCard />
        </div>
    );
}
