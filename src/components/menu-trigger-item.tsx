"use client"

import { TabsTrigger } from "@/components/ui/tabs";
import { MenuItemData } from "@/lib/menu-data";
import { cn } from "@/lib/utils";

interface MenuTriggerItemProps {
  item: MenuItemData;
  isActive: boolean;
  onClick: () => void;
  isHighlighted: boolean;
}

export function MenuTriggerItem({ item, isActive, onClick, isHighlighted }: MenuTriggerItemProps) {
  return (
    <TabsTrigger
      value={item.value}
      className={cn(
        "flex flex-col xl:flex-row gap-2 h-14 xl:h-10 transition-all duration-200",
        item.hidden ? "[&&&]:hidden" : "",
        isHighlighted && !isActive ? "ring-2 ring-primary/80 bg-primary/20" : "",
        isActive ? "hover:ring-2 hover:ring-primary-foreground hover:dark:ring-primary" : ""
      )}
      onClick={onClick}
      data-state={isActive ? "active" : "inactive"}
    >
      {item.icon}
      <span>{item.text}</span>
    </TabsTrigger>
  );
}
