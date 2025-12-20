
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { TabsList } from "@/components/ui/tabs";
import { useMenuOrder } from "@/context/MenuOrderContext";
import { MenuTriggerItem } from "./menu-trigger-item";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";
import Link from "next/link";
import { ChevronDown, LucideListOrdered, LoaderCircle, Search, X } from "lucide-react";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function ToolNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "list";

  const { menuOrder, loading } = useMenuOrder();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setIsSearchFocused(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        // Only unfocus if the search query is empty
        if (!searchQuery && isSearchFocused) {
          setIsClosing(true);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery, isSearchFocused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcut: Ctrl + /
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setIsSearchFocused(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }

      // Tool navigation: Alt + 1-9
      if (e.altKey && !e.ctrlKey && !e.shiftKey && e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        if (index < menuOrder.visible.length) {
          e.preventDefault();
          const item = menuOrder.visible[index];
          const params = new URLSearchParams(searchParams.toString());
          params.set("tab", item.value);
          router.push(pathname + "?" + params.toString());
        }
      }

      // Randomizer trigger: Ctrl + Enter
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        // Since we forceMount tabs, multiple buttons with id="randomize-button" might exist.
        // We find the one that is currently visible.
        const allButtons = document.querySelectorAll("button#randomize-button");

        // Find the button that is visible (offsetParent is not null)
        const visibleButton = Array.from(allButtons).find(
          (btn) => (btn as HTMLElement).offsetParent !== null
        ) as HTMLButtonElement | undefined;

        if (visibleButton && !visibleButton.disabled) {
          visibleButton.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOrder.visible, pathname, router, searchParams]);

  /* const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(pathname + "?" + params.toString());
    },
    [pathname, router, searchParams],
  ); */

  const getTabHref = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    return pathname + "?" + params.toString();
  };

  const handleSearchIconClick = () => {
    setIsSearchFocused(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const lowercasedQuery = searchQuery.toLowerCase();

  const hasSearchResultsInHidden = useMemo(
    () =>
      lowercasedQuery.length > 0 &&
      menuOrder.hidden.some((item) =>
        item.text.toLowerCase().includes(lowercasedQuery),
      ),
    [menuOrder.hidden, lowercasedQuery],
  );

  const showCollapsible = menuOrder.hidden.length > 0 && searchQuery === "";

  return (
    <div className="w-full mb-4">
      <div className="flex justify-end w-full mb-2 gap-2">
        <div
          ref={searchContainerRef}
          className={cn(
            "relative flex items-center transition-all duration-300 ease-in-out overflow-hidden",
            isSearchFocused && !isClosing
              ? "flex-1"
              : "w-10 md:w-1/4 justify-end",
          )}
        >
          {isSearchFocused ? (
            <>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for a tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setIsClosing(true);
                }}
                className="pl-10 text-xs w-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => {
                  setSearchQuery("");
                  setIsClosing(true);
                  searchInputRef.current?.blur();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {/* Icon button for mobile */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleSearchIconClick}
                className="md:hidden"
              >
                <Search className="h-5 w-5 text-muted-foreground" />
              </Button>
              {/* Readonly input for desktop */}
              <div
                className="relative hidden md:flex items-center w-full cursor-text"
                onClick={handleSearchIconClick}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search..."
                  className="pl-10 text-xs w-full"
                  readOnly
                />
              </div>
            </>
          )}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                asChild
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  isSearchFocused && !isClosing
                    ? "w-0 p-0 overflow-hidden opacity-0 border-0"
                    : "w-10 opacity-100",
                )}
              >
                <Link href="/setting#tools-order">
                  <LucideListOrdered className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Tools Order</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>


      </div>
      <Collapsible
        open={isCollapsibleOpen || hasSearchResultsInHidden}
        onOpenChange={setIsCollapsibleOpen}
      >
        <TabsList className="flex flex-wrap items-center justify-center w-full h-auto gap-2 py-2">
          {menuOrder.visible.map((item) => (
            <MenuTriggerItem
              key={item.value}
              item={item}
              isActive={activeTab === item.value}
              href={getTabHref(item.value)}
              isHighlighted={
                lowercasedQuery
                  ? item.text.toLowerCase().includes(lowercasedQuery)
                  : false
              }
            />
          ))}
          <CollapsibleContent className="contents">
            {menuOrder.hidden.map((item) => (
              <MenuTriggerItem
                key={item.value}
                item={item}
                isActive={activeTab === item.value}
                href={getTabHref(item.value)}
                isHighlighted={
                  lowercasedQuery
                    ? item.text.toLowerCase().includes(lowercasedQuery)
                    : false
                }
              />
            ))}
          </CollapsibleContent>
        </TabsList>

        {showCollapsible && (
          <div className="relative flex items-center justify-center mt-1 mb-4">
            <Separator className="flex-1" />
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="h-8 group text-xs">
                {loading && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                <span className="group-data-[state=closed]:block group-data-[state=open]:hidden">
                  Show More Tools
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
