import Link from "next/link";
import { TabsTrigger } from "@/components/ui/tabs";
import { MenuItemData } from "@/lib/menu-data";
import { cn } from "@/lib/utils";

interface MenuTriggerItemProps {
  item: MenuItemData;
  isActive: boolean;
  onClick?: () => void;
  isHighlighted: boolean;
  href: string;
}

export function MenuTriggerItem({ item, isActive, onClick, isHighlighted, href }: MenuTriggerItemProps) {
  return (
    <TabsTrigger
      value={item.value}
      asChild
      className={cn(
        "flex flex-col xl:flex-row gap-2 h-14 xl:h-10 transition-all duration-200 cursor-pointer group hover:bg-primary/10",
        item.hidden ? "[&&&]:hidden" : "",
        isHighlighted && !isActive ? "ring-2 ring-primary/80 bg-primary/20" : "",
        isActive ? "hover:ring-2 hover:ring-primary-foreground hover:dark:ring-primary" : ""
      )}
      onClick={onClick}
      data-state={isActive ? "active" : "inactive"}
    >
      <Link href={href} rel="canonical">
        {item.icon}
        <span>{item.text}</span>
      </Link>
    </TabsTrigger>
  );
}
