import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

const ConfettiEffect = ({ duration = 5000 }) => {
    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 800,
        height: typeof window !== 'undefined' ? window.innerHeight : 600,
    });
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        // Stop confetti after duration
        const timer = setTimeout(() => {
            setIsActive(false);
        }, duration);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [duration]);

    if (!isActive) return null;

    return (
        <ReactConfetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            numberOfPieces={200}
            recycle={false}
            gravity={0.3}
            colors={['#FFD700', '#4169E1', '#32CD32', '#FF6B9D', '#9B59B6']}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
        />
    );
};

export default ConfettiEffect;
