"use client"

import { TabsTrigger } from "@/components/ui/tabs";
import { MenuItemData } from "@/lib/menu-data";
import { cn } from "@/lib/utils";

interface MenuTriggerItemProps {
  item: MenuItemData;
  isActive: boolean;
  onClick: () => void;
}

export function MenuTriggerItem({ item, isActive, onClick }: MenuTriggerItemProps) {
  return (
    <TabsTrigger
      value={item.value}
      className={cn(
        `flex flex-col xl:flex-row gap-2 h-14 xl:h-10 hover:ring-2 hover:ring-primary-foreground hover:dark:ring-primary`,
        item.hidden ? "[&&&]:hidden" : "",
      )}
      onClick={onClick}
      data-state={isActive ? "active" : "inactive"}
    >
      {item.icon}
      <span>{item.text}</span>
    </TabsTrigger>
  );
}
