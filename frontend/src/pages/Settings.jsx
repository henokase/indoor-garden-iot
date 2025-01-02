import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PreferencesCard } from "../components/settings/PreferencesCard";
import { NotificationsCard } from "../components/settings/NotificationsCard";
import { PasswordCard } from "../components/settings/PasswordCard";
import { useFetchSettings, useUpdateSettings } from "../hooks/useSettings";
import { toast } from "react-hot-toast";
import { Lock } from "lucide-react";

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
    const [showPasswordModal, setShowPasswordModal] = useState(false);

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

                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                        type="submit"
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 
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

                    <motion.button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center justify-center gap-2 bg-green-100 text-green-700 py-2 px-4 rounded-lg 
                            hover:bg-green-200 transition-colors dark:bg-gray-700 dark:text-green-400 dark:hover:bg-gray-600"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Lock className="w-4 h-4" />
                        Change Password
                    </motion.button>
                </div>
            </motion.form>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-md"
                    >
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                dark:hover:text-gray-200 z-10"
                        >
                            ×
                        </button>
                        <PasswordCard 
                            isLoading={isLoading || isFetching}
                            onClose={() => setShowPasswordModal(false)}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}
