
// src/components/comments/comment-client-wrapper.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addComment } from "@/services/comment-service";
import type { Comment } from "@/types/comment";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CommentItem } from "./comment-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type CommentClientWrapperProps = {
  toolId: string;
  initialComments: Comment[];
};

/**
 * Handles all client-side logic for the comment section,
 * including form submission and state management.
 */
export function CommentClientWrapper({
  toolId,
  initialComments,
}: CommentClientWrapperProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [commentList, setCommentList] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        toolId,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || null,
        comment: newComment,
      };

      const newCommentId = await addComment(commentData);

      const optimisticNewComment: Comment = {
        id: newCommentId,
        ...commentData,
        reactions: {},
        replyCount: 0,
        createdAt: new Date().toISOString() as any, // Use ISO string for client-side optimistic update
      };

      setCommentList([optimisticNewComment, ...commentList]);
      setNewComment("");

      toast({
        title: "Comment Posted",
        description: "Thank you for your thoughts!",
      });

    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReplyAdded = (commentId: string, newReply: any) => {
    setCommentList(prevList => prevList.map(fb => {
      if (fb.id === commentId) {
        return {
          ...fb,
          replies: [...(fb.replies || []), newReply],
          replyCount: (fb.replyCount || 0) + 1
        };
      }
      return fb;
    }));
  };

  return (
    <div className="space-y-6">
      {authLoading ? (
        <Skeleton className="w-full h-32" />
      ) : user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts, suggestions, or issues..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            disabled={isSubmitting}
          />
          <div className="flex justify-end items-center">
            <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <Alert>
          <AlertTitle>Join the Conversation!</AlertTitle>
          <AlertDescription>
            <Button variant="link" onClick={signInWithGoogle} className="p-0 h-auto">
              Sign in
            </Button>
            to leave comments, reply, and react.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {commentList.map((comment) => (
          <CommentItem key={comment.id} comment={comment} onReplyAdded={onReplyAdded} />
        ))}
        {commentList.length === 0 && !authLoading && (
          <p className="text-center text-muted-foreground py-8">Be the first to leave a comment!</p>
        )}
      </div>
    </div>
  );
}
