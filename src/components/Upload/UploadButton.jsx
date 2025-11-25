import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';

const UploadButton = ({ onClick, variant = 'primary', size = 'medium' }) => {
    const sizeClasses = {
        small: 'px-3 py-2 text-sm',
        medium: 'px-5 py-3 text-base',
        large: 'px-6 py-4 text-lg',
    };

    const variantClasses = {
        primary: 'bg-nanobanana-yellow hover:bg-yellow-400',
        secondary: 'bg-white hover:bg-gray-100',
        floating: 'bg-nanobanana-green hover:bg-green-500 text-white rounded-full',
    };

    if (variant === 'floating') {
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className="fixed bottom-6 right-6 w-16 h-16 bg-nanobanana-green text-white rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center z-50 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            >
                <Plus className="w-8 h-8" />
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={onClick}
            className={`
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                font-bold font-comic
                border-4 border-black 
                rounded-xl 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                active:shadow-none active:translate-y-1
                transition-all
                flex items-center gap-2
            `}
        >
            <Upload className="w-5 h-5" />
            Upload Lesson
        </motion.button>
    );
};

export default UploadButton;