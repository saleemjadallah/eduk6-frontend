import React, { useCallback, useRef } from 'react';
import { Page } from 'react-pdf';
import { motion } from 'framer-motion';
import HighlightLayer from './HighlightLayer';
import SelectionPopup from './SelectionPopup';
import { useHighlightContext } from '../../context/HighlightContext';

const PDFPage = ({ pageNumber, scale, lessonId, onTextSelected }) => {
    const pageRef = useRef(null);
    const {
        setSelection,
        currentSelection,
        highlights,
        openContextMenu,
    } = useHighlightContext();

    // Custom text selection handling
    const handleTextSelection = useCallback(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            const rects = range.getClientRects();
            const pageRect = pageRef.current?.getBoundingClientRect();

            if (pageRect && rects.length > 0) {
                const boundingRects = Array.from(rects).map(rect => ({
                    top: (rect.top - pageRect.top) / scale,
                    left: (rect.left - pageRect.left) / scale,
                    width: rect.width / scale,
                    height: rect.height / scale,
                    pageIndex: pageNumber - 1,
                }));

                const selectionData = {
                    text: selectedText,
                    pageNumber,
                    boundingRects,
                };

                setSelection(selectionData);
                onTextSelected?.(selectionData);
            }
        }
    }, [pageNumber, scale, setSelection, onTextSelected]);

    // Handle mouse up for selection
    const handleMouseUp = useCallback(() => {
        setTimeout(() => {
            handleTextSelection();
        }, 10);
    }, [handleTextSelection]);

    // Handle long press for mobile (context menu trigger)
    const handleTouchEnd = useCallback((e) => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText) {
            handleTextSelection();
            const touch = e.changedTouches[0];
            if (touch) {
                openContextMenu({ x: touch.clientX, y: touch.clientY });
            }
        }
    }, [handleTextSelection, openContextMenu]);

    // Filter highlights for current page
    const pageHighlights = highlights.filter(h => h.pageNumber === pageNumber);

    return (
        <motion.div
            ref={pageRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white shadow-lg rounded-lg overflow-hidden pdf-page"
            onMouseUp={handleMouseUp}
            onTouchEnd={handleTouchEnd}
        >
            {/* PDF Page Render */}
            <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className="pdf-page"
                loading={
                    <div className="w-full h-96 flex items-center justify-center">
                        <span className="text-2xl animate-bounce">📄</span>
                    </div>
                }
            />

            {/* Highlight Overlay Layer */}
            <HighlightLayer
                highlights={pageHighlights}
                scale={scale}
            />

            {/* Selection Popup (shows after selection) */}
            {currentSelection && currentSelection.pageNumber === pageNumber && (
                <SelectionPopup
                    selection={currentSelection}
                    scale={scale}
                />
            )}
        </motion.div>
    );
};

export default PDFPage;
