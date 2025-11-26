// src/components/feedback/feedback-item.tsx
"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import type { Feedback, FeedbackReply } from "@/types/feedback";
import { addReply, toggleEmojiReaction } from "@/services/feedback-service";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Smile, MessageSquare, CornerDownRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

type FeedbackItemProps = {
  feedback: Feedback;
  isReply?: boolean;
  onReplyAdded?: (feedbackId: string, newReply: FeedbackReply) => void;
};

export function FeedbackItem({ feedback, isReply = false, onReplyAdded }: FeedbackItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyComment, setReplyComment] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { toast } = useToast();

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyComment.trim() || isReply) return; // Can't reply to a reply

    setIsSubmittingReply(true);
    try {
      const replyData = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || null,
        comment: replyComment,
      };
      
      const newReplyId = await addReply(feedback.id, replyData);

       // Optimistic UI update
      if (onReplyAdded) {
         onReplyAdded(feedback.id, {
            id: newReplyId, // temp id
            ...replyData,
            createdAt: { toDate: () => new Date() } as any,
         });
      }
      
      setReplyComment("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
       toast({ variant: "destructive", title: "Error", description: "Failed to post reply." });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEmojiClick = async (emoji: string) => {
    if (!user || isReply) return;
    try {
        // This action should trigger a re-fetch or an optimistic update in the parent.
        // For simplicity here, we'll just call the server action. A full implementation
        // would require more complex state management (e.g., Zustand or Redux).
      await toggleEmojiReaction(feedback.id, user.uid, emoji);
      // To see the update, a re-fetch is needed. A proper app would handle this.
      toast({ title: "Reaction updated!", description: "Your reaction has been recorded." });
    } catch (error) {
      console.error("Error reacting:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not add reaction." });
    }
  };

  const timeAgo = feedback.createdAt?.toDate ? formatDistanceToNow(feedback.createdAt.toDate(), { addSuffix: true }) : 'just now';

  return (
    <div className={cn("flex space-x-4", isReply && "ml-8 mt-4")}>
      <Avatar>
        <AvatarImage src={feedback.userPhotoURL || undefined} alt={feedback.userName} />
        <AvatarFallback>{feedback.userName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{feedback.userName}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <p className="text-sm">{feedback.comment}</p>
        
        {/* Actions and Reactions */}
        <div className="flex items-center gap-4 text-muted-foreground">
          {feedback.rating === "like" && <ThumbsUp className="h-4 w-4 text-green-500" />}
          {feedback.rating === "dislike" && <ThumbsDown className="h-4 w-4 text-red-500" />}

          {!isReply && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1">
                  <div className="flex gap-1">
                    {EMOJI_REACTIONS.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-lg"
                        onClick={() => handleEmojiClick(emoji)}
                        disabled={!user}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowReplyForm(!showReplyForm)} disabled={!user}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Display Reactions */}
          <div className="flex gap-2 items-center">
            {Object.entries(feedback.reactions || {}).map(([emoji, data]) => (
                data.count > 0 && (
                    <div key={emoji} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                        <span>{emoji}</span>
                        <span>{data.count}</span>
                    </div>
                )
            ))}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && !isReply && (
            <form onSubmit={handleReplySubmit} className="space-y-2 pt-2">
                <Textarea 
                    placeholder={`Reply to ${feedback.userName}...`}
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    rows={2}
                    disabled={isSubmittingReply}
                />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={!replyComment.trim() || isSubmittingReply}>
                        {isSubmittingReply ? "Replying..." : "Reply"}
                    </Button>
                </div>
            </form>
        )}

        {/* Display Replies */}
        {feedback.replies && feedback.replies.length > 0 && (
            <div className="pt-4 border-l-2 border-muted pl-4 space-y-4">
                {feedback.replies.map(reply => (
                    <FeedbackItem key={reply.id} feedback={reply as unknown as Feedback} isReply={true} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
