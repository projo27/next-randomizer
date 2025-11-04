import { db } from "@/lib/firebase-config";
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  collection,
  increment,
  getDocs,
} from "firebase/firestore";

const USER_PREFERENCE_COLLECTION = "userPreferences";
const SURVEY_COLLECTION = "surveys";
const SURVEY_LIST_COLLECTION = "surveyList";

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

// --- Survey Functions ---

/**
 * Retrieves the list of available survey options from Firestore.
 * @returns An array of tool names.
 */
export async function getSurveyList(): Promise<string[]> {
  try {
    const surveyListCol = collection(db, SURVEY_LIST_COLLECTION);
    const snapshot = await getDocs(surveyListCol);
    const toolList = snapshot.docs.map(doc => doc.id);
    return toolList.sort();
  } catch (error) {
    console.error("Error getting survey list:", error);
    return [];
  }
}

/**
 * Increments the vote count for given tools in a Firestore transaction.
 * Also adds new tools to the surveyList collection.
 * @param toolNames An array of tool names to vote for.
 * @param allSurveyOptions The current list of all survey options.
 */
export async function incrementSurveyVotes(toolNames: string[], allSurveyOptions: string[]): Promise<void> {
  const surveyDocRef = doc(db, SURVEY_COLLECTION, "newToolRequests");

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Update vote counts
      const surveyDoc = await transaction.get(surveyDocRef);
      const updates: { [key: string]: any } = {};

      toolNames.forEach((toolName) => {
        updates[toolName] = increment(1);
      });

      if (!surveyDoc.exists()) {
        transaction.set(surveyDocRef, updates);
      } else {
        transaction.update(surveyDocRef, updates);
      }

      // 2. Add any new "other" tools to the surveyList collection
      const newTools = toolNames.filter(
        (tool) => !allSurveyOptions.some(opt => opt.toLowerCase() === tool.toLowerCase())
      );
      
      for (const newTool of newTools) {
        // Use the tool name as the document ID. Add a placeholder field.
        const newToolRef = doc(db, SURVEY_LIST_COLLECTION, newTool);
        transaction.set(newToolRef, { addedByUser: true });
      }
    });
  } catch (error) {
    console.error("Error incrementing survey votes:", error);
    throw error;
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
 * Retrieves the current results of the new tool survey.
 * @returns A promise that resolves to an object mapping tool names to vote counts.
 */
export async function getSurveyResults(): Promise<{ [key: string]: number }> {
  try {
    const surveyDocRef = doc(db, SURVEY_COLLECTION, "newToolRequests");
    const docSnap = await getDoc(surveyDocRef);
    return (docSnap.exists() ? docSnap.data() : {}) as {
      [key: string]: number;
    };
  } catch (error) {
    console.error("Error getting survey results:", error);
    return {};
  }
}