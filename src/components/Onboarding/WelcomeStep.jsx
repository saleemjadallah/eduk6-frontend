import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const WelcomeStep = ({ onComplete }) => {
  const { currentProfile, children } = useAuth();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const profile = currentProfile || children[0];

  return (
    <div className="welcome-step">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#ffc107', '#ff9800', '#4caf50', '#2196f3', '#e91e63'][
                  Math.floor(Math.random() * 5)
                ],
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="welcome-content"
      >
        <div className="welcome-icon">
          <span className="party-emoji">🎉</span>
        </div>

        <h2>Welcome to NanoBanana!</h2>

        <p className="welcome-text">
          You're all set! {profile?.displayName || 'Your child'} is ready to start
          an amazing learning adventure with Jeffrey, our friendly AI tutor.
        </p>

        <div className="profile-card">
          <div className="profile-avatar-large">
            {profile?.avatarId?.includes('avatar_1') && '🐱'}
            {profile?.avatarId?.includes('avatar_2') && '🐶'}
            {profile?.avatarId?.includes('avatar_3') && '🦉'}
            {profile?.avatarId?.includes('avatar_4') && '🦁'}
            {profile?.avatarId?.includes('avatar_5') && '🐼'}
            {profile?.avatarId?.includes('avatar_6') && '🐰'}
            {profile?.avatarId?.includes('avatar_7') && '🐧'}
            {profile?.avatarId?.includes('avatar_8') && '🐘'}
            {!profile?.avatarId && '🐱'}
          </div>
          <div className="profile-details">
            <span className="profile-name">{profile?.displayName || 'Young Learner'}</span>
            <span className="profile-info">
              Age {profile?.age || '?'} • Grade {profile?.grade || '?'}
            </span>
          </div>
        </div>

        <div className="features-preview">
          <div className="feature">
            <span className="feature-icon">📚</span>
            <span className="feature-text">Upload lessons</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💬</span>
            <span className="feature-text">Chat with Jeffrey</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎮</span>
            <span className="feature-text">Earn XP & badges</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📝</span>
            <span className="feature-text">Create flashcards</span>
          </div>
        </div>

        <button type="button" className="btn btn-primary start-btn" onClick={onComplete}>
          <span>Start Learning!</span>
          <span className="btn-arrow">→</span>
        </button>

        <p className="safety-note">
          <span className="shield-icon">🛡️</span>
          All conversations are monitored for safety. Parents can view activity anytime.
        </p>
      </motion.div>

      <style>{`
        .welcome-step {
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: fall linear forwards;
          border-radius: 2px;
        }

        @keyframes fall {
          to {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }

        .welcome-content {
          position: relative;
          z-index: 1;
        }

        .welcome-icon {
          margin-bottom: 16px;
        }

        .party-emoji {
          font-size: 4rem;
          display: inline-block;
          animation: bounce 1s ease infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .welcome-step h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 12px;
        }

        .welcome-text {
          font-size: 1rem;
          color: #666;
          margin: 0 0 24px;
          line-height: 1.6;
        }

        .profile-card {
          background: linear-gradient(135deg, #fff8e1, #e3f2fd);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .profile-avatar-large {
          width: 64px;
          height: 64px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .profile-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
        }

        .profile-info {
          font-size: 0.875rem;
          color: #666;
        }

        .features-preview {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .feature {
          background: #f9f9f9;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .feature-icon {
          font-size: 1.25rem;
        }

        .feature-text {
          font-size: 0.875rem;
          color: #333;
        }

        .start-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1.125rem;
          padding: 16px 32px;
        }

        .btn-arrow {
          font-size: 1.25rem;
          transition: transform 0.2s ease;
        }

        .start-btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        .safety-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          font-size: 0.8125rem;
          color: #4caf50;
        }

        .shield-icon {
          font-size: 1rem;
        }

        @media (max-width: 480px) {
          .features-preview {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeStep;
