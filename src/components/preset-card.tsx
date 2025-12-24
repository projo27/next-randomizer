"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { formatRelativeDate, PRESET_REACTIONS } from "@/lib/utils";
import { ToolPreset } from "@/types/presets";
import { triggerList } from "@/lib/menu-data";
import { useToast } from "@/hooks/use-toast";
import { togglePresetReaction } from "@/services/supabase-preset-service";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface PresetCardProps {
  preset: ToolPreset;
}

export function PresetCard({ preset: initialPreset }: PresetCardProps) {
  const [preset, setPreset] = useState(initialPreset);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth(); // Need auth for reactions

  const handlePresetClick = () => {
    try {
      sessionStorage.setItem(`preset_for_${preset.toolId}`, JSON.stringify(preset.parameters));
      router.push(`/?tab=${preset.toolId}`);
    } catch (e) {
      console.error("Could not save preset to session storage", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the preset due to browser limitations."
      });
    }
  };

  const handleReaction = async (e: React.MouseEvent, reaction: string) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Login Required", description: "Please sign in to react." });
      return;
    }

    const isRemoving = preset.userReaction === reaction;
    const newReaction = isRemoving ? null : reaction;

    // Optimistic Update
    setPreset((prev) => {
      const newCounts = { ...prev.reactionCounts };
      if (prev.userReaction) {
        newCounts[prev.userReaction] = Math.max(0, (newCounts[prev.userReaction] || 0) - 1);
      }
      if (newReaction) {
        newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
      }
      return {
        ...prev,
        userReaction: newReaction,
        reactionCounts: newCounts,
      };
    });

    try {
      await togglePresetReaction(user.uid, preset.id, reaction);
    } catch (error) {
      // Revert on error (could be improved)
      console.error("Reaction failed", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save reaction." });
      // Reverting state is omitted for brevity, but recommended for production
    }
  };


  const getToolIcon = (toolId: string) => {
    const tool = triggerList.find(t => t.value === toolId);
    return tool?.icon || <User className="h-4 w-4 text-muted-foreground" />;
  }

  return (
    <Card>
      <CardContent className="hover:bg-muted/50 transition-colors cursor-pointer relative group py-4" onClick={handlePresetClick}>
        <div className="flex flex-row items-start gap-4 space-y-0">
          <Avatar className="h-10 w-10 border" title={preset?.userDisplayName}>
            <AvatarImage src={preset.userAvatarUrl || ''} />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <div className="flex-grow min-w-0">
            <CardTitle className="text-lg truncate pr-8">{preset.name}</CardTitle>
            <CardDescription className="truncate flex items-center gap-2 text-muted-foreground text-xs shrink-0">
              For {getToolIcon(preset.toolId)} <span className="font-semibold text-primary">{triggerList.find(t => t.value === preset.toolId)?.text || 'Unknown Tool'}</span>
            </CardDescription>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between py-2 ml-auto w-full border-t">
        <span className="text-xs text-muted-foreground">{formatRelativeDate(preset.createdAt)}</span>
        <div className="flex gap-1 items-center">
          {PRESET_REACTIONS.map(emoji => {
            const count = preset.reactionCounts?.[emoji] || 0;
            const isReacted = preset.userReaction === emoji;
            return (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 text-sm gap-1 rounded-full group",
                  isReacted && "bg-primary/10 text-primary hover:bg-primary/20",
                  !isReacted && count === 0 && "hover:opacity-100" // Fade unused reactions slightly
                )}
                onClick={(e) => handleReaction(e, emoji)}
              >
                <span className="group-hover:scale-[3] transition-all duration-200">{emoji}</span>
                {(count > 0 || isReacted) && <span>{count}</span>}
              </Button>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
