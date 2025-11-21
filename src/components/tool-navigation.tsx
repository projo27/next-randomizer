
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useMemo } from "react";
import { TabsList } from "@/components/ui/tabs";
import { useMenuOrder } from "@/context/MenuOrderContext";
import { MenuTriggerItem } from "./menu-trigger-item";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";

export function ToolNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "list";

  const { menuOrder, loading } = useMenuOrder();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(pathname + "?" + params.toString());
    },
    [pathname, router, searchParams],
  );

  const lowercasedQuery = searchQuery.toLowerCase();
  
  const hasSearchResultsInHidden = useMemo(
    () =>
      lowercasedQuery.length > 0 &&
      menuOrder.hidden.some((item) =>
        item.text.toLowerCase().includes(lowercasedQuery)
      ),
    [menuOrder.hidden, lowercasedQuery]
  );
  
  const showCollapsible = menuOrder.hidden.length > 0 && searchQuery === "";

  return (
    <div className="w-full mb-4">
      <div className="relative mb-2 max-w-sm mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a tool..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Collapsible open={isCollapsibleOpen || hasSearchResultsInHidden} onOpenChange={setIsCollapsibleOpen}>
        <TabsList className="flex flex-wrap items-center justify-center w-full h-auto gap-2 py-2">
          {menuOrder.visible.map((item) => (
            <MenuTriggerItem
              key={item.value}
              item={item}
              isActive={activeTab === item.value}
              onClick={() => handleTabChange(item.value)}
              isHighlighted={lowercasedQuery ? item.text.toLowerCase().includes(lowercasedQuery) : false}
            />
          ))}
          <CollapsibleContent className="contents">
            {menuOrder.hidden.map((item) => (
              <MenuTriggerItem
                key={item.value}
                item={item}
                isActive={activeTab === item.value}
                onClick={() => handleTabChange(item.value)}
                isHighlighted={lowercasedQuery ? item.text.toLowerCase().includes(lowercasedQuery) : false}
              />
            ))}
          </CollapsibleContent>
        </TabsList>

        {showCollapsible && (
          <div className="relative flex items-center justify-center mt-1 mb-4">
            <Separator className="flex-1" />
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="h-8 group text-xs">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <span className="group-data-[state=closed]:block group-data-[state=open]:hidden">
                  Show More
                </span>
                <span className="group-data-[state=open]:block group-data-[state=closed]:hidden">
                  Show Less
                </span>
                {!loading && (
                  <ChevronDown className="h-4 w-4 ml-2 transition-transform group-data-[state=open]:rotate-180" />
                )}
              </Button>
            </CollapsibleTrigger>
            <Separator className="flex-1" />
          </div>
        )}
      </Collapsible>
    </div>
  );
}