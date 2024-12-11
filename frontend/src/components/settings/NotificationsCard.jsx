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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-500" />
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
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="notifications.email.enabled"
                  checked={notifications.email.enabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-blue-500 rounded transition-all 
                  peer-checked:bg-blue-500 peer-checked:border-blue-500
                  dark:border-blue-400 dark:peer-checked:bg-blue-400 dark:peer-checked:border-blue-400"
                >
                  <Check 
                    className={`w-4 h-4 text-white absolute top-0.5 left-0.5 transition-opacity
                      ${notifications.email.enabled ? 'opacity-100' : 'opacity-0'}`}
                    strokeWidth={3}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                Email Notifications
              </span>
            </label>
            
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                    dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-400"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Push Notifications */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="notifications.push"
                  checked={notifications.push}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-blue-500 rounded transition-all 
                  peer-checked:bg-blue-500 peer-checked:border-blue-500
                  dark:border-blue-400 dark:peer-checked:bg-blue-400 dark:peer-checked:border-blue-400"
                >
                  <Check 
                    className={`w-4 h-4 text-white absolute top-0.5 left-0.5 transition-opacity
                      ${notifications.push ? 'opacity-100' : 'opacity-0'}`}
                    strokeWidth={3}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                Push Notifications
              </span>
            </label>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
} 