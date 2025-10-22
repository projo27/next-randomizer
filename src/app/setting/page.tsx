
"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { GripVertical, Save, LockKeyhole, ArrowDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMenuOrder, MenuItemData } from "@/context/MenuOrderContext";
import { cn } from "@/lib/utils";

// --- Sortable Item Component for Settings Page ---
function SortableMenuItem({
  item,
  isDragging,
}: {
  item: MenuItemData;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.value });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border"
    >
      <Button
        variant="ghost"
        size="icon"
        {...attributes}
        {...listeners}
        className="cursor-grab"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2 text-sm">
        {item.icon}
        <span>{item.text}</span>
      </div>
    </div>
  );
}

// --- Menu Order Management Component ---
function MenuOrderSettings() {
  const { menuOrder, setMenuOrder, loading } = useMenuOrder();
  const [activeItem, setActiveItem] = useState<MenuItemData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const allItems = [...menuOrder.visible, ...menuOrder.hidden];
    const item = allItems.find((i) => i.value === active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (over && active.id !== over.id) {
      const allItems = [...menuOrder.visible, ...menuOrder.hidden];
      const oldIndex = allItems.findIndex((item) => item.value === active.id);
      const newIndex = allItems.findIndex((item) => item.value === over.id);

      const newOrderedItems = arrayMove(allItems, oldIndex, newIndex);

      // Find the index of the divider. It's the original count of visible items.
      const dividerIndex = menuOrder.visible.length;

      // The new divider position might be different if items were moved across it.
      // We need to find the item that is now at the divider position in the new list.
      // Let's assume the divider stays at the same logical position for simplicity.
      // A better way is to find the index of the divider element in the new list.
      // Let's find the new index of the item that was *originally* at the divider position.
      let newDividerIndex = newIndex;
       if (over.id === 'hidden-divider') {
          // If we drop on the divider, place it right after the visible items
          newDividerIndex = menuOrder.visible.length;
       } else {
          const overItemIndexInAll = newOrderedItems.findIndex(item => item.value === over.id);
          newDividerIndex = overItemIndexInAll;
       }


      // Recalculate where the split happens.
      // The number of visible items might change.
      // A simpler approach: use the handleDragEnd event to re-calculate visible/hidden.

      const overIsDivider = over.id === 'hidden-divider';
      let newVisible: MenuItemData[];
      let newHidden: MenuItemData[];

      const movedItems = arrayMove(allItems, oldIndex, newIndex);
      
      let splitIndex = menuOrder.visible.length;
      
      const activeItemWasVisible = menuOrder.visible.some(item => item.value === active.id);
      const overItemWasVisible = menuOrder.visible.some(item => item.value === over.id);

      // This logic is getting complex. Let's simplify.
      // The `over.id` tells us where we dropped. We can use a special ID for the divider.
      // Let's find the position of the divider in the display list.
      const displayItems = [...menuOrder.visible, {value: 'hidden-divider', text: '', icon: <></>}, ...menuOrder.hidden];
      const oldDisplayIndex = displayItems.findIndex(i => i.value === active.id);
      let newDisplayIndex = displayItems.findIndex(i => i.value === over.id);

      // If dragging over the divider itself
      if (over.id === 'hidden-divider') {
         // Place it just before the divider if dragging down, or after if dragging up.
         newDisplayIndex = oldDisplayIndex < newDisplayIndex ? newDisplayIndex -1 : newDisplayIndex;
      }
      
      const newDisplayOrder = arrayMove(displayItems, oldDisplayIndex, newDisplayIndex);

      const dividerPosition = newDisplayOrder.findIndex(i => i.value === 'hidden-divider');

      newVisible = newDisplayOrder.slice(0, dividerPosition).filter(i => i.value !== 'hidden-divider');
      newHidden = newDisplayOrder.slice(dividerPosition).filter(i => i.value !== 'hidden-divider');
      
      setMenuOrder({ visible: newVisible, hidden: newHidden });
    }
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const allSortableItems = [...menuOrder.visible, ...menuOrder.hidden];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={allSortableItems.map(item => item.value)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-4 border rounded-lg space-y-2">
            {menuOrder.visible.map((item) => (
                <SortableMenuItem key={item.value} item={item} />
            ))}
            
            <div className="relative flex items-center justify-center my-4">
              <Separator className="w-full" />
              <div className="absolute px-4 bg-card text-sm text-muted-foreground flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Hidden in "Show More"
              </div>
            </div>

            {menuOrder.hidden.map((item) => (
                <SortableMenuItem key={item.value} item={item} />
            ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? <SortableMenuItem item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}


// --- Main Settings Page Content ---
function SettingsPageContent() {
  const {
    animationDuration,
    setAnimationDuration,
    playSounds,
    setPlaySounds,
    loading: settingsLoading,
  } = useSettings();
  const { user, loading: authLoading } = useAuth();

  const isLoading = authLoading || settingsLoading;

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-8 py-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center mt-2 justify-center p-8 bg-primary dark:bg-secondary border border-red-200 rounded-lg text-center max-w-4xl mx-auto">
        <LockKeyhole className="h-12 w-12 text-red-70 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
        <p className="text-lg text-current">
          You must be logged in to view and change settings.
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Customize your experience across the application. Changes are saved
          automatically.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-8 py-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="animation-duration" className="text-base">
              Animation Duration
            </Label>
            <span className="font-mono text-xl text-primary">
              {animationDuration}s
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Controls the duration of various animations, like dice rolls and
            spinners.
          </p>
          <Slider
            id="animation-duration"
            min={1}
            max={10}
            step={1}
            value={[animationDuration]}
            onValueChange={(value) => setAnimationDuration(value[0])}
            className="[&&&]:pt-4"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="play-sounds" className="text-base">
              Play Sounds
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable sounds during randomization actions.
            </p>
          </div>
          <Switch
            id="play-sounds"
            checked={playSounds}
            onCheckedChange={setPlaySounds}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-base">Menu Order</Label>
            <p className="text-sm text-muted-foreground">
              Drag and drop to reorder the tools. Items below the divider will be hidden under the "Show More" button.
            </p>
          </div>
          <MenuOrderSettings />
        </div>
      </CardContent>
      <Separator />
      <CardFooter>
        <div className="flex justify-between items-end mt-4 w-full">
          <Link href="/">&#8592; Home</Link>
          <p className="text-sm text-muted-foreground italic">
            Settings are saved automatically.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full mt-6">
        <SettingsPageContent />
      </main>
    </div>
  );
}
