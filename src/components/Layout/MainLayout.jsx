import React from 'react';
import { motion } from 'framer-motion';

const MainLayout = ({ children }) => {
    return (
        <div className="h-screen w-full bg-nanobanana-blue overflow-hidden flex p-4 gap-4 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-nanobanana-yellow rounded-full opacity-20 blur-xl"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-nanobanana-green rounded-full opacity-20 blur-xl"></div>
            </div>

            {children}
        </div>
    );
};

export default MainLayout;
