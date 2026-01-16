/**
 * Confetti Animation Utility
 * Uses canvas-confetti for browser-safe celebratory animations
 * 
 * Available effects:
 * - triggerConfetti: Standard confetti burst
 * - triggerBurstConfetti: Intense celebration burst
 * - triggerSideConfetti: Confetti from sides
 */
import confetti from 'canvas-confetti';

// Only run confetti in browser environment
const ENABLE_CONFETTI = typeof window !== 'undefined';

/**
 * Trigger a standard confetti animation
 * @param {Object} options - Configuration options
 */
export const triggerConfetti = (options = {}) => {
  if (!ENABLE_CONFETTI) return;
  
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  };

  confetti({
    ...defaults,
    ...options,
  });
};

/**
 * Trigger an intense burst confetti animation for celebrations
 * Perfect for successful vote submissions
 */
export const triggerBurstConfetti = () => {
  if (!ENABLE_CONFETTI) return;

  // Create multiple bursts for more dramatic effect
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    // Main burst from center
    confetti({
      particleCount: 50,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    });
  }, 250);
};

/**
 * Trigger confetti from the sides of the screen
 */
export const triggerSideConfetti = () => {
  if (!ENABLE_CONFETTI) return;

  // Left side
  confetti({
    particleCount: 80,
    angle: 45,
    spread: 55,
    origin: { x: 0, y: 0.5 },
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  });

  // Right side
  confetti({
    particleCount: 80,
    angle: 135,
    spread: 55,
    origin: { x: 1, y: 0.5 },
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  });
};

export default triggerConfetti;
