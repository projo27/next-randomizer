'use server';

import { COUNTRY_CODES } from '@/lib/country-codes';

export type CountryResult = {
  name: string;
  code: string;
  flagUrl: string;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getRandomCountries(count: number): Promise<CountryResult[]> {
  if (count <= 0) {
    throw new Error('Please enter a number greater than 0.');
  }
  if (count > COUNTRY_CODES.length) {
    throw new Error(
      `Cannot generate more than ${COUNTRY_CODES.length} countries.`,
    );
  }

  const shuffledCountries = shuffleArray(COUNTRY_CODES);
  const selectedCountries = shuffledCountries.slice(0, count);

  return selectedCountries.map((country) => ({
    name: country.name,
    code: country.code,
    flagUrl: `https://flagcdn.com/w320/${country.code.toLowerCase()}.png`,
  }));
}
