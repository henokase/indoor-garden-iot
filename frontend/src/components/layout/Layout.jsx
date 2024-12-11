import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Leaf,
    LayoutGrid,
    Sliders,
    BarChart2,
    Settings as SettingsIcon,
    Menu,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: "Overview", href: "/", icon: LayoutGrid },
        { name: "Control Panel", href: "/control", icon: Sliders },
        { name: "Reports", href: "/reports", icon: BarChart2 },
        { name: "Settings", href: "/settings", icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar for larger screens */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between h-16 px-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                                GardenSense
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col p-4 space-y-3">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors
                    ${
                        location.pathname === item.href
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile header and sidebar */}
            <div className="md:hidden">
                {/* Mobile Header */}
                <div className="fixed top-0 left-0 right-0 h-16 dark:bg-gray-800 bg-white border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between z-50">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700/50"
                        >
                            <Menu className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </button>
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                            <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                            GardenSense
                        </span>
                    </div>
                </div>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                                onClick={() => setIsSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: isSidebarOpen ? 0 : "-100%" }}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                }}
                                className="fixed inset-y-0 left-0 w-64 z-50"
                            >
                                <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                            <Leaf className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                                            GardenSense
                                        </span>
                                        <button
                                            className="ml-auto"
                                            onClick={() =>
                                                setIsSidebarOpen(false)
                                            }
                                        >
                                            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col flex-grow p-4 space-y-3">
                                        {navigation.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.href}
                                                    onClick={() =>
                                                        setIsSidebarOpen(false)
                                                    }
                                                    className={`flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors
                          ${
                              location.pathname === item.href
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Main content */}
            <div className="flex-1 md:pl-64 max-md:pt-16">
                <main className="min-h-screen dark:bg-gray-900 dark:text-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
