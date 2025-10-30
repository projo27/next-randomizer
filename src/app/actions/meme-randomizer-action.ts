'use server';

export type MemeResult = {
  title: string;
  imageUrl: string;
  sourceUrl: string;
};

export async function getRandomMeme(): Promise<MemeResult> {
  const apiKey = process.env.GIPHY_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Giphy API Key is not configured. Please set GIPHY_API_KEY in your environment variables.',
    );
  }

  // We use the random endpoint with a specific tag to get memes
  const url = `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=meme&rating=pg-13`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Giphy API error: ${errorData.meta?.msg || response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.data || !data.data.images?.original?.url) {
      throw new Error('No meme found in Giphy response. Try again!');
    }

    return {
      title: data.data.title || 'Untitled Meme',
      imageUrl: data.data.images.original.url.replace(/^http:/, 'https:'),
      sourceUrl: data.data.url,
    };
  } catch (error) {
    console.error('Error fetching from Giphy:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred while fetching a meme.');
  }
}
