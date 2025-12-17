// src/app/actions/chemical-element-randomizer-action.ts
'use server';

import {
  CHEMICAL_ELEMENTS,
  ChemicalElement,
} from '@/lib/chemical-elements-data';

/**
 * Gets a random chemical element from the dataset.
 * @returns A promise that resolves to a ChemicalElement object.
 */
export async function getRandomChemicalElement(): Promise<ChemicalElement> {
  const randomIndex = Math.floor(Math.random() * CHEMICAL_ELEMENTS.length);
  const element = CHEMICAL_ELEMENTS[randomIndex];
  
  if (!element) {
    throw new Error('Could not retrieve a random chemical element. Data might be missing.');
  }

  return element;
}
