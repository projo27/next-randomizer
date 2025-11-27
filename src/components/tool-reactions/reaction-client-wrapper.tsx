// src/components/tool-reactions/reaction-client-wrapper.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toggleToolReaction } from "@/services/tool-reaction-service";
import type { ReactionMap } from "@/types/comment";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "🤔", "👎"];

type ReactionClientWrapperProps = {
  toolId: string;
  initialReactions: ReactionMap;
};

export function ReactionClientWrapper({
  toolId,
  initialReactions,
}: ReactionClientWrapperProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [reactions, setReactions] = useState(initialReactions);
  const { toast } = useToast();

  const handleEmojiClick = async (emoji: string) => {
    if (!user) {
      toast({
        variant: "default",
        title: "Login Required",
        description: "Let's Sign in to react.",
        duration: 2000,
      });
      return;
    }

    const prevReactions = JSON.parse(JSON.stringify(reactions));

    // Optimistic update
    setReactions(currentReactions => {
      const newReactions = { ...currentReactions };
      const reactionData = newReactions[emoji] || { count: 0, users: [] };
      const userIndex = reactionData.users.indexOf(user.uid);

      if (userIndex > -1) { // User is removing their reaction
        reactionData.count = Math.max(0, reactionData.count - 1);
        reactionData.users.splice(userIndex, 1);
      } else { // User is adding a reaction
        reactionData.count += 1;
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
      await toggleToolReaction(toolId, user.uid, emoji);
    } catch (error) {
      console.error("Error toggling tool reaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your reaction. Please try again.",
      });
      // Revert optimistic update on error
      setReactions(prevReactions);
    }
  };

  if (authLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {EMOJI_REACTIONS.map((emoji) => {
        const reactionData = reactions[emoji];
        const count = reactionData?.count || 0;
        const userHasReacted = user && reactionData?.users.includes(user.uid);

        return (
          <div
            key={emoji}
            // variant="outline"
            onClick={() => handleEmojiClick(emoji)}
            className={cn(
              "flex flex-col sm:flex-row items-center gap-2 transition-all cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2",
              userHasReacted && "bg-accent text-accent-foreground border-accent-foreground/50",
              !user && "cursor-not-allowed disabled"
            )}
          // disabled={!user}
          >
            <span className="text-xl">{emoji}</span>
            <span className="font-bold">{count}</span>
          </div>
        );
      })}
      {/* {!user && (
        <Alert variant="default" className="border-dashed">
          <AlertDescription className="text-sm">
            <Button variant="link" onClick={signInWithGoogle} className="p-0 h-auto">
              Sign in
            </Button>{" "}
            to add your reaction.
          </AlertDescription>
        </Alert>
      )} */}
    </div>
  );
}
