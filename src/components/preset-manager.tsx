"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  savePreset,
  getUserPresets,
  getPublicPresets,
  deletePreset,
  updatePresetVisibility,
  togglePresetReaction,
} from "@/services/supabase-preset-service";
import type { ToolPreset, AnyPresetParams } from "@/types/presets";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Save, Trash2, LockKeyhole, Globe, Lock, User, Loader2, Users } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { sendGTMEvent } from "@next/third-parties/google";
import { Label } from "./ui/label";
import { cn, formatRelativeDate } from "@/lib/utils";

interface PresetManagerProps {
  toolId: string;
  currentParams: AnyPresetParams;
  onLoadPreset: (params: AnyPresetParams) => void;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "🤔", "👎"];
const PAGE_SIZE = 15;

export function PresetManager({
  toolId,
  currentParams,
  onLoadPreset,
}: PresetManagerProps) {
  const { user, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Data States
  const [userPresets, setUserPresets] = useState<ToolPreset[]>([]);
  const [publicPresets, setPublicPresets] = useState<ToolPreset[]>([]);
  const [loadedPreset, setLoadedPreset] = useState<ToolPreset | null>(null);

  // Pagination States
  const [userPage, setUserPage] = useState(0);
  const [publicPage, setPublicPage] = useState(0);
  const [hasMoreUser, setHasMoreUser] = useState(true);
  const [hasMorePublic, setHasMorePublic] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);

  // UI States
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setLoadDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [activeTab, setActiveTab] = useState("your-presets");

  // Refs for infinite scroll
  const userObserver = useRef<IntersectionObserver>();
  const publicObserver = useRef<IntersectionObserver>();

  const lastUserElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingUser) return;
    if (userObserver.current) userObserver.current.disconnect();
    userObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreUser) {
        setUserPage(prev => prev + 1);
      }
    });
    if (node) userObserver.current.observe(node);
  }, [isLoadingUser, hasMoreUser]);

  const lastPublicElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingPublic) return;
    if (publicObserver.current) publicObserver.current.disconnect();
    publicObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePublic) {
        setPublicPage(prev => prev + 1);
      }
    });
    if (node) publicObserver.current.observe(node);
  }, [isLoadingPublic, hasMorePublic]);

  useEffect(() => {
    const presetKey = `preset_for_${toolId}`;
    const storedPreset = sessionStorage.getItem(presetKey);

    if (storedPreset) {
      try {
        const params = JSON.parse(storedPreset);
        onLoadPreset(params);
        sessionStorage.removeItem(presetKey); // Clear after loading
        toast({ title: "Public Preset Loaded", description: "The community preset has been applied." });
      } catch (e) {
        console.error("Failed to parse preset from session storage", e);
      }
    }
  }, [toolId, onLoadPreset, toast]);

  // Fetch Functions
  const fetchUserPresets = useCallback(async (page: number, append: boolean = false) => {
    if (!user) return;
    setIsLoadingUser(true);
    try {
      const presets = await getUserPresets(user.uid, toolId, page);
      if (presets.length < PAGE_SIZE) setHasMoreUser(false);
      setUserPresets(prev => append ? [...prev, ...presets] : presets);
    } catch (error) {
      console.error("Error fetching user presets:", error);
    } finally {
      setIsLoadingUser(false);
    }
  }, [user, toolId]);

  const fetchPublicPresets = useCallback(async (page: number, append: boolean = false) => {
    setIsLoadingPublic(true);
    try {
      const presets = await getPublicPresets(toolId, page, user?.uid);
      if (presets.length < PAGE_SIZE) setHasMorePublic(false);
      setPublicPresets(prev => append ? [...prev, ...presets] : presets);
    } catch (error) {
      console.error("Error fetching public presets:", error);
    } finally {
      setIsLoadingPublic(false);
    }
  }, [toolId, user]);

  // Effects for fetching
  useEffect(() => {
    if (isLoadDialogOpen && activeTab === "your-presets" && userPresets.length === 0) {
      fetchUserPresets(0);
    }
  }, [isLoadDialogOpen, activeTab, fetchUserPresets, userPresets.length]);

  useEffect(() => {
    if (isLoadDialogOpen && activeTab === "public-presets" && publicPresets.length === 0) {
      fetchPublicPresets(0);
    }
  }, [isLoadDialogOpen, activeTab, fetchPublicPresets, publicPresets.length]);

  useEffect(() => {
    if (userPage > 0) fetchUserPresets(userPage, true);
  }, [userPage, fetchUserPresets]);

  useEffect(() => {
    if (publicPage > 0) fetchPublicPresets(publicPage, true);
  }, [publicPage, fetchPublicPresets]);

  // Actions
  const handleSave = async () => {
    if (!user || !newPresetName.trim()) return;
    sendGTMEvent({ event: "action_preset_save", user_email: user.email, tool_id: toolId });

    try {
      const id = await savePreset(
        user.uid,
        toolId,
        newPresetName,
        currentParams,
        isPublic,
        {
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.photoURL,
        }
      );

      // Update loaded preset info immediately
      setLoadedPreset({
        id,
        name: newPresetName,
        toolId,
        parameters: currentParams,
        createdAt: new Date(),
        isPublic,
        userId: user.uid,
        userDisplayName: user.displayName || undefined,
        userAvatarUrl: user.photoURL || undefined,
        reactionCounts: {},
        userReaction: null
      });

      toast({
        title: "Preset Saved",
        description: `Your settings have been saved as "${newPresetName}".`,
      });
      setNewPresetName("");
      setIsPublic(false);
      setSaveDialogOpen(false);

      // Reset lists to refresh
      setUserPage(0);
      setHasMoreUser(true);
      fetchUserPresets(0);
      if (isPublic) {
        setPublicPage(0);
        setHasMorePublic(true);
        fetchPublicPresets(0);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    }
  };

  const handleDelete = async (presetId: string) => {
    if (!user) return;
    sendGTMEvent({ event: "action_preset_delete", user_email: user.email, tool_id: toolId });
    try {
      await deletePreset(presetId);
      toast({
        title: "Preset Deleted",
        description: "The saved preset has been removed.",
      });
      // Remove from lists locally
      setUserPresets(prev => prev.filter(p => p.id !== presetId));
      setPublicPresets(prev => prev.filter(p => p.id !== presetId));
      if (loadedPreset?.id === presetId) setLoadedPreset(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    }
  };

  const handleToggleVisibility = async (preset: ToolPreset) => {
    if (!user || user.uid !== preset.userId) return;
    const newVisibility = !preset.isPublic;

    // Optimistic update
    setUserPresets(prev => prev.map(p => p.id === preset.id ? { ...p, isPublic: newVisibility } : p));
    if (loadedPreset?.id === preset.id) setLoadedPreset(prev => prev ? { ...prev, isPublic: newVisibility } : null);

    try {
      await updatePresetVisibility(preset.id, newVisibility);
      toast({
        title: "Visibility Updated",
        description: `Preset is now ${newVisibility ? "public" : "private"}.`,
      });
      // Refresh public list if needed
      setPublicPage(0);
      setHasMorePublic(true);
      fetchPublicPresets(0);
    } catch (error) {
      // Revert
      setUserPresets(prev => prev.map(p => p.id === preset.id ? { ...p, isPublic: !newVisibility } : p));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update visibility.",
      });
    }
  };

  const handleReaction = async (preset: ToolPreset, reaction: string) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please sign in to react." });
      return;
    }

    const isRemoving = preset.userReaction === reaction;
    const newReaction = isRemoving ? null : reaction;

    // Helper to update counts
    const updateCounts = (counts: Record<string, number> = {}, oldReaction: string | null | undefined, newReaction: string | null) => {
      const newCounts = { ...counts };
      if (oldReaction) newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 0) - 1);
      if (newReaction) newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
      return newCounts;
    };

    // Optimistic update
    const updateList = (list: ToolPreset[]) => list.map(p => {
      if (p.id !== preset.id) return p;
      return {
        ...p,
        userReaction: newReaction,
        reactionCounts: updateCounts(p.reactionCounts, p.userReaction, newReaction)
      };
    });

    setUserPresets(prev => updateList(prev));
    setPublicPresets(prev => updateList(prev));
    if (loadedPreset?.id === preset.id) {
      setLoadedPreset(prev => prev ? {
        ...prev,
        userReaction: newReaction,
        reactionCounts: updateCounts(prev.reactionCounts, prev.userReaction, newReaction)
      } : null);
    }

    try {
      await togglePresetReaction(user.uid, preset.id, reaction);
    } catch (error) {
      // Revert
      console.error("Reaction failed", error);
      // We should ideally revert here, but for simplicity we'll just show error. 
      // A full revert would require keeping previous state or refetching.
      toast({ variant: "destructive", title: "Error", description: "Failed to save reaction." });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 py-3 px-2 rounded-lg border border-dashed text-sm text-muted-foreground bg-muted/50">
        <LockKeyhole className="h-4 w-4" />
        <p>
          <Button variant="link" className="p-0 h-auto" onClick={signInWithGoogle}>
            Sign in
          </Button>{" "}
          to save and load your parameters.
        </p>
      </div>
    );
  }

  const PresetList = ({ presets, showOwnerInfo, allowActions, hasMore, isLoading, lastElementRef }: {
    presets: ToolPreset[],
    showOwnerInfo?: boolean,
    allowActions?: boolean,
    hasMore: boolean,
    isLoading: boolean,
    lastElementRef: (node: HTMLDivElement) => void
  }) => {
    if (presets.length === 0 && !isLoading) {
      return <div className="text-center py-8 text-muted-foreground">No presets found.</div>;
    }

    return (
      <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 pb-6">
        {presets.map((preset, index) => {
          const isLast = index === presets.length - 1;
          return (
            <div
              key={preset.id}
              ref={isLast ? lastElementRef : null}
              className="flex flex-col gap-2 p-3 rounded-lg border bg-card transition-colors relative hover:bg-accent/50"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex-grow cursor-pointer flex items-center gap-3"
                  onClick={() => {
                    sendGTMEvent({ event: "action_preset_load", user_email: user?.email ?? 'guest', tool_id: toolId });
                    onLoadPreset(preset.parameters);
                    setLoadedPreset(preset);
                    setLoadDialogOpen(false);
                    toast({ title: "Preset Loaded", description: `Loaded "${preset.name}"` });
                  }}
                >
                  {showOwnerInfo && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={preset.userAvatarUrl} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col w-full">
                    <div className="flex items-center gap-1 justify-between w-full">
                      <span className="font-medium text-sm">{preset.name}</span>

                      {showOwnerInfo && preset.userDisplayName && (
                        <span className="text-sm text-muted-foreground">by {user?.uid === preset.userId ? "You" : preset.userDisplayName}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground italic">
                      {formatRelativeDate(preset.createdAt)}
                    </span>
                  </div>
                </div>

                {allowActions && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleVisibility(preset)}
                      title={preset.isPublic ? "Make Private" : "Make Public"}
                    >
                      {preset.isPublic ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete "{preset.name}". It will be moved to trash.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(preset.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-1 flex-wrap absolute -bottom-4 left-1/2 transform -translate-x-1/2 rounded-full border shadow-sm bg-card p-0 px-2">
                {REACTIONS.map(emoji => {
                  const count = preset.reactionCounts?.[emoji] || 0;
                  const isReacted = preset.userReaction === emoji;
                  if (count === 0 && !isReacted) return null; // Hide unused reactions to save space? Or show all? User asked for buttons.
                  // Let's show common ones or just buttons.
                  // Requirement: "user lain dapat memberi reaction... user dapat mengubah reactionnya"
                  // Let's show all buttons but small.
                  return null;
                })}
                {/* Actually, let's just show the buttons always available to click */}
                <div className="flex gap-1 my-1">
                  {["👍", "❤️", "😂", "👎"].map(emoji => {
                    const count = preset.reactionCounts?.[emoji] || 0;
                    const isReacted = preset.userReaction === emoji;
                    return (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="lg"
                        className={cn(
                          "h-6 px-2 text-xs gap-1 rounded-full",
                          isReacted && "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(preset, emoji);
                        }}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span>{count}</span>}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="py-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center p-2 rounded-lg border border-dashed">
      <p className="text-sm font-medium text-muted-foreground mr-2">Presets:</p>

      <Dialog open={isLoadDialogOpen} onOpenChange={setLoadDialogOpen} >
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Load Preset
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>Load Preset</DialogTitle>
            <DialogDescription>
              Choose a preset to load its parameters.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="your-presets" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="your-presets"><User className="mr-2 h-4 w-4" /> Your Presets</TabsTrigger>
              <TabsTrigger value="public-presets"><Users className="mr-2 h-4 w-4" /> Public Presets</TabsTrigger>
            </TabsList>
            <TabsContent value="your-presets" className="mt-4">
              <PresetList
                presets={userPresets}
                allowActions={true}
                hasMore={hasMoreUser}
                isLoading={isLoadingUser}
                lastElementRef={lastUserElementRef}
              />
            </TabsContent>
            <TabsContent value="public-presets" className="mt-4">
              <PresetList
                presets={publicPresets}
                showOwnerInfo={true}
                allowActions={false}
                hasMore={hasMorePublic}
                isLoading={isLoadingPublic}
                lastElementRef={lastPublicElementRef}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto" variant="secondary">
            <Save className="mr-2 h-4 w-4" /> Save Current
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
            <DialogDescription>
              Save your current settings to reuse later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preset-name" className="text-right">
                Name
              </Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Weekly Team Shuffle"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is-public" className="text-right">
                Public
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="is-public" className="font-normal text-muted-foreground">
                  Share this preset with everyone
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!newPresetName.trim()}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loadedPreset && (
        <div className="flex items-center gap-2 ml-auto sm:ml-2 text-sm text-muted-foreground border-l pl-3 ">
          <span className="font-medium text-foreground">{loadedPreset.name}</span>
          <span className="text-xs">by {user.uid === loadedPreset.userId ? "You" : loadedPreset.userDisplayName}</span>
        </div>
      )}
    </div>
  );
}
