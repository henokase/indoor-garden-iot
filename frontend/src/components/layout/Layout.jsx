import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Home, Sliders, BarChart2, Settings, Menu } from "lucide-react";
import MenuButton from "../common/MenuButton";
import ToggleDarkMode from "../common/ToggleDarkMode";

function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navItems = [
        { path: "/", icon: Home, label: "Overview" },
        { path: "/control", icon: Sliders, label: "Control Panel" },
        { path: "/analytics", icon: BarChart2, label: "Analytics" },
        { path: "/settings", icon: Settings, label: "Settings" },
    ];
    const headerTitles = {
        "/": "System Overview",
        "/control": "Control Panel",
        "/analytics": "Analytics & Reports",
        "/settings": "Settings",
    };
    const location = useLocation();
    const [activePath, setActivePath] = useState(location.pathname);

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar
                navItems={navItems}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="flex-1">
                <nav className="bg-white dark:bg-gray-800 sticky top-0 shadow-lg z-30 flex gap-4 py-4 items-center px-4">
                    <MenuButton 
                        isOpen={isSidebarOpen} 
                        setIsOpen={setIsSidebarOpen} 
                        icon={<Menu />}
                        className="md:hidden"
                    />
                    <motion.h1
                        className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white md:hidden"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {headerTitles[activePath]}
                    </motion.h1>
                    <div className="ml-auto md:px-2"><ToggleDarkMode /></div>
                </nav>
                <motion.main
                    className="p-4 md:p-6 lg:p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}

export default Layout;
