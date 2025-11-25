import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to detect and manage text selections within a container
 * @param {Object} options - Configuration options
 * @param {number} options.minLength - Minimum selection length to trigger
 * @param {Function} options.onSelect - Callback when text is selected
 * @param {Function} options.onDeselect - Callback when selection is cleared
 * @param {React.RefObject} options.containerRef - Container reference
 */
export const useTextSelection = ({
    minLength = 3,
    onSelect,
    onDeselect,
    containerRef,
} = {}) => {
    const [selection, setSelection] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const selectionTimeoutRef = useRef(null);

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

    // Handle selection change
    const handleSelectionChange = useCallback(() => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current);
        }

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
        }, 100);
    }, [getSelectionData, selection, onSelect, onDeselect]);

    // Track selection start
    const handleMouseDown = useCallback(() => {
        setIsSelecting(true);
    }, []);

    // Track selection end
    const handleMouseUp = useCallback(() => {
        setTimeout(handleSelectionChange, 10);
    }, [handleSelectionChange]);

    // Clear selection programmatically
    const clearSelection = useCallback(() => {
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
