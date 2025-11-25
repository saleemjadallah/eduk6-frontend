import React from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

const PDFControls = ({
    currentPage,
    numPages,
    scale,
    onPreviousPage,
    onNextPage,
    onZoomIn,
    onZoomOut,
    onPageChange,
}) => {
    const zoomPercentage = Math.round(scale * 100);

    return (
        <div className="flex items-center justify-between p-3 bg-white border-b-4 border-black">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onPreviousPage}
                    disabled={currentPage <= 1}
                    className="p-2 bg-gray-100 rounded-lg border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center gap-1 px-3 py-2 bg-nanobanana-yellow rounded-lg border-2 border-black font-bold">
                    <input
                        type="number"
                        value={currentPage}
                        onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= numPages) {
                                onPageChange(page);
                            }
                        }}
                        min={1}
                        max={numPages || 1}
                        className="w-8 text-center bg-transparent outline-none font-bold"
                    />
                    <span className="text-gray-600">/</span>
                    <span>{numPages || '?'}</span>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNextPage}
                    disabled={currentPage >= numPages}
                    className="p-2 bg-gray-100 rounded-lg border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onZoomOut}
                    disabled={scale <= 0.5}
                    className="p-2 bg-gray-100 rounded-lg border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
                    aria-label="Zoom out"
                >
                    <ZoomOut className="w-5 h-5" />
                </motion.button>

                <div className="px-3 py-2 bg-white rounded-lg border-2 border-black font-bold min-w-[60px] text-center">
                    {zoomPercentage}%
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onZoomIn}
                    disabled={scale >= 3}
                    className="p-2 bg-gray-100 rounded-lg border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
                    aria-label="Zoom in"
                >
                    <ZoomIn className="w-5 h-5" />
                </motion.button>
            </div>
        </div>
    );
};

export default PDFControls;
