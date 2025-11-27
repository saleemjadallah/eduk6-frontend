import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to detect and manage text selections within a container
 * @param {Object} options - Configuration options
 * @param {number} options.minLength - Minimum selection length to trigger
 * @param {Function} options.onSelect - Callback when text is selected
 * @param {Function} options.onDeselect - Callback when selection is cleared
 * @param {React.RefObject} options.containerRef - Container reference
 * @param {number} options.delay - Delay before triggering selection (default 300ms)
 */
export const useTextSelection = ({
    minLength = 3,
    onSelect,
    onDeselect,
    containerRef,
    delay = 300,
} = {}) => {
    const [selection, setSelection] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const selectionTimeoutRef = useRef(null);
    const mouseUpTimeRef = useRef(null);

    // Get current selection with position data
    const getSelectionData = useCallback(() => {
        const windowSelection = window.getSelection();
        const selectedText = windowSelection?.toString().trim();

        if (!selectedText || selectedText.length < minLength) {
            return null;
        }

        // Check if selection is within container
        if (containerRef?.current) {
            const anchorNode = windowSelection.anchorNode;
            if (!containerRef.current.contains(anchorNode)) {
                return null;
            }
        }

        try {
            const range = windowSelection.getRangeAt(0);
            const rects = Array.from(range.getClientRects());

            return {
                text: selectedText,
                rects: rects.map(rect => ({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    bottom: rect.bottom,
                    right: rect.right,
                })),
                range: {
                    startOffset: range.startOffset,
                    endOffset: range.endOffset,
                },
            };
        } catch (e) {
            console.error('Error getting selection data:', e);
            return null;
        }
    }, [minLength, containerRef]);

    // Process selection after delay (only called on mouseup)
    const processSelection = useCallback(() => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }

        // Wait for the configured delay before showing popup
        selectionTimeoutRef.current = setTimeout(() => {
            const selectionData = getSelectionData();

            if (selectionData) {
                setSelection(selectionData);
                setIsSelecting(false);
                onSelect?.(selectionData);
            } else if (selection) {
                setSelection(null);
                onDeselect?.();
            }
        }, delay);
    }, [getSelectionData, selection, onSelect, onDeselect, delay]);

    // Handle deselection (when clicking elsewhere)
    const handleSelectionChange = useCallback(() => {
        const windowSelection = window.getSelection();
        const selectedText = windowSelection?.toString().trim();

        // Only handle deselection, not new selections (mouseup handles those)
        if (!selectedText && selection) {
            if (selectionTimeoutRef.current) {
                clearTimeout(selectionTimeoutRef.current);
            }
            setSelection(null);
            onDeselect?.();
        }
    }, [selection, onDeselect]);

    // Track selection start
    const handleMouseDown = useCallback(() => {
        // Cancel any pending selection popup
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }
        setIsSelecting(true);
    }, []);

    // Track selection end - this is the main trigger for showing popup
    const handleMouseUp = useCallback(() => {
        setIsSelecting(false);
        mouseUpTimeRef.current = Date.now();
        // Small delay to let the browser finalize the selection
        setTimeout(processSelection, 10);
    }, [processSelection]);

    // Clear selection programmatically
    const clearSelection = useCallback(() => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }
        window.getSelection()?.removeAllRanges();
        setSelection(null);
        onDeselect?.();
    }, [onDeselect]);

    // Set up event listeners
    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);

            if (selectionTimeoutRef.current) {
                clearTimeout(selectionTimeoutRef.current);
            }
        };
    }, [handleSelectionChange, handleMouseDown, handleMouseUp]);

    return {
        selection,
        isSelecting,
        clearSelection,
        getSelectionData,
    };
};

export default useTextSelection;
