import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import PDFPage from './PDFPage';
import PDFControls from './PDFControls';
import ContextMenu from './ContextMenu';
import { useHighlightContext } from '../../context/HighlightContext';
import { ZOOM_LEVELS } from '../../utils/pdfConfig';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import '../../styles/pdf-text-layer.css';

// Import pdfjs and configure worker
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({
    pdfUrl,
    lessonId,
    onTextSelected,
    onSendToChat,
    onCreateFlashcards,
    initialPage = 1
}) => {
    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [scale, setScale] = useState(ZOOM_LEVELS.DEFAULT);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const containerRef = useRef(null);
    const {
        currentSelection,
        isContextMenuOpen,
        contextMenuPosition,
        openContextMenu,
        closeContextMenu,
    } = useHighlightContext();

    // Handle document load
    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);
    }, []);

    const onDocumentLoadError = useCallback((error) => {
        setLoadError(error);
        setIsLoading(false);
        console.error('PDF load error:', error);
    }, []);

    // Page navigation
    const goToPreviousPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(prev + 1, numPages || prev));
    }, [numPages]);

    // Zoom controls
    const zoomIn = useCallback(() => {
        setScale(prev => Math.min(prev + ZOOM_LEVELS.STEP, ZOOM_LEVELS.MAX));
    }, []);

    const zoomOut = useCallback(() => {
        setScale(prev => Math.max(prev - ZOOM_LEVELS.STEP, ZOOM_LEVELS.MIN));
    }, []);

    // Handle right-click for context menu
    const handleContextMenu = useCallback((e) => {
        if (currentSelection) {
            e.preventDefault();
            openContextMenu({ x: e.clientX, y: e.clientY });
        }
    }, [currentSelection, openContextMenu]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (isContextMenuOpen) {
                closeContextMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isContextMenuOpen, closeContextMenu]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPreviousPage();
            if (e.key === 'ArrowRight') goToNextPage();
            if (e.key === 'Escape') closeContextMenu();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPreviousPage, goToNextPage, closeContextMenu]);

    return (
        <div
            ref={containerRef}
            className="relative flex flex-col h-full bg-gray-100 rounded-2xl border-4 border-black overflow-hidden"
            onContextMenu={handleContextMenu}
        >
            {/* Loading State */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <Loader2 className="w-12 h-12 text-nanobanana-blue" />
                        </motion.div>
                        <p className="mt-4 font-comic text-lg text-gray-600">
                            Loading your lesson...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error State */}
            {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                    <span className="text-6xl mb-4">😕</span>
                    <p className="font-comic text-lg text-gray-600">
                        Oops! We couldn't load this document.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Try uploading it again!
                    </p>
                </div>
            )}

            {/* PDF Controls - Top Bar */}
            <PDFControls
                currentPage={currentPage}
                numPages={numPages}
                scale={scale}
                onPreviousPage={goToPreviousPage}
                onNextPage={goToNextPage}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onPageChange={setCurrentPage}
            />

            {/* PDF Document Container */}
            <div className="flex-1 overflow-auto p-4">
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                    className="flex flex-col items-center"
                >
                    <PDFPage
                        pageNumber={currentPage}
                        scale={scale}
                        lessonId={lessonId}
                        onTextSelected={onTextSelected}
                    />
                </Document>
            </div>

            {/* Page Navigation Buttons - Large Touch Targets for Kids */}
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPreviousPage}
                    disabled={currentPage <= 1}
                    className="ml-2 p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-6 h-6" />
                </motion.button>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNextPage}
                    disabled={currentPage >= numPages}
                    className="mr-2 p-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-6 h-6" />
                </motion.button>
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {isContextMenuOpen && currentSelection && (
                    <ContextMenu
                        position={contextMenuPosition}
                        selection={currentSelection}
                        onClose={closeContextMenu}
                        onSendToChat={onSendToChat}
                        onCreateFlashcards={onCreateFlashcards}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PDFViewer;
