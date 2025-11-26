// src/services/feedback-service.ts
import { db } from "@/lib/firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
  collectionGroup,
  updateDoc,
} from "firebase/firestore";
import type {
  Feedback,
  FeedbackData,
  FeedbackReaction,
  FeedbackReply,
  FeedbackReplyData,
} from "@/types/feedback";

const FEEDBACK_COLLECTION = "feedback";

/**
 * Adds a new feedback document to Firestore.
 */
export async function addFeedback(
  feedbackData: Omit<FeedbackData, "createdAt" | "reactions" | "replyCount">
): Promise<string> {
  const newFeedback: Omit<FeedbackData, "createdAt"> = {
    ...feedbackData,
    reactions: {},
    replyCount: 0,
  };
  const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), {
    ...newFeedback,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Adds a reply to a specific feedback document.
 */
export async function addReply(
  feedbackId: string,
  replyData: Omit<FeedbackReplyData, "createdAt" | "reactions">
): Promise<string> {
  const feedbackDocRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
  const repliesColRef = collection(feedbackDocRef, "replies");

  const newReply: Omit<FeedbackReplyData, "createdAt"> = {
    ...replyData,
    reactions: {},
  };

  const docRef = await addDoc(repliesColRef, {
    ...newReply,
    createdAt: serverTimestamp(),
  });

  // Increment reply count in a transaction
  await runTransaction(db, async (transaction) => {
    const feedbackDoc = await transaction.get(feedbackDocRef);
    if (!feedbackDoc.exists()) {
      throw "Document does not exist!";
    }
    const newReplyCount = (feedbackDoc.data().replyCount || 0) + 1;
    transaction.update(feedbackDocRef, { replyCount: newReplyCount });
  });

  return docRef.id;
}


/**
 * Fetches all feedback and their replies for a specific tool.
 */
export async function getFeedbackForTool(toolId: string): Promise<Feedback[]> {
  const feedbackQuery = query(
    collection(db, FEEDBACK_COLLECTION),
    where("toolId", "==", toolId),
    orderBy("createdAt", "desc")
  );

  const feedbackSnapshot = await getDocs(feedbackQuery);
  const feedbackList: Feedback[] = [];

  for (const doc of feedbackSnapshot.docs) {
    const feedback: Feedback = { id: doc.id, ...doc.data() } as Feedback;
    
    // Fetch replies for each feedback
    const repliesQuery = query(collection(doc.ref, 'replies'), orderBy('createdAt', 'asc'));
    const repliesSnapshot = await getDocs(repliesQuery);
    feedback.replies = repliesSnapshot.docs.map(replyDoc => ({ id: replyDoc.id, ...replyDoc.data() } as FeedbackReply));
    
    feedbackList.push(feedback);
  }

  return feedbackList;
}

/**
 * Toggles an emoji reaction for a user on a specific feedback document.
 * @param feedbackId The ID of the feedback document.
 * @param userId The ID of the user reacting.
 * @param emoji The emoji string.
 */
export async function toggleEmojiReaction(
  feedbackId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const feedbackDocRef = doc(db, FEEDBACK_COLLECTION, feedbackId);

  await runTransaction(db, async (transaction) => {
    const feedbackDoc = await transaction.get(feedbackDocRef);
    if (!feedbackDoc.exists()) {
      throw new Error("Feedback document does not exist!");
    }

    const data = feedbackDoc.data();
    const reactions: FeedbackReaction = data.reactions || {};
    
    // Initialize emoji data if it doesn't exist
    if (!reactions[emoji]) {
      reactions[emoji] = { count: 0, users: [] };
    }
    
    const userIndex = reactions[emoji].users.indexOf(userId);

    if (userIndex > -1) {
      // User has already reacted with this emoji, so remove their reaction
      reactions[emoji].count -= 1;
      reactions[emoji].users.splice(userIndex, 1);
    } else {
      // User has not reacted, add their reaction
      reactions[emoji].count += 1;
      reactions[emoji].users.push(userId);
    }

    // Clean up if no one has reacted with this emoji
    if (reactions[emoji].count === 0) {
      delete reactions[emoji];
    }

    transaction.update(feedbackDocRef, { reactions });
  });
}
