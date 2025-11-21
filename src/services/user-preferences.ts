import { db } from "@/lib/firebase-config";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const USER_PREFERENCE_COLLECTION = "userPreferences";

export type MenuOrder = {
  visible: string[];
  hidden: string[];
};

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
    const data = docSnap.data();
    if (docSnap.exists() && data?.animationDuration !== undefined) {
      return data.animationDuration;
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
    const data = docSnap.data();
    if (docSnap.exists() && data?.playSounds !== undefined) {
      return data.playSounds;
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
 * @param order An object with 'visible' and 'hidden' arrays of strings.
 */
export async function saveMenuOrder(
  userId: string,
  order: MenuOrder,
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
 * @returns An object with 'visible' and 'hidden' arrays, or null.
 */
export async function getMenuOrder(userId: string): Promise<MenuOrder | null> {
  if (!userId) return null;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    const docSnap = await getDoc(userPrefRef);
    const data = docSnap.data();
    if (
      docSnap.exists() &&
      data?.menuOrder &&
      Array.isArray(data.menuOrder.visible) &&
      Array.isArray(data.menuOrder.hidden)
    ) {
      return data.menuOrder as MenuOrder;
    }
    return null;
  } catch (error) {
    console.error("Error getting menu order:", error);
    return null;
  }
}

/**
 * Saves the user's visible tool count preference to Firestore.
 * @param userId The ID of the user.
 * @param count The number of visible tools.
 */
export async function saveVisibleToolCount(
  userId: string,
  count: number,
): Promise<void> {
  if (!userId) return;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    await setDoc(userPrefRef, { visibleToolCount: count }, { merge: true });
  } catch (error) {
    console.error("Error saving visible tool count:", error);
  }
}

/**
 * Retrieves the user's visible tool count preference from Firestore.
 * @param userId The ID of the user.
 * @returns The saved count or null if not found.
 */
export async function getVisibleToolCount(
  userId: string,
): Promise<number | null> {
  if (!userId) return null;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    const docSnap = await getDoc(userPrefRef);
    const data = docSnap.data();
    if (docSnap.exists() && data?.visibleToolCount !== undefined) {
      return data.visibleToolCount;
    }
    return null;
  } catch (error) {
    console.error("Error getting visible tool count:", error);
    return null;
  }
}

/**
 * Retrieves the list of tools a user has already voted for.
 * @param userId The ID of the user.
 * @returns An array of tool names.
 */
export async function getVotedTools(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    const docSnap = await getDoc(userPrefRef);
    const data = docSnap.data();
    return (
      (docSnap.exists() &&
        Array.isArray(data?.votedTools) &&
        data.votedTools) ||
      []
    );
  } catch (error) {
    console.error("Error getting voted tools:", error);
    return [];
  }
}

/**
 * Records the tools a user has just voted for.
 * @param userId The ID of the user.
 * @param toolNames The array of tool names the user voted for.
 */
export async function recordUserVote(
  userId: string,
  toolNames: string[],
): Promise<void> {
  if (!userId || toolNames.length === 0) return;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    const docSnap = await getDoc(userPrefRef);

    const existingVotes =
      (docSnap.exists() &&
        Array.isArray(docSnap.data()?.votedTools) &&
        docSnap.data().votedTools) ||
      [];
    const newVotes = Array.from(new Set([...existingVotes, ...toolNames]));

    await setDoc(userPrefRef, { votedTools: newVotes }, { merge: true });
  } catch (error) {
    console.error("Error recording user vote:", error);
  }
}

/**
 * Saves the user's email to Firestore.
 * @param userId The ID of the user.
 * @param email The email of the user.
 */
export async function saveUserEmail(
  userId: string,
  email: string,
): Promise<void> {
  if (!userId || !email) return;
  try {
    const userPrefRef = doc(db, USER_PREFERENCE_COLLECTION, userId);
    await setDoc(userPrefRef, { email }, { merge: true });
  } catch (error) {
    console.error("Error saving user email:", error);
  }
}
