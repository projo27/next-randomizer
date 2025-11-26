// src/services/tool-reaction-service.ts
import { db } from "@/lib/firebase-config";
import {
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import type { ReactionMap } from "@/types/comment";

const TOOL_REACTIONS_COLLECTION = "toolReactions";

/**
 * Retrieves the emoji reactions for a specific tool.
 * @param toolId The ID of the tool (e.g., 'list', 'number').
 * @returns A promise that resolves to a ReactionMap.
 */
export async function getReactionsForTool(toolId: string): Promise<ReactionMap> {
  try {
    const reactionDocRef = doc(db, TOOL_REACTIONS_COLLECTION, toolId);
    const docSnap = await getDoc(reactionDocRef);

    if (docSnap.exists()) {
      return (docSnap.data().reactions || {}) as ReactionMap;
    }
    return {};
  } catch (error) {
    console.error(`Error getting reactions for tool '${toolId}':`, error);
    return {};
  }
}

/**
 * Toggles an emoji reaction for a user on a specific tool.
 * @param toolId The ID of the tool.
 * @param userId The ID of the user reacting.
 * @param emoji The emoji string.
 */
export async function toggleToolReaction(
  toolId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const reactionDocRef = doc(db, TOOL_REACTIONS_COLLECTION, toolId);

  await runTransaction(db, async (transaction) => {
    const reactionDoc = await transaction.get(reactionDocRef);
    
    let reactions: ReactionMap = {};
    if (reactionDoc.exists()) {
        reactions = reactionDoc.data().reactions || {};
    }

    if (!reactions[emoji]) {
      reactions[emoji] = { count: 0, users: [] };
    }

    const userIndex = reactions[emoji].users.indexOf(userId);

    if (userIndex > -1) {
      // User has already reacted, remove their reaction
      reactions[emoji].count = Math.max(0, reactions[emoji].count - 1);
      reactions[emoji].users.splice(userIndex, 1);
    } else {
      // User has not reacted, add their reaction
      reactions[emoji].count += 1;
      reactions[emoji].users.push(userId);
    }

    if (reactions[emoji].count === 0) {
      delete reactions[emoji];
    }
    
    if (!reactionDoc.exists()) {
        transaction.set(reactionDocRef, { reactions });
    } else {
        transaction.update(reactionDocRef, { reactions });
    }
  });
}
