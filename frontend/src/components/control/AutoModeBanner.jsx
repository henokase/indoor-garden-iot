import { motion } from "framer-motion"

export function AutoModeBanner() {
    return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-green-700 dark:text-green-300"
            >
                <span className="font-semibold">Auto Mode is active:</span> The system will automatically control all devices based on sensor readings and optimal conditions.
            </motion.p>
        </div>
    );
}
