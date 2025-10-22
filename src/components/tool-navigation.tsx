
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { TabsList } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuOrder } from "@/context/MenuOrderContext";
import { MenuTriggerItem } from "./menu-trigger-item";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { Separator } from "./ui/separator";

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

  if (loading) {
    return (
        <div className="flex flex-wrap items-center justify-center w-full h-auto gap-2 py-2">
            {[...Array(15)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-md" />
            ))}
        </div>
    );
  }

  return (
    <Collapsible className="w-full">
        <TabsList className="flex flex-wrap items-center justify-center w-full h-auto gap-2 py-2">
          {menuOrder.visible.map((item) => (
            <MenuTriggerItem
              key={item.value}
              item={item}
              isActive={activeTab === item.value}
              onClick={() => handleTabChange(item.value)}
            />
          ))}
           <CollapsibleContent asChild className="w-full">
             <div className="flex flex-wrap items-center justify-center w-full h-auto gap-2">
                {menuOrder.hidden.map((item) => (
                    <MenuTriggerItem
                    key={item.value}
                    item={item}
                    isActive={activeTab === item.value}
                    onClick={() => handleTabChange(item.value)}
                    />
                ))}
             </div>
           </CollapsibleContent>
        </TabsList>

        {menuOrder.hidden.length > 0 && (
            <div className="relative flex items-center justify-center mt-2">
                <Separator className="w-full" />
                <CollapsibleTrigger asChild>
                    <Button variant="secondary" className="absolute px-4 h-8 group">
                        <span className="group-data-[state=closed]:block group-data-[state=open]:hidden">Show More</span>
                        <span className="group-data-[state=open]:block group-data-[state=closed]:hidden">Show Less</span>
                        <ChevronDown className="h-4 w-4 ml-2 transition-transform group-data-[state=open]:rotate-180" />
                    </Button>
                </CollapsibleTrigger>
            </div>
        )}
    </Collapsible>
  );
}
