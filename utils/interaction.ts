/**
 * Triggers a short vibration on supported devices.
 * Provides tactile feedback for user interactions.
 */
export const hapticFeedback = () => {
  if (navigator.vibrate) {
    // A short, 10ms vibration is a common pattern for light feedback.
    navigator.vibrate(10);
  }
};