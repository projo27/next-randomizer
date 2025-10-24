'use server';

import * as cheerio from 'cheerio';

const MAX_QUOTE_ID = 1610132;
const BASE_URL = 'https://www.azquotes.com/quote/';

export type QuoteResult = {
  quote: string;
  author: string;
  authorLink: string;
};

export async function getRandomQuote(): Promise<QuoteResult> {
  const randomId = Math.floor(Math.random() * MAX_QUOTE_ID) + 1;
  const url = `${BASE_URL}${randomId}`;

  try {
    const response = await fetch(url, {
        headers: {
            // Mimic a browser user-agent to avoid being blocked
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quote. Status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const wrapBlock = $('.wrap-block').first();

    if (wrapBlock.length === 0) {
      // If the main container isn't found, try to get another quote
      console.warn(`Quote with ID ${randomId} might not exist. Retrying...`);
      return getRandomQuote();
    }

    const quote = wrapBlock.find('p.title').text().trim();
    const authorElement = wrapBlock.find('div.author a');
    const author = authorElement.text().trim();
    const authorLink = authorElement.attr('href') || '#';

    if (!quote || !author) {
      console.warn(`Could not parse quote or author for ID ${randomId}. Retrying...`);
      // Retry if parsing fails
      return getRandomQuote();
    }

    return {
      quote,
      author,
      authorLink: `https://www.azquotes.com${authorLink}`,
    };
  } catch (error) {
    console.error('Error fetching or parsing quote:', error);
    // In case of a network error, we can either throw or retry. Let's retry.
    // To prevent infinite loops, you might add a retry limit in a real app.
    return getRandomQuote();
  }
}
