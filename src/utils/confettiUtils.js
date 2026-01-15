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

export const triggerConfetti = (options = {}) => {
  // Confetti is currently disabled and the external dependency has been
  // removed from the build to avoid bundling server‑only code (node-fetch).
  // If you want real confetti animations in the future, you can:
  // 1) Add a browser‑safe library such as "canvas-confetti"
  // 2) Wire it up here, making sure it only runs in the browser.
  if (!ENABLE_CONFETTI) {
    return; // Silently no-op while feature is disabled
  }
};

export const triggerBurstConfetti = () => {
  if (!ENABLE_CONFETTI) {
    return; // Feature currently disabled
  }
};

export const triggerSideConfetti = () => {
  if (!ENABLE_CONFETTI) {
    return; // Feature currently disabled
  }
};

export default triggerConfetti;
