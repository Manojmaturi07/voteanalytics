/**
 * Confetti Animation Utility
 * Triggers celebratory confetti animation
 * 
 * IMPORTANT: Confetti is DISABLED by default.
 * Set ENABLE_CONFETTI = true to enable animations.
 * 
 * To enable: Change the flag below to true
 * To install: npm install confetti
 */
const ENABLE_CONFETTI = false; // Set to true to enable confetti animations

let confetti = null;

// Safely import confetti only if enabled
if (ENABLE_CONFETTI) {
  try {
    // Dynamic import to avoid breaking if package is not installed
    import('confetti').then((confettiModule) => {
      confetti = confettiModule.default || confettiModule;
    }).catch((err) => {
      console.warn('Confetti package not available. Install with: npm install confetti');
    });
  } catch (err) {
    console.warn('Confetti import failed:', err);
  }
}

export const triggerConfetti = (options = {}) => {
  if (!ENABLE_CONFETTI || !confetti) {
    return; // Silently fail if disabled or not available
  }
  
  try {
    const defaultOptions = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      ...options,
    };
    confetti(defaultOptions);
  } catch (err) {
    console.warn('Confetti animation failed:', err);
  }
};

export const triggerBurstConfetti = () => {
  if (!ENABLE_CONFETTI || !confetti) {
    return; // Silently fail if disabled or not available
  }
  
  try {
    triggerConfetti({
      particleCount: 150,
      spread: 100,
    });

    // Secondary burst after a short delay
    setTimeout(() => {
      triggerConfetti({
        particleCount: 80,
        spread: 80,
      });
    }, 250);
  } catch (err) {
    console.warn('Confetti burst failed:', err);
  }
};

export const triggerSideConfetti = () => {
  if (!ENABLE_CONFETTI || !confetti) {
    return; // Silently fail if disabled or not available
  }
  
  try {
    // Left side
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });

    // Right side
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
  } catch (err) {
    console.warn('Confetti side animation failed:', err);
  }
};

export default triggerConfetti;
