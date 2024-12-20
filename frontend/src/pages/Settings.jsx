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

    const { data: settings, isLoading, isFetching, error: fetchingError } = useFetchSettings();
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

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
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

        const toastId = toast.loading("Saving settings...");
        try {
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

    if (fetchingError) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load. Please try again later.
            </div>
        )
    }

    // if (isLoading || isFetching) {
    //     return (
    //         <div className="p-6 flex flex-col items-center justify-center gap-4">
    //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    //         </div>
    //     );
    // }

    return (
        <div className="p-1 sm:p-6 max-w-3xl sm:mx-auto">
            <motion.h1
                className="text-2xl p-3 pb-0 sm:p-0 font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text"
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
                <PreferencesCard
                    formData={formData.preferences}
                    onChange={handleChange}
                    isLoading={isLoading || isFetching}
                />
                <NotificationsCard
                    formData={formData.notifications}
                    onChange={handleChange}
                    isLoading={isLoading || isFetching}
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
            <PasswordCard 
                isLoading={isLoading || isFetching}
            />
        </div>
    );
}
