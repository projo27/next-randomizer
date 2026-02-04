'use server';

import { USER_AGENT } from '@/lib/utils';
import * as cheerio from 'cheerio';

const MAX_QUOTE_ID = 1610132;
const BASE_URL = 'https://www.azquotes.com/quote/';

export type QuoteResult = {
  quote: string;
  author: string;
  authorLink: string;
  tags: string[];
};

export async function getRandomQuote(retryCount = 0): Promise<QuoteResult> {
  const MAX_RETRIES = 2;
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
      if (retryCount < MAX_RETRIES) {
        console.warn(`Failed to fetch quote ID ${randomId} (Status: ${response.status}). Retrying...`);
        return getRandomQuote(retryCount + 1);
      }
      throw new Error(`Failed to fetch quote after ${MAX_RETRIES} attempts. Status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const wrapBlock = $('.wrap-block').first();
    if (wrapBlock.length === 0) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Quote content missing for ID ${randomId}. Retrying...`);
        return getRandomQuote(retryCount + 1);
      }
      throw new Error(`Quote content missing for ID ${randomId}`);
    }

    const quote = wrapBlock.find('p.single-quote').text().trim();
    const authorElement = wrapBlock.find('div.author a');
    const author = authorElement.text().trim();
    const authorLink = authorElement.attr('href') || '#';

    const tags: string[] = [];
    const tagsElement = wrapBlock.find('.tags a');
    tagsElement.each((_, el) => {
      tags.push($(el).text().trim());
    });

    if (!quote || !author) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Incomplete data for ID ${randomId}. Retrying...`);
        return getRandomQuote(retryCount + 1);
      }
      throw new Error(`Incomplete data for ID ${randomId}`);
    }

    return {
      quote,
      author,
      authorLink: `https://www.azquotes.com${authorLink}`,
      tags
    };
  } catch (error) {
    console.error('Error fetching or parsing quote:', error);
    if (retryCount < MAX_RETRIES) {
      return getRandomQuote(retryCount + 1);
    }
    throw error;
  }
}

