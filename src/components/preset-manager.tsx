"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  savePreset,
  getPresets,
  deletePreset,
} from "@/services/user-presets-service";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
import { Save, ChevronDown, Trash2, LockKeyhole } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

interface PresetManagerProps {
  toolId: string;
  currentParams: AnyPresetParams;
  onLoadPreset: (params: AnyPresetParams) => void;
}

export function PresetManager({
  toolId,
  currentParams,
  onLoadPreset,
}: PresetManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [presets, setPresets] = useState<ToolPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  const fetchPresets = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const userPresets = await getPresets(user.uid, toolId);
    setPresets(userPresets);
    setIsLoading(false);
  }, [user, toolId]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleSave = async () => {
    if (!user || !newPresetName.trim()) return;

    try {
      await savePreset(user.uid, toolId, newPresetName, currentParams);
      toast({
        title: "Preset Saved",
        description: `Your settings have been saved as "${newPresetName}".`,
      });
      setNewPresetName("");
      setSaveDialogOpen(false);
      fetchPresets(); // Refresh the list
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
    try {
      await deletePreset(user.uid, presetId);
      toast({
        title: "Preset Deleted",
        description: "The saved preset has been removed.",
      });
      fetchPresets(); // Refresh the list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed text-sm text-muted-foreground">
        <LockKeyhole className="h-4 w-4" />
        <p>
          <Button variant="link" className="p-0 h-auto" onClick={() => {}}>
            Sign in
          </Button>{" "}
          to save and load your parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center p-2 rounded-lg border border-dashed">
      <p className="text-sm font-medium text-muted-foreground mr-2">Presets:</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Load Preset <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Your Saved Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
            <div className="p-2 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : presets.length === 0 ? (
            <DropdownMenuItem disabled>No presets found</DropdownMenuItem>
          ) : (
            presets.map((preset) => (
              <div key={preset.id} className="flex items-center">
                <DropdownMenuItem
                  onClick={() => onLoadPreset(preset.parameters)}
                  className="flex-grow cursor-pointer"
                >
                  {preset.name}
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 mr-1 shrink-0">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the "{preset.name}" preset.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(preset.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" /> Save Current
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
            <DialogDescription>
              Give a name to your current settings to save them for later.
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
    </div>
  );
}
