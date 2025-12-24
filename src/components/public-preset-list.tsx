"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { useInView } from "react-intersection-observer";
import { useAuth } from "@/context/AuthContext";
import { getAllPublicPresets } from "@/services/supabase-preset-service";
import type { ToolPreset } from "@/types/presets";
import { triggerList } from "@/lib/menu-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PublicPresetListProps {
  initialPresets: ToolPreset[];
  presetsPerPage: number;
}

export function PublicPresetList({ initialPresets, presetsPerPage }: PublicPresetListProps) {
  const [presets, setPresets] = useState(initialPresets);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPresets.length === presetsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const loadMorePresets = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const newPresets = await getAllPublicPresets(page, user?.uid);
      if (newPresets.length < presetsPerPage) {
        setHasMore(false);
      }
      setPresets(prev => [...prev, ...newPresets]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Failed to load more presets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, user?.uid, presetsPerPage]);

  useEffect(() => {
    if (inView) {
      loadMorePresets();
    }
  }, [inView, loadMorePresets]);

  const handlePresetClick = (preset: ToolPreset) => {
    try {
      // Save to session storage
      sessionStorage.setItem(`preset_for_${preset.toolId}`, JSON.stringify(preset.parameters));
      // Navigate
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

  const getToolIcon = (toolId: string) => {
    const tool = triggerList.find(t => t.value === toolId);
    return tool?.icon || <User className="h-4 w-4 text-muted-foreground"/>;
  }

  return (
    <div className="space-y-4">
      {presets.map((preset) => (
        <Card key={preset.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handlePresetClick(preset)}>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={preset.userAvatarUrl || ''} />
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <CardTitle className="text-lg">{preset.name}</CardTitle>
              <CardDescription>
                For <span className="font-semibold text-primary">{triggerList.find(t => t.value === preset.toolId)?.text || 'Unknown Tool'}</span>
              </CardDescription>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground text-xs">
                {getToolIcon(preset.toolId)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex justify-between">
                <span>By {preset.userDisplayName || 'Anonymous'}</span>
                <span>{formatRelativeDate(preset.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      ))}

      {isLoading && (
        <>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </>
      )}

      {hasMore && !isLoading && (
        <div ref={ref} className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasMore && (
        <p className="text-center text-muted-foreground py-4">You've reached the end!</p>
      )}
    </div>
  );
}
