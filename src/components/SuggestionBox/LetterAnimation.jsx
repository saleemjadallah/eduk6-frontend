import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createLetterFlyAnimation } from './animations';

/**
 * Flying letter animation component
 * Shows a letter flying from the modal to the mailbox on submit
 */
const LetterAnimation = ({
  isAnimating,
  startPosition, // { x, y } - where the letter starts (usually modal center)
  endPosition,   // { x, y } - where the letter ends (mailbox position)
  onComplete,
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      setShouldRender(true);
    }
  }, [isAnimating]);

  if (!shouldRender || !startPosition || !endPosition) {
    return null;
  }

  // Calculate the relative movement from start to end
  const deltaX = endPosition.x - startPosition.x;
  const deltaY = endPosition.y - startPosition.y;

  const letterAnimation = createLetterFlyAnimation(deltaX, deltaY);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="flying-letter"
          style={{
            left: startPosition.x,
            top: startPosition.y,
          }}
          variants={letterAnimation}
          initial="initial"
          animate="animate"
          onAnimationComplete={() => {
            setShouldRender(false);
            onComplete?.();
          }}
        >
          <img
            src="/assets/suggestions/letter.png"
            alt=""
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LetterAnimation;
