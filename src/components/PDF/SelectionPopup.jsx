import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { useHighlightContext } from '../../context/HighlightContext';

const SelectionPopup = ({ selection, scale }) => {
    const { openContextMenu, addHighlight } = useHighlightContext();

    // Calculate popup position (above the selection)
    const popupPosition = useMemo(() => {
        if (!selection?.boundingRects?.length) return null;

        const firstRect = selection.boundingRects[0];
        return {
            top: firstRect.top * scale - 50,
            left: (firstRect.left + firstRect.width / 2) * scale,
        };
    }, [selection, scale]);

    if (!popupPosition) return null;

    const handleQuickChat = () => {
        addHighlight(selection, 'blue');
    };

    const handleMoreOptions = (e) => {
        e.stopPropagation();
        openContextMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
                position: 'absolute',
                top: popupPosition.top,
                left: popupPosition.left,
                transform: 'translateX(-50%)',
            }}
            className="flex items-center gap-2 bg-white rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-2 py-1 z-40"
        >
            {/* Quick Chat Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleQuickChat}
                className="flex items-center gap-2 px-3 py-2 bg-nanobanana-blue text-white rounded-full font-bold text-sm"
            >
                <MessageCircle className="w-4 h-4" />
                Ask Jeffrey
            </motion.button>

            {/* More Options Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMoreOptions}
                className="p-2 bg-gray-100 rounded-full border-2 border-black"
                title="More options"
            >
                <MoreHorizontal className="w-4 h-4" />
            </motion.button>

            {/* Arrow pointing to selection */}
            <div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r-4 border-b-4 border-black rotate-45"
                style={{ marginBottom: '-8px' }}
            />
        </motion.div>
    );
};

export default SelectionPopup;
