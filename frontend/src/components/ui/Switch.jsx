import { motion } from "framer-motion";

export function Switch({ checked, onCheckedChange, disabled = false, size = "md" }) {
    const sizes = {
        sm: {
          switch: 'w-8 h-4',
          thumb: 'w-3 h-3',
          translate: 'translate-x-4'
        },
        md: {
          switch: 'w-11 h-6',
          thumb: 'w-5 h-5',
          translate: 'translate-x-5'
        },
        lg: {
          switch: 'w-14 h-7',
          thumb: 'w-6 h-6',
          translate: 'translate-x-7'
        }
    }

    const currentSize = sizes[size] || sizes.md

    return (
        <motion.button
            className={`
                ${currentSize.switch}
                ${checked ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                relative inline-flex shrink-0 cursor-pointer rounded-full 
                border-2 border-transparent transition-colors duration-200 
                ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 
            `}
            onClick={() => onCheckedChange(!checked)}
            disabled={disabled}
        >
            <motion.div
                className={`${currentSize.thumb} bg-white rounded-full shadow-md`}
                animate={{
                    x: checked ? "90%" : "0%",
                    // scale: checked ? 1.1 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30,
                }}
            />
        </motion.button>
    );
}
