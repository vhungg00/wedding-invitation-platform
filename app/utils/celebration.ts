/**
 * Utility to trigger wedding fireworks and celebratory effects across the app
 */
import confetti from "canvas-confetti";

export const triggerCelebration = (options?: { x?: number; y?: number }) => {
  if (typeof window === "undefined") return;

  // 1. Dispatch custom event for FireworksCelebration listener
  window.dispatchEvent(
    new CustomEvent("wedding:celebrate", {
      detail: { x: options?.x, y: options?.y },
    })
  );

  // 2. Launch romantic golden & rose confetti burst with stars and hearts
  const x = options?.x ?? 0.5;
  const y = options?.y ?? 0.6;

  // Romantic wedding palette
  const colors = ["#ff4d6d", "#c9184a", "#ffb703", "#ffd166", "#fff0f3", "#e0aaff"];

  confetti({
    particleCount: 50,
    spread: 70,
    origin: { x, y },
    colors,
    startVelocity: 35,
    scalar: 1.1,
    zIndex: 99999,
  });

  // Secondary delayed sparkles
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors,
      zIndex: 99999,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors,
      zIndex: 99999,
    });
  }, 300);
};
