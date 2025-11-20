'use server';

export type Pair = {
  itemA: string;
  itemB: string;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates random pairs from two lists. If lists have unequal length,
 * items from the shorter list are reused.
 * @param listA The first list of items.
 * @param listB The second list of items.
 * @returns A promise that resolves to an array of pairs.
 */
export async function randomizePairs(
  listA: string[],
  listB: string[],
): Promise<Pair[]> {
  if (listA.length === 0 || listB.length === 0) {
    throw new Error('Both lists must contain at least one item.');
  }

  const shuffledA = shuffleArray(listA);
  const shuffledB = shuffleArray(listB);

  const pairs: Pair[] = [];
  const longerList = shuffledA.length > shuffledB.length ? shuffledA : shuffledB;
  const shorterList = shuffledA.length > shuffledB.length ? shuffledB : shuffledA;
  const isALonger = shuffledA.length > shuffledB.length;

  for (let i = 0; i < longerList.length; i++) {
    const itemFromLonger = longerList[i];
    const itemFromShorter = shorterList[i % shorterList.length];

    if (isALonger) {
      pairs.push({ itemA: itemFromLonger, itemB: itemFromShorter });
    } else {
      // To keep the pairing consistent with list order if B is longer
      // We find the corresponding item from A for the item from B
      const itemFromA = shuffledA[i % shuffledA.length];
       pairs.push({ itemA: itemFromA, itemB: itemFromLonger });
    }
  }
  
  // If list B was longer, the pairings might be out of order relative to list A's original shuffled state.
  // This final shuffle ensures the final pairing order is random.
  return shuffleArray(pairs);
}
