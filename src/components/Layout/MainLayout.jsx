import React from 'react';
import { motion } from 'framer-motion';

const MainLayout = ({ children, className = "bg-nanobanana-blue", showClouds = false }) => {
    return (
        <div className={`h-screen w-full overflow-hidden flex p-4 gap-4 relative ${className}`}>
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {!showClouds && (
                    <>
                        <div className="absolute top-10 left-10 w-20 h-20 bg-nanobanana-yellow rounded-full opacity-20 blur-xl"></div>
                        <div className="absolute bottom-20 right-20 w-32 h-32 bg-nanobanana-green rounded-full opacity-20 blur-xl"></div>
                    </>
                )}

                {showClouds && (
                    <>
                        <motion.img
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            src="/assets/images/cloud_backdrop_top.png"
                            alt=""
                            className="absolute top-0 left-0 w-full object-contain opacity-60"
                        />
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            src="/assets/images/cloud_backdrop_bottom.png"
                            alt=""
                            className="absolute bottom-0 left-0 w-full object-contain opacity-80"
                        />
                    </>
                )}
            </div>

            <div className="relative z-10 w-full h-full flex gap-4">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
