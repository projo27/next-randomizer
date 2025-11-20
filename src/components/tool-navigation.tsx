"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { TabsList } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuOrder } from "@/context/MenuOrderContext";
import { MenuTriggerItem } from "./menu-trigger-item";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { MenuItemData } from "@/lib/menu-data";

export function ToolNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "list";

  const { menuOrder, loading } = useMenuOrder();

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(pathname + "?" + params.toString());
    },
    [pathname, router, searchParams],
  );

  // Removed blocking skeleton loader to show default content immediately

  return (
    <Collapsible className="w-full">
      <TabsList className="flex flex-wrap items-center justify-center w-full h-auto gap-2 py-2">
        {menuOrder.visible.map((item: any) => (
          <MenuTriggerItem
            key={item.value}
            item={item}
            isActive={activeTab === item.value}
            onClick={() => handleTabChange(item.value)}
          />
        ))}
        <CollapsibleContent className="contents">
          {menuOrder.hidden.map((item: any) => (
            <MenuTriggerItem
              key={item.value}
              item={item}
              isActive={activeTab === item.value}
              onClick={() => handleTabChange(item.value)}
            />
          ))}
        </CollapsibleContent>
      </TabsList>

      {menuOrder.hidden.length > 0 && (
        <div className="relative flex items-center justify-center mt-1 mb-4">
          <Separator className="flex-1" />
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 group text-xs"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} 
              <span className="group-data-[state=closed]:block group-data-[state=open]:hidden">
                Show More
              </span>
              <span className="group-data-[state=open]:block group-data-[state=closed]:hidden">
                Show Less
              </span>
              {!loading && <ChevronDown className="h-4 w-4 ml-2 transition-transform group-data-[state=open]:rotate-180" />}
            </Button>
          </CollapsibleTrigger>
          <Separator className="flex-1" />
        </div>
      )}
    </Collapsible>
  );
}
