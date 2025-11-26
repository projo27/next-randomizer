// src/components/feedback/feedback-client-wrapper.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addFeedback } from "@/services/feedback-service";
import type { Feedback } from "@/types/feedback";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FeedbackItem } from "./feedback-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type FeedbackClientWrapperProps = {
  toolId: string;
  initialFeedback: Feedback[];
};

/**
 * Handles all client-side logic for the feedback section,
 * including form submission and state management.
 */
export function FeedbackClientWrapper({
  toolId,
  initialFeedback,
}: FeedbackClientWrapperProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(initialFeedback);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const feedbackData = {
        toolId,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || null,
        comment: newComment,
        rating: null, // Deprecated, but keep for structure
      };
      // This will add the doc to Firestore. We will then optimistically update the UI.
      const newFeedbackId = await addFeedback(feedbackData);
      
      // Optimistic UI update
      const optimisticNewFeedback: Feedback = {
        id: newFeedbackId, // temporary ID, will be replaced on refresh
        ...feedbackData,
        reactions: {},
        replyCount: 0,
        createdAt: {
          // Fake timestamp for optimistic update
          toDate: () => new Date(),
        } as any,
      };

      setFeedbackList([optimisticNewFeedback, ...feedbackList]);
      setNewComment("");
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your thoughts!",
      });

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReplyAdded = (feedbackId: string, newReply: any) => {
    setFeedbackList(prevList => prevList.map(fb => {
        if (fb.id === feedbackId) {
            return {
                ...fb,
                replies: [...(fb.replies || []), newReply],
                replyCount: (fb.replyCount || 0) + 1
            };
        }
        return fb;
    }));
  };
  
  if (authLoading) {
    return <Skeleton className="w-full h-48" />;
  }

  return (
    <div className="space-y-6">
      {user ? (
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
              {isSubmitting ? "Submitting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <Alert>
          <AlertTitle>Join the Conversation!</AlertTitle>
          <AlertDescription>
            <Button variant="link" onClick={signInWithGoogle} className="p-0 h-auto">
              Sign in
            </Button>{" "}
            to leave feedback, reply, and react to comments.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {feedbackList.map((feedback) => (
          <FeedbackItem key={feedback.id} feedback={feedback} onReplyAdded={onReplyAdded} />
        ))}
        {feedbackList.length === 0 && !authLoading && (
            <p className="text-center text-muted-foreground py-8">Be the first to leave a comment!</p>
        )}
      </div>
    </div>
  );
}
