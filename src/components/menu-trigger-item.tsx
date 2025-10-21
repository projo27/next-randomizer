"use client"

import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { MenuItemData } from "@/context/MenuOrderContext";

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
