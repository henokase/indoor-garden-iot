import { motion } from "framer-motion";
import { Bot } from "lucide-react";

function AutoModeToggle({ isEnabled, isLoading, onToggle }) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
                <Bot className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                        Auto Mode
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Let the system automatically control the environment
                    </p>
                </div>
            </div>

            <motion.button
                className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          ${isEnabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
                onClick={onToggle}
                disabled={isLoading}
                whileTap={{ scale: 0.95 }}
            >
                <motion.span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
                    initial={false}
                    animate={{
                        x: isEnabled ? "24px" : "2px",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </motion.button>
        </div>
    );
}

export default AutoModeToggle;
