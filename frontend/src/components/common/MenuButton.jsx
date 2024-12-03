import React from "react";

const MenuButton = ({ isOpen, setIsOpen, icon }) => {
    return (
        <button
            className={
                `p-4 rounded-lg 
                hover:bg-gray-100 
                dark:hover:bg-gray-700 
                dark:text-gray-300 
                md:hidden `
            }
            onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
            }}
        >
            {icon}
        </button>
    );
};

export default MenuButton;
