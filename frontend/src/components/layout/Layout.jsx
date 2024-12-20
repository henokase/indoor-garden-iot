import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Sliders,
  BarChart2,
  Settings as SettingsIcon,
  Menu,
  X,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { DarkModeToggle } from "../ui/DarkModeToggle";
import { useDeviceAlerts } from '../../hooks/useDeviceAlerts';
import { useNotifications } from '../../contexts/NotificationContext';
import { toast } from 'react-hot-toast';

import logo from "../../assets/logo.png";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoactionLogin = location.pathname === "/login";
  const [scrolled, setScrolled] = useState(false);

  const { notifications } = useNotifications();

  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      toast(notifications[0].message, {
        icon: '🔔',
        duration: 4000,
        position: 'top-right',
      });
    }
  }, [notifications]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useDeviceAlerts();

  const navigation = [
    { name: "Overview", href: "/", icon: LayoutGrid },
    { name: "Control Panel", href: "/control", icon: Sliders },
    { name: "Reports", href: "/reports", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  const handleLock = () => {
    localStorage.removeItem("isAuthenticated");
    setShowLockConfirm(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar for larger screens */}
      {!isLoactionLogin && (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow bg-green-200 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-full">
                  <img src={logo} className="h-12" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                  GardenSense
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-between h-full">
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
              <div className="p-4">
                <button
                  onClick={() => setShowLockConfirm(true)}
                  className="w-full flex items-center px-4 py-2 text-red-500 dark:text-red-400 transition-colors"
                >
                  <Lock className="w-5 h-5 mr-3" />
                  <span>Lock</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile header and sidebar */}
      {!isLoactionLogin && (
        <div className="md:hidden">
          {/* Mobile Header */}
          <div className={`fixed top-0 left-0 right-0 transition-all duration-150 h-16 px-4 flex items-center justify-between z-50
            ${scrolled ? "shadow-xl inset-0 bg-black/20 backdrop-blur-md" : "dark:bg-gray-800 bg-white border-b border-gray-200 dark:border-gray-700"}`}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700/50"
              >
                <Menu className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                GardenSense
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <DarkModeToggle />
              </div>
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
                      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-full">
                        <img
                          src={logo}
                          className="h-10"
                        />
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
                    <div className="flex flex-col justify-between h-full">
                      <div className="flex-1 flex flex-col p-4 space-y-3">
                        {navigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsSidebarOpen(false)}
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
                      <div className="pl-4 pb-24">
                        <button
                          onClick={() => setShowLockConfirm(true)}
                          className="w-full flex items-center px-4 py-2 text-red-500 dark:text-red-400 transition-colors"
                        >
                          <Lock className="w-5 h-5 mr-3" />
                          <span>Lock</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {showLockConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Lock
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to Lock?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLockConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 
                  dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLock}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                  transition-colors"
              >
                Lock
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main content */}
      <div
        className={
          isLoactionLogin ? "w-full" : "flex-1 md:pl-64 max-md:pt-16"
        }
      >
        <main className="min-h-[calc(100dvh-64px)] bg-green-100 dark:bg-gray-900 dark:text-gray-100 relative">
          {!isLoactionLogin && (
            <div className="absolute top-4 right-4 max-md:hidden">
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <DarkModeToggle />
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
