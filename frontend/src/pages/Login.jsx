import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";

import logo from "../assets/logo.png";

export default function Login() {
    const [password, setPassword] = useState("");
    const { loginMutation, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!password) {
            toast.error("Please enter a password");
            return;
        }

        const toastId = toast.loading("Logging in...");
        try {
            const { data } = await loginMutation(password);
            localStorage.setItem("isAuthenticated", "true");
            toast.success("Welcome to GardenSense!", { id: toastId });
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid password", { id: toastId });
            setPassword("");
        }
    };

    return (
        <div className="min-h-[100dvh] flex max-sm:pt-40 sm:items-center justify-center bg-gradient-to-br from-green-100 to-green-200 dark:from-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-green-100 dark:bg-gray-800 max-sm:bg-transparent max-sm:dark:bg-transparent rounded-2xl sm:shadow-xl p-2 sm:p-8"
            >
                <motion.div 
                    className="flex justify-center items-center mb-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-full">
                        <img src={logo} className="h-14" alt="GardenSense Logo" />
                    </div>
                    <h1 className="text-2xl ml-3 font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                        GardenSense
                    </h1>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 
                                focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
                                bg-transparent dark:bg-gray-700 dark:text-white
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Enter your password"
                            required
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 
                            rounded-lg font-medium transition-colors disabled:opacity-50 
                            disabled:cursor-not-allowed disabled:hover:bg-green-500"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Entering Garden...</span>
                            </div>
                        ) : (
                            "Enter Garden"
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
