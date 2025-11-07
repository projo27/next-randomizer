
// src/components/settings/menu-order-settings.tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useMenuOrder } from "@/context/MenuOrderContext";
import { useSettings } from "@/context/SettingsContext";
import type { MenuItemData } from "@/lib/menu-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowDown } from "lucide-react";
import { SortableMenuItem } from "./sortable-menu-item";

export function MenuOrderSettings() {
  const { menuOrder, setMenuOrder, loading } = useMenuOrder();
  const { visibleToolCount, setVisibleToolCount } = useSettings();
  const [activeItem, setActiveItem] = useState<MenuItemData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor)
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
      
      // Update the visibleToolCount based on where the drag ended
      // If an item is dragged from hidden to visible, or vice-versa
      const activeWasVisible = oldIndex < visibleToolCount;
      const newPositionIsVisible = newIndex < visibleToolCount;
      
      let newVisibleCount = visibleToolCount;
      if (activeWasVisible && !newPositionIsVisible) {
          // Dragged from visible to hidden
          newVisibleCount = Math.max(1, newIndex);
      } else if (!activeWasVisible && newPositionIsVisible) {
          // Dragged from hidden to visible
          newVisibleCount = newIndex + 1;
      }
      
      // Update the count setting
      setVisibleToolCount(newVisibleCount);

      // Persist the full new order
      setMenuOrder({
        visible: newOrderedItems.slice(0, newVisibleCount),
        hidden: newOrderedItems.slice(newVisibleCount),
      });
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
        items={allSortableItems.map((item) => item.value)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-4 border rounded-lg space-y-2">
          {allSortableItems.map((item, index) => (
            <>
              {index === visibleToolCount && (
                <div key={index} className="relative flex items-center justify-center my-4">
                  <Separator className="w-full" />
                  <div className="absolute px-4 bg-card text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    Hidden in "Show More"
                  </div>
                </div>
              )}
              <SortableMenuItem key={item.value} item={item} />
            </>
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? <SortableMenuItem item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
