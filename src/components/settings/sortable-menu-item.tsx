
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import type { MenuItemData } from "@/lib/menu-data";

export function SortableMenuItem({
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
