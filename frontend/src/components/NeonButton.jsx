import React from 'react';

const NeonButton = ({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) => {
    const baseStyle = "px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-emerald-400 to-cyan-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.5)] hover:shadow-[0_0_30px_rgba(52,211,153,0.8)]",
        danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]",
        ghost: "bg-white/10 text-white hover:bg-white/20 border border-white/20"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default NeonButton;
