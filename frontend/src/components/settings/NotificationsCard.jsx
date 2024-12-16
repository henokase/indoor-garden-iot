import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Info } from "lucide-react";

export function NotificationsCard({ formData, onChange }) {
  // Ensure we have default values with proper nesting
  const notifications = {
    email: { enabled: false, address: '' },
    push: false,
    ...formData // This ensures we properly merge with incoming data
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? e.target.checked : value;
    
    // Call parent onChange with properly structured event
    onChange({
      target: {
        name,
        value: checked,
        type,
        checked: type === 'checkbox' ? checked : undefined
      }
    });
  };

  return (
    <motion.div 
      className="bg-green-50 dark:bg-gray-800 rounded-lg shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-medium">Notification Settings</h2>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-800 
              text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
              whitespace-nowrap pointer-events-none">
                Notifications are only sent for manual mode devices
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                name="notifications.email.enabled"
                checked={notifications.email.enabled}
                onChange={handleChange}
                className="checkbox checkbox-success border-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors">
                  Email Notifications
                </span>
            </div>
            <AnimatePresence>
              {notifications.email.enabled && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  type="email"
                  name="notifications.email.address"
                  value={notifications.email.address || ''}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="input input-lg input-success w-full text-black dark:text-white bg-transparent dark:bg-gray-800"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox"
              name="notifications.push"
              checked={notifications.push}
              onChange={handleChange}
              className="checkbox checkbox-success border-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors">
                Push Notifications
              </span>
          </div>

        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
} 