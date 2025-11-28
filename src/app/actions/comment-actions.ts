'use server';

import { getCommentsForTool } from "@/services/comment-service";
import type { Comment } from "@/types/comment";

export async function fetchComments(toolId: string, sortBy: 'newest' | 'best'): Promise<Comment[]> {
  const comments = await getCommentsForTool(toolId, sortBy);
  
  // Serialize timestamps
  return comments.map(comment => ({
    ...comment,
    createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : comment.createdAt.toDate().toISOString(),
    replies: (comment.replies || []).map(reply => ({
      ...reply,
      createdAt: typeof reply.createdAt === 'string' ? reply.createdAt : reply.createdAt.toDate().toISOString(),
    })),
  }));
}
