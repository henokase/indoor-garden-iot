import { motion } from "framer-motion";
import { Kanban, Bot } from "lucide-react";
import { Switch } from "../ui/Switch";

export function AutoModeToggle({ isAutoMode, onToggle, isPending }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-gray-700 dark:text-gray-300"
                >
                    {isAutoMode ? (
                        <span className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            Auto Mode
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Kanban className="h-5 w-5" />
                            Manual Mode
                        </span>
                    )}
                </motion.span>
                {isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                ) : (
                    <Switch
                        checked={isAutoMode}
                        disabled={isPending}
                        onCheckedChange={onToggle}
                        size="md"
                    />
                )}
            </div>
        </div>
    );
}