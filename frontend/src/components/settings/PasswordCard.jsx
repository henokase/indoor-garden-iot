import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useUpdatePassword } from "../../hooks/useSettings";
import { toast } from "react-hot-toast";

export function PasswordCard() {
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const updatePasswordMutation = useUpdatePassword();

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            await updatePasswordMutation.mutateAsync({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        }
    };

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-green-500" />
                <h2 className="text-lg font-medium">Change Password</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Current Password
                    </label>
                    <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                            setPasswordData((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                            }))
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 dark:border-gray-600 
                            bg-transparent dark:bg-gray-800 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                        New Password
                    </label>
                    <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                            setPasswordData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                            }))
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 dark:border-gray-600 
                            bg-transparent dark:bg-gray-800 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                            setPasswordData((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                            }))
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 dark:border-gray-600 
                            bg-transparent dark:bg-gray-800 focus:ring-green-500"
                    />
                </div>
                <motion.button
                    onClick={handleSubmit}
                    type="button"
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={updatePasswordMutation.isLoading}
                >
                    {updatePasswordMutation.isLoading
                        ? "Updating..."
                        : "Update Password"}
                </motion.button>
            </div>
        </motion.div>
    );
}
