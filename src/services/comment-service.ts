// src/services/comment-service.ts
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
  Comment,
  CommentData,
  ReactionMap,
  CommentReply,
  CommentReplyData,
} from "@/types/comment";

const COMMENTS_COLLECTION = "comments";

/**
 * Adds a new comment document to Firestore.
 */
export async function addComment(
  commentData: Omit<CommentData, "createdAt" | "reactions" | "replyCount" | "reactionCount">
): Promise<string> {
  const newComment: Omit<CommentData, "createdAt"> = {
    ...commentData,
    ...commentData,
    reactions: {},
    reactionCount: 0,
    replyCount: 0,
  };
  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
    ...newComment,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Adds a reply to a specific comment document.
 */
export async function addReply(
  commentId: string,
  replyData: Omit<CommentReplyData, "createdAt" | "reactions">
): Promise<string> {
  const commentDocRef = doc(db, COMMENTS_COLLECTION, commentId);
  const repliesColRef = collection(commentDocRef, "replies");

  const newReply: Omit<CommentReplyData, "createdAt"> = {
    ...replyData,
    reactions: {},
  };

  const docRef = await addDoc(repliesColRef, {
    ...newReply,
    createdAt: serverTimestamp(),
  });

  // Increment reply count in a transaction
  await runTransaction(db, async (transaction) => {
    const commentDoc = await transaction.get(commentDocRef);
    if (!commentDoc.exists()) {
      throw "Document does not exist!";
    }
    const newReplyCount = (commentDoc.data().replyCount || 0) + 1;
    transaction.update(commentDocRef, { replyCount: newReplyCount });
  });

  return docRef.id;
}


/**
 * Fetches all comments and their replies for a specific tool.
 */
export async function getCommentsForTool(
  toolId: string,
  sortBy: "newest" | "best" = "newest"
): Promise<Comment[]> {
  const sortField = sortBy === "best" ? "reactionCount" : "createdAt";
  const commentsQuery = query(
    collection(db, COMMENTS_COLLECTION),
    where("toolId", "==", toolId),
    orderBy(sortField, "desc")
  );

  const commentsSnapshot = await getDocs(commentsQuery);
  const commentList: Comment[] = [];

  for (const doc of commentsSnapshot.docs) {
    const comment: Comment = { id: doc.id, ...doc.data() } as Comment;
    
    // Fetch replies for each comment
    const repliesQuery = query(collection(doc.ref, 'replies'), orderBy('createdAt', 'asc'));
    const repliesSnapshot = await getDocs(repliesQuery);
    comment.replies = repliesSnapshot.docs.map(replyDoc => ({ id: replyDoc.id, ...replyDoc.data() } as CommentReply));
    
    commentList.push(comment);
  }

  return commentList;
}

/**
 * Toggles an emoji reaction for a user on a specific comment document.
 * @param commentId The ID of the comment document.
 * @param userId The ID of the user reacting.
 * @param emoji The emoji string.
 */
export async function toggleCommentReaction(
  commentId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const commentDocRef = doc(db, COMMENTS_COLLECTION, commentId);

  await runTransaction(db, async (transaction) => {
    const commentDoc = await transaction.get(commentDocRef);
    if (!commentDoc.exists()) {
      throw new Error("Comment document does not exist!");
    }

    const data = commentDoc.data();
    const reactions: ReactionMap = data.reactions || {};
    
    if (!reactions[emoji]) {
      reactions[emoji] = { count: 0, users: [] };
    }
    
    const userIndex = reactions[emoji].users.indexOf(userId);

    if (userIndex > -1) {
      reactions[emoji].count -= 1;
      reactions[emoji].users.splice(userIndex, 1);
    } else {
      reactions[emoji].count += 1;
      reactions[emoji].users.push(userId);
    }

    if (reactions[emoji].count === 0) {
      delete reactions[emoji];
    }

    const totalReactions = Object.values(reactions).reduce(
      (sum, r) => sum + r.count,
      0
    );

    transaction.update(commentDocRef, { reactions, reactionCount: totalReactions });
  });
}
