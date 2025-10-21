"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { TabsList } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuOrder } from "@/context/MenuOrderContext";
import { MenuTriggerItem } from "./menu-trigger-item";

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
    <TabsList className="flex flex-wrap items-center justify-center w-full h-auto gap-2 py-2">
      {menuOrder.map((item) => (
        <MenuTriggerItem
          key={item.value}
          item={item}
          isActive={activeTab === item.value}
          onClick={() => handleTabChange(item.value)}
        />
      ))}
    </TabsList>
  );
}
