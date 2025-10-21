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
import { LockKeyhole, GripVertical, Save } from "lucide-react";
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
  horizontalListSortingStrategy,
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
    const item = menuOrder.find((i) => i.value === active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    if (over && active.id !== over.id) {
      const oldIndex = menuOrder.findIndex((i) => i.value === active.id);
      const newIndex = menuOrder.findIndex((i) => i.value === over.id);
      const newOrder = arrayMove(menuOrder, oldIndex, newIndex);
      setMenuOrder(newOrder); // This updates context and saves to Firestore
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={menuOrder.map(i => i.value)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {menuOrder.map((item) => (
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-8 py-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center mt-2 justify-center p-8 bg-primary dark:bg-secondary border border-red-200 rounded-lg text-center max-w-2xl mx-auto">
        <LockKeyhole className="h-12 w-12 text-red-70 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
        <p className="text-lg text-current">
          You must be logged in to view and change settings.
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
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
              Drag and drop to reorder the tools in the main navigation.
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
