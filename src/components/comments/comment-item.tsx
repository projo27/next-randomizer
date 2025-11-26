// src/components/comments/comment-item.tsx
"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import type { Comment, CommentReply, CommentReplyData } from "@/types/comment";
import { addReply, toggleCommentReaction } from "@/services/comment-service";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, MessageSquare } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

type CommentItemProps = {
  comment: Comment;
  isReply?: boolean;
  onReplyAdded?: (commentId: string, newReply: CommentReply) => void;
};

export function CommentItem({ comment, isReply = false, onReplyAdded }: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyComment, setReplyComment] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [optimisticReactions, setOptimisticReactions] = useState(comment.reactions || {});

  const { toast } = useToast();

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyComment.trim() || isReply) return;

    setIsSubmittingReply(true);
    try {
      const replyData: Omit<CommentReplyData, "createdAt" | "reactions"> = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || null,
        comment: replyComment,
      };
      
      const newReplyId = await addReply(comment.id, replyData);

       if (onReplyAdded) {
         onReplyAdded(comment.id, {
            id: newReplyId,
            ...replyData,
            reactions: {},
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

    setOptimisticReactions(prevReactions => {
        const newReactions = JSON.parse(JSON.stringify(prevReactions));
        const reactionData = newReactions[emoji] || { count: 0, users: [] };
        const userIndex = reactionData.users.indexOf(user.uid);

        if (userIndex > -1) {
            reactionData.count--;
            reactionData.users.splice(userIndex, 1);
        } else {
            reactionData.count++;
            reactionData.users.push(user.uid);
        }

        if (reactionData.count === 0) {
            delete newReactions[emoji];
        } else {
            newReactions[emoji] = reactionData;
        }
        return newReactions;
    });

    try {
      await toggleCommentReaction(comment.id, user.uid, emoji);
    } catch (error) {
      console.error("Error reacting:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not add reaction. Reverting." });
      setOptimisticReactions(comment.reactions);
    }
  };

  const timeAgo = comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'just now';

  return (
    <div className={cn("flex space-x-4", isReply && "ml-8 mt-4")}>
      <Avatar>
        <AvatarImage src={comment.userPhotoURL || undefined} alt={comment.userName} />
        <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{comment.userName}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <p className="text-sm">{comment.comment}</p>
        
        <div className="flex items-center gap-4 text-muted-foreground">
          {!isReply && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!user}>
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
                        className={cn(
                            "h-8 w-8 text-lg",
                             optimisticReactions[emoji]?.users.includes(user?.uid || '') && "bg-accent"
                        )}
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
                <span className="text-xs ml-1">{comment.replyCount || 0}</span>
              </Button>
            </>
          )}

          <div className="flex gap-2 items-center">
            {Object.entries(optimisticReactions || {}).map(([emoji, data]) => (
                data.count > 0 && (
                    <div key={emoji} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs cursor-pointer" onClick={() => handleEmojiClick(emoji)}>
                        <span>{emoji}</span>
                        <span>{data.count}</span>
                    </div>
                )
            ))}
          </div>
        </div>

        {showReplyForm && !isReply && (
            <form onSubmit={handleReplySubmit} className="space-y-2 pt-2">
                <Textarea 
                    placeholder={`Reply to ${comment.userName}...`}
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

        {comment.replies && comment.replies.length > 0 && (
            <div className="pt-4 border-l-2 border-muted pl-4 space-y-4">
                {comment.replies.map(reply => (
                    <CommentItem key={reply.id} comment={reply as unknown as Comment} isReply={true} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
