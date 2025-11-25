import React from 'react';
import { motion } from 'framer-motion';
import { useHighlightContext } from '../../context/HighlightContext';
import { HIGHLIGHT_COLORS } from '../../constants/contextMenuConfig';

const HighlightLayer = ({ highlights, scale }) => {
    const { activeHighlightId, setActiveHighlight } = useHighlightContext();

    return (
        <div className="absolute inset-0 pointer-events-none">
            {highlights.map((highlight) => (
                <div key={highlight.id}>
                    {highlight.boundingRects.map((rect, index) => (
                        <motion.div
                            key={`${highlight.id}-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                scale: activeHighlightId === highlight.id ? 1.02 : 1,
                            }}
                            whileHover={{ scale: 1.02 }}
                            style={{
                                position: 'absolute',
                                top: rect.top * scale,
                                left: rect.left * scale,
                                width: rect.width * scale,
                                height: rect.height * scale,
                                backgroundColor: HIGHLIGHT_COLORS[highlight.color]?.bg || HIGHLIGHT_COLORS.yellow.bg,
                                borderRadius: '2px',
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={() => setActiveHighlight(highlight.id)}
                            onMouseLeave={() => setActiveHighlight(null)}
                            className="transition-all duration-200 highlight-overlay"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default HighlightLayer;
