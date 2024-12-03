import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import MenuButton from "../common/MenuButton";

function Sidebar({ navItems, isOpen, setIsOpen }) {
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsOpen]);

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.nav
                ref={sidebarRef}
                className={`
                    fixed md:sticky top-0 left-0 h-screen w-64
                    bg-white dark:bg-gray-800 shadow-lg z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
                initial={false}
            >
                <MenuButton 
                    isOpen={isOpen} 
                    setIsOpen={setIsOpen} 
                    icon={<X />}
                />
                
                <div className="flex flex-col h-full p-4 md:pt-4">
                    <div className="space-y-4">
                        {navItems.map(({ path, icon: Icon, label }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className={({ isActive }) => `
                                    flex items-center space-x-3 px-4 py-3 rounded-lg
                                    transition-colors duration-200
                                    ${isActive
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                `}
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </motion.nav>
        </>
    );
}

export default Sidebar;
