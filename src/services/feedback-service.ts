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
  const newFeedback: FeedbackData = {
    ...feedbackData,
    reactions: {},
    replyCount: 0,
    createdAt: serverTimestamp() as Timestamp,
  };
  const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), newFeedback);
  return docRef.id;
}

/**
 * Adds a reply to a specific feedback document.
 */
export async function addReply(
  feedbackId: string,
  replyData: Omit<FeedbackReplyData, "createdAt">
): Promise<string> {
  const feedbackDocRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
  const repliesColRef = collection(feedbackDocRef, "replies");

  const newReply: FeedbackReplyData = {
    ...replyData,
    createdAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(repliesColRef, newReply);

  // Increment reply count in a transaction
  await runTransaction(db, async (transaction) => {
    transaction.update(feedbackDocRef, { replyCount: (await transaction.get(feedbackDocRef)).data()?.replyCount + 1 || 1 });
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
    const emojiData = reactions[emoji] || { count: 0, users: [] };

    const userIndex = emojiData.users.indexOf(userId);
    if (userIndex > -1) {
      // User has already reacted with this emoji, so remove their reaction
      emojiData.count -= 1;
      emojiData.users.splice(userIndex, 1);
    } else {
      // User has not reacted, add their reaction
      emojiData.count += 1;
      emojiData.users.push(userId);
    }

    if (emojiData.count > 0) {
      reactions[emoji] = emojiData;
    } else {
      delete reactions[emoji]; // Clean up if no one has reacted with this emoji
    }

    transaction.update(feedbackDocRef, { reactions });
  });
}
