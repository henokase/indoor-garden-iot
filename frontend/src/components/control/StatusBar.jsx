import { motion } from "framer-motion"

export function StatusBar({ status }) {
    return (
        <div className="relative w-full h-12 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <motion.div
                className={`absolute inset-0 rounded-lg flex items-center justify-center text-white font-medium
                    ${status ? 'bg-green-500 dark:bg-green-600' : ''}`}
                initial={false}
                animate={{
                    width: status ? '100%' : '0%'
                }}
                transition={{ duration: 0.3 }}
            >
                {status ? 'ON' : 'OFF'}
            </motion.div>
            {!status && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
                    OFF
                </div>
            )}
        </div>
    )
} 