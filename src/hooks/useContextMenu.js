import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for managing context menu state and positioning
 */
export const useContextMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [targetData, setTargetData] = useState(null);
    const menuRef = useRef(null);

    // Open context menu at position
    const openMenu = useCallback((x, y, data = null) => {
        setPosition({ x, y });
        setTargetData(data);
        setIsOpen(true);
    }, []);

    // Close context menu
    const closeMenu = useCallback(() => {
        setIsOpen(false);
        setTargetData(null);
    }, []);

    // Handle right-click
    const handleContextMenu = useCallback((e, data = null) => {
        e.preventDefault();
        openMenu(e.clientX, e.clientY, data);
    }, [openMenu]);

    // Handle long press (for mobile)
    const useLongPress = useCallback((callback, ms = 500) => {
        const timeoutRef = useRef(null);

        const start = useCallback((e) => {
            timeoutRef.current = setTimeout(() => {
                const touch = e.touches?.[0] || e;
                callback(touch.clientX, touch.clientY);
            }, ms);
        }, [callback, ms]);

        const clear = useCallback(() => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }, []);

        return {
            onTouchStart: start,
            onTouchEnd: clear,
            onTouchMove: clear,
        };
    }, []);

    // Adjust position to stay within viewport
    const adjustPosition = useCallback(() => {
        if (!menuRef.current || !isOpen) return;

        const menu = menuRef.current;
        const rect = menu.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        let { x, y } = position;

        if (rect.right > viewport.width) {
            x = viewport.width - rect.width - 10;
        }
        if (x < 10) {
            x = 10;
        }

        if (rect.bottom > viewport.height) {
            y = viewport.height - rect.height - 10;
        }
        if (y < 10) {
            y = 10;
        }

        if (x !== position.x || y !== position.y) {
            setPosition({ x, y });
        }
    }, [isOpen, position]);

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                closeMenu();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, closeMenu]);

    // Adjust position after render
    useEffect(() => {
        if (isOpen) {
            adjustPosition();
        }
    }, [isOpen, adjustPosition]);

    return {
        isOpen,
        position,
        targetData,
        menuRef,
        openMenu,
        closeMenu,
        handleContextMenu,
        useLongPress,
    };
};

export default useContextMenu;
