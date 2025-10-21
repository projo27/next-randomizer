import { db } from "@/lib/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const USER_PREFERENCE_COLLECTION = "userPreferences";

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
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    await setDoc(userPrefRef, { theme }, { merge: true });
  } catch (error) {
    console.error("Error saving theme preference:", error);
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
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    const docSnap = await getDoc(userPrefRef);

    if (docSnap.exists() && docSnap.data().theme) {
      return docSnap.data().theme;
    }
    return null;
  } catch (error) {
    console.error("Error getting theme preference:", error);
    return null;
  }
}

/**
 * Saves the user's animation duration preference to Firestore.
 * @param userId The ID of the user.
 * @param duration The animation duration in seconds.
 */
export async function saveAnimationDuration(
  userId: string,
  duration: number,
): Promise<void> {
  if (!userId) return;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    await setDoc(userPrefRef, { animationDuration: duration }, { merge: true });
  } catch (error) {
    console.error("Error saving animation duration:", error);
  }
}

/**
 * Retrieves the user's animation duration preference from Firestore.
 * @param userId The ID of the user.
 * @returns The saved duration or null if not found.
 */
export async function getAnimationDuration(
  userId: string,
): Promise<number | null> {
  if (!userId) return null;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    const docSnap = await getDoc(userPrefRef);

    if (docSnap.exists() && docSnap.data().animationDuration !== undefined) {
      return docSnap.data().animationDuration;
    }
    return null;
  } catch (error) {
    console.error("Error getting animation duration:", error);
    return null;
  }
}

/**
 * Saves the user's sound preference to Firestore.
 * @param userId The ID of the user.
 * @param playSounds Boolean indicating if sounds should be played.
 */
export async function savePlaySounds(
  userId: string,
  playSounds: boolean,
): Promise<void> {
  if (!userId) return;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    await setDoc(userPrefRef, { playSounds }, { merge: true });
  } catch (error) {
    console.error("Error saving sound preference:", error);
  }
}

/**
 * Retrieves the user's sound preference from Firestore.
 * @param userId The ID of the user.
 * @returns The saved preference (boolean) or null if not set.
 */
export async function getPlaySounds(userId: string): Promise<boolean | null> {
  if (!userId) return null;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    const docSnap = await getDoc(userPrefRef);

    if (docSnap.exists() && docSnap.data().playSounds !== undefined) {
      return docSnap.data().playSounds;
    }
    return null; // Return null if not set, so we can use default
  } catch (error) {
    console.error("Error getting sound preference:", error);
    return null;
  }
}

/**
 * Saves the user's custom menu order to Firestore.
 * @param userId The ID of the user.
 * @param order An array of strings representing the ordered menu item keys.
 */
export async function saveMenuOrder(
  userId: string,
  order: string[],
): Promise<void> {
  if (!userId) return;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    await setDoc(userPrefRef, { menuOrder: order }, { merge: true });
  } catch (error) {
    console.error("Error saving menu order:", error);
  }
}

/**
 * Retrieves the user's custom menu order from Firestore.
 * @param userId The ID of the user.
 * @returns An array of strings representing the saved order, or null.
 */
export async function getMenuOrder(userId: string): Promise<string[] | null> {
  if (!userId) return null;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    const docSnap = await getDoc(userPrefRef);
    if (docSnap.exists() && docSnap.data().menuOrder) {
      return docSnap.data().menuOrder;
    }
    return null;
  } catch (error) {
    console.error("Error getting menu order:", error);
    return null;
  }
}
