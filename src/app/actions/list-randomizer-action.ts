// 'use server';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function randomizeList(items: string[], count: number): Promise<string[]> {
    if (items.length === 0) {
        throw new Error("Please enter at least one item in the list.");
    }
    if (count > items.length) {
        throw new Error(`Cannot pick ${count} items. There are only ${items.length} unique items in the list.`);
    }

    if (count === 1) {
        const randomIndex = Math.floor(Math.random() * items.length);
        return [items[randomIndex]];
    }
    
    const shuffled = shuffleArray(items);
    return shuffled.slice(0, count);
}
