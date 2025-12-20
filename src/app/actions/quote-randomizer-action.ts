'use server';

import { USER_AGENT } from '@/lib/utils';
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
            'User-Agent': USER_AGENT
        }
    });

    if (!response.ok) {
      throw new Error(`We have a problem to connect with Server, try again later`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const wrapBlock = $('.wrap-block').first();
    if (wrapBlock.length === 0) {
      // If the main container isn't found, try to get another quote
      console.warn(`Quote with ID ${randomId} might not exist. Retrying...`);
    }

    const quote = wrapBlock.find('p.single-quote').text().trim();
    const authorElement = wrapBlock.find('div.author a');
    const author = authorElement.text().trim();
    const authorLink = authorElement.attr('href') || '#';

    if (!quote || !author) {
      console.warn(`Could not parse quote or author for ID ${randomId}. Retrying...`);
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
    // return getRandomQuote();
    throw error;
  }
}
