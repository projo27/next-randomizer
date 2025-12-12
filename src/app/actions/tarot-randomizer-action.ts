'use server';

import { TAROT_CARDS } from '@/lib/tarot-data';

export type TarotCard = (typeof TAROT_CARDS)[0];
export type DrawnCard = TarotCard & {
  orientation: 'upright' | 'reversed';
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function drawTarotCards(count: number): Promise<DrawnCard[]> {
  if (count <= 0) {
    throw new Error('Please enter a number greater than 0.');
  }
  if (count > TAROT_CARDS.length) {
    throw new Error(
      `Cannot draw more than ${TAROT_CARDS.length} cards.`,
    );
  }

  const shuffledDeck = shuffleArray(TAROT_CARDS);
  const selectedCards = shuffledDeck.slice(0, count);

  return selectedCards.map((card) => ({
    ...card,
    orientation: Math.random() < 0.5 ? 'upright' : 'reversed',
  }));
}
