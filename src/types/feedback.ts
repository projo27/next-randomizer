// src/types/feedback.ts
import type { Timestamp } from "firebase/firestore";

/**
 * Represents the structure of an emoji reaction.
 */
export type FeedbackReaction = {
  [emoji: string]: {
    count: number;
    users: string[]; // Array of user IDs who reacted
  };
};

/**
 * Represents the data stored for a single feedback document.
 */
export interface FeedbackData {
  toolId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  comment: string;
  rating: "like" | "dislike" | null;
  reactions: FeedbackReaction;
  replyCount: number;
  createdAt: Timestamp;
}

/**
 * Represents a feedback item including its Firestore document ID.
 */
export interface Feedback extends FeedbackData {
  id: string;
  replies?: FeedbackReply[];
}

/**
 * Represents the data stored for a reply to a feedback.
 */
export interface FeedbackReplyData {
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  comment: string;
  createdAt: Timestamp;
}

/**
 * Represents a reply including its Firestore document ID.
 */
export interface FeedbackReply extends FeedbackReplyData {
  id: string;
}
