import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../lib/axios";

import logo from "../assets/logo.png";

export default function Login() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await api.post("/auth/login", { password });
            localStorage.setItem("isAuthenticated", "true");
            navigate("/dashboard");
            toast.success("Welcome to GardenSense!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 dark:from-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-green-100 dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
                <div className="flex justify-center items-center mb-8">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-full">
                        <img src={logo} className="h-14" />
                    </div>
                    <h1 className="text-2xl ml-3 font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                        GardenSense
                    </h1>
                </div>

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
                bg-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 
              rounded-lg font-medium transition-colors disabled:opacity-50 
              disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Entering Garden..." : "Enter Garden"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
