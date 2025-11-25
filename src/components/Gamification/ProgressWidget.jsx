import React from 'react';
import XPBar from './XPBar';
import StreakCounter from './StreakCounter';
import DailyChallenge from './DailyChallenge';

const ProgressWidget = ({ layout = 'horizontal' }) => {
    if (layout === 'compact') {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <XPBar compact />
                <StreakCounter compact />
                <DailyChallenge compact />
            </div>
        );
    }

    if (layout === 'vertical') {
        return (
            <div className="space-y-3">
                <XPBar />
                <StreakCounter />
                <DailyChallenge />
            </div>
        );
    }

    // Horizontal layout
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <XPBar />
            <StreakCounter />
            <DailyChallenge />
        </div>
    );
};

export default ProgressWidget;
