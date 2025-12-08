'use server';

type DataObject = Record<string, any>;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function randomizeObjects(
  objects: DataObject[],
  count: number,
): Promise<DataObject[]> {
  if (!Array.isArray(objects) || objects.length === 0) {
    throw new Error('Please provide at least one data object.');
  }
  if (count <= 0) {
    throw new Error('Number of results must be at least 1.');
  }
  if (count > objects.length) {
    throw new Error(
      `Cannot pick ${count} items. There are only ${objects.length} unique items in the list.`,
    );
  }

  const shuffled = shuffleArray(objects);
  return shuffled.slice(0, count);
}
