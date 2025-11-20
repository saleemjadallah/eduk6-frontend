import { useState, useEffect } from 'react';

interface JeffreyAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'happy' | 'thinking' | 'excited' | 'waving' | 'neutral';
  animate?: boolean;
  showPulse?: boolean;
}

export default function JeffreyAvatar({
  size = 'lg',
  mood = 'neutral',
  animate = true,
  showPulse = true,
}: JeffreyAvatarProps) {
  const [currentMood, setCurrentMood] = useState(mood);

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
    xl: 'w-32 h-32 text-5xl',
  };


  const moodAnimations = {
    happy: 'animate-bounce',
    thinking: 'animate-pulse',
    excited: 'animate-ping',
    waving: 'animate-wave',
    neutral: '',
  };

  return (
    <div className="relative inline-block">
      {/* Pulse ring */}
      {showPulse && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 animate-ping" />
      )}

      {/* Main avatar */}
      <div
        className={`
          ${sizeClasses[size]}
          relative
          rounded-full
          ${currentMood !== 'neutral' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : ''}
          flex items-center justify-center
          text-white font-bold
          shadow-xl
          ${animate ? moodAnimations[currentMood] : ''}
          transition-all duration-300
          transform hover:scale-105
          overflow-hidden
        `}
      >
        <img
          src="/assets/new-jeffrey-removebg-preview.png"
          alt="Jeffrey AI Assistant"
          className="w-full h-full object-cover"
        />

        {/* Sparkle effects for excited mood */}
        {currentMood === 'excited' && (
          <>
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-spin-slow">✨</div>
            <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-spin-slow delay-300">✨</div>
          </>
        )}
      </div>

      {/* Online indicator */}
      <div className="absolute bottom-0 right-0 w-4 h-4">
        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
        <div className="relative w-full h-full bg-green-500 rounded-full border-2 border-white" />
      </div>
    </div>
  );
}
