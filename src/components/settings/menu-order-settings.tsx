
"use client";

import { useState } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useMenuOrder } from "@/context/MenuOrderContext";
import type { MenuItemData } from "@/lib/menu-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowDown } from "lucide-react";
import { SortableMenuItem } from "./sortable-menu-item";


export function MenuOrderSettings() {
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
      
      const dividerPosition = newOrderedItems.findIndex(
        (item, index) =>
          !menuOrder.visible.some(v => v.value === item.value) &&
          menuOrder.visible.some(v => v.value === newOrderedItems[index - 1]?.value)
      );

      const visibleCount = menuOrder.visible.length;
      let splitIndex = visibleCount;

      const activeWasVisible = menuOrder.visible.some(i => i.value === active.id);
      const overWasVisible = menuOrder.visible.some(i => i.value === over.id);
      const overIsLastVisible = menuOrder.visible[visibleCount - 1]?.value === over.id;
      const activeIsFirstHidden = menuOrder.hidden[0]?.value === active.id;

      if (activeWasVisible && !overWasVisible) {
        splitIndex = newIndex;
      } else if (!activeWasVisible && overWasVisible) {
        splitIndex = newIndex + 1;
      } else if (activeIsFirstHidden && overIsLastVisible) {
         splitIndex = oldIndex;
      } else {
        splitIndex = visibleCount;
      }
      
      // A simpler heuristic for finding the split point after a drag
      const overIndex = newOrderedItems.findIndex(item => item.value === over.id);
      const activeIsMovingDown = oldIndex < newIndex;

      let newVisibleCount = menuOrder.visible.length;
      if (activeWasVisible && !overWasVisible) {
        newVisibleCount--;
      } else if (!activeWasVisible && overWasVisible) {
        newVisibleCount++;
      }

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
