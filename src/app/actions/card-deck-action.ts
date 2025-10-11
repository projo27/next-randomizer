// 'use server';

type Suit = "S" | "C" | "H" | "D" | "Joker";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "Joker";
export type CardType = { suit: Suit; rank: Rank };

const SUITS: Exclude<Suit, "Joker">[] = ["S", "C", "H", "D"];
const RANKS: Exclude<Rank, "Joker">[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck(includeJokers: boolean): CardType[] {
  const deck: CardType[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  if (includeJokers) {
    deck.push({ suit: "Joker", rank: "Joker" });
    deck.push({ suit: "Joker", rank: "Joker" });
  }
  return deck;
}

function shuffleDeck(deck: CardType[]): CardType[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


export async function drawCards(includeJokers: boolean, count: number): Promise<CardType[]> {
    const deck = createDeck(includeJokers);

    if (count > deck.length) {
      throw new Error(`You can't draw more cards than are in the deck (${deck.length}).`);
    }

    const shuffledDeck = shuffleDeck(deck);
    return shuffledDeck.slice(0, count);
}
