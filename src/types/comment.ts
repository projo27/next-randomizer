
// src/types/comment.ts
import type { Timestamp } from "firebase/firestore";

/**
 * Represents the structure of an emoji reaction on a comment or tool.
 */
export type ReactionMap = {
  [emoji: string]: {
    count: number;
    users: string[]; // Array of user IDs who reacted
  };
};

/**
 * Represents the data stored for a single comment document.
 * The `createdAt` is a Timestamp on the server, but will be serialized
 * to a string when passed to a client component.
 */
export interface CommentData {
  toolId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  comment: string;
  reactions: ReactionMap;
  reactionCount: number;
  replyCount: number;
  createdAt: Timestamp | string;
}

/**
 * Represents a comment item including its Firestore document ID.
 */
export interface Comment extends CommentData {
  id: string;
  replies?: CommentReply[];
}

/**
 * Represents the data stored for a reply to a comment.
 */
export interface CommentReplyData {
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  comment: string;
  createdAt: Timestamp | string;
  reactions: ReactionMap;
}

/**
 * Represents a reply including its Firestore document ID.
 */
export interface CommentReply extends CommentReplyData {
  id: string;
}
