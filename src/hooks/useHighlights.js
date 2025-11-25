import { useCallback, useMemo } from 'react';
import { useHighlightContext } from '../context/HighlightContext';

/**
 * Hook for managing highlights with additional utilities
 */
export const useHighlights = (lessonId) => {
    const context = useHighlightContext();

    // Get highlights for specific page
    const getHighlightsForPage = useCallback((pageNumber) => {
        return context.highlights.filter(h => h.pageNumber === pageNumber);
    }, [context.highlights]);

    // Get highlights by color
    const getHighlightsByColor = useCallback((color) => {
        return context.highlights.filter(h => h.color === color);
    }, [context.highlights]);

    // Get highlights with specific action type
    const getHighlightsWithAction = useCallback((actionType) => {
        return context.highlights.filter(h =>
            h.actions.some(a => a.type === actionType)
        );
    }, [context.highlights]);

    // Check if text overlaps with existing highlight
    const hasOverlappingHighlight = useCallback((selection) => {
        return context.highlights.some(highlight => {
            if (highlight.pageNumber !== selection.pageNumber) return false;
            return highlight.text.includes(selection.text) ||
                selection.text.includes(highlight.text);
        });
    }, [context.highlights]);

    // Get all unique pages with highlights
    const pagesWithHighlights = useMemo(() => {
        return [...new Set(context.highlights.map(h => h.pageNumber))].sort((a, b) => a - b);
    }, [context.highlights]);

    // Get highlight statistics
    const stats = useMemo(() => ({
        total: context.highlights.length,
        byColor: {
            yellow: context.highlights.filter(h => h.color === 'yellow').length,
            green: context.highlights.filter(h => h.color === 'green').length,
            blue: context.highlights.filter(h => h.color === 'blue').length,
            pink: context.highlights.filter(h => h.color === 'pink').length,
            orange: context.highlights.filter(h => h.color === 'orange').length,
        },
        withActions: {
            chat: context.highlights.filter(h => h.actions.some(a => a.type === 'chat')).length,
            flashcard: context.highlights.filter(h => h.actions.some(a => a.type === 'flashcard')).length,
            video: context.highlights.filter(h => h.actions.some(a => a.type === 'video')).length,
            quiz: context.highlights.filter(h => h.actions.some(a => a.type === 'quiz')).length,
        },
    }), [context.highlights]);

    // Export highlights as JSON
    const exportHighlights = useCallback(() => {
        return JSON.stringify({
            lessonId,
            exportedAt: new Date().toISOString(),
            highlights: context.highlights,
        }, null, 2);
    }, [lessonId, context.highlights]);

    // Import highlights from JSON
    const importHighlights = useCallback((jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (data.highlights && Array.isArray(data.highlights)) {
                data.highlights.forEach(highlight => {
                    context.addHighlight(highlight, highlight.color);
                });
                return true;
            }
        } catch (e) {
            console.error('Failed to import highlights:', e);
        }
        return false;
    }, [context]);

    return {
        ...context,
        getHighlightsForPage,
        getHighlightsByColor,
        getHighlightsWithAction,
        hasOverlappingHighlight,
        pagesWithHighlights,
        stats,
        exportHighlights,
        importHighlights,
    };
};

export default useHighlights;
