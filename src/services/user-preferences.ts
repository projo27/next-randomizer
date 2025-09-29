'use server';

import { db } from '@/lib/firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Saves the user's theme preference to Firestore.
 * @param userId The ID of the user.
 * @param theme The theme to save ('light', 'dark', or 'system').
 */
export async function saveThemePreference(
  userId: string,
  theme: string,
): Promise<void> {
  if (!userId || !theme) return;
  try {
    const userPrefRef = doc(db, 'preferences', userId);
    await setDoc(userPrefRef, { theme }, { merge: true });
  } catch (error) {
    console.error('Error saving theme preference:', error);
    // Optionally re-throw or handle the error as needed
  }
}

/**
 * Retrieves the user's theme preference from Firestore.
 * @param userId The ID of the user.
 * @returns The saved theme preference or null if not found.
 */
export async function getThemePreference(
  userId: string,
): Promise<string | null> {
  if (!userId) return null;
  try {
    const userPrefRef = doc(db, 'preferences', userId);
    const docSnap = await getDoc(userPrefRef);

    if (docSnap.exists() && docSnap.data().theme) {
      return docSnap.data().theme;
    }
    return null;
  } catch (error) {
    console.error('Error getting theme preference:', error);
    return null;
  }
}