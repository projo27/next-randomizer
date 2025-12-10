import confetti from "canvas-confetti";

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
}

export const threwConfetti = (options: ConfettiOptions = {}) => {
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
