// 'use server';

export async function getSpinnerWinner(
  items: string[],
): Promise<string | null> {
  if (items.length < 2) {
    return null;
  }
  const winnerIndex = Math.floor(Math.random() * items.length);
  // const rotation = 360 / items.length * (items.length - winnerIndex - 1);
  // const spinCycles = 5 + Math.floor(Math.random() * 5);
  // const finalRotation = (360 * spinCycles) + rotation;

  // In a real server action, we'd just return the winner.
  // The rotation calculation is more for frontend, but we can send the winner.
  return items[winnerIndex];
}
