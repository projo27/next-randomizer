"use client";

import React, { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoPlay from "embla-carousel-autoplay";
import Link from "next/link";
import { ArrowRight, Keyboard, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  Keyboard,
  Sparkles,
  BookOpen,
};

const colors = [
  "text-blue-500",
  "text-amber-500",
  "text-green-500",
  "text-rose-500",
  "text-orange-500",
];

// Define prop types
interface SlidingInfoProps {
  items?: {
    id: number;
    text: string;
    href: string;
    icon: string;
  }[];
}

export function SlidingInfo({ items = [] }: SlidingInfoProps) {
  // If no items, return null
  if (!items || items.length === 0) return null;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    AutoPlay({ delay: 4000, stopOnInteraction: true }),
  ]);

  const onSelect = useCallback((emblaApi: any) => {
    // Optional: Add logging or side effects on slide change
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div
        className="overflow-hidden bg-background/80 backdrop-blur-md border rounded-md shadow-sm"
        ref={emblaRef}
      >
        <div className="flex touch-pan-y">
          {items.map((item, index) => {
            // Find icon or fallback to Sparkles if not found
            // Capitalize first letter to match keys just in case, or match exact string
            const iconKey = item.icon as keyof typeof icons;
            const Icon = icons[iconKey] || Sparkles;

            // Cycle through colors
            const colorClass = colors[index % colors.length];

            return (
              <div
                key={item.id}
                className="flex-[0_0_100%] min-w-0 relative py-2 px-4 flex items-center justify-center"
              >
                <Link
                  href={item.href}
                  className="flex items-center justify-center gap-3 group transition-all duration-300 hover:scale-[1.1]"
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-full bg-secondary/50 group-hover:bg-background transition-colors shadow-sm",
                      colorClass
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90 group-hover:text-accent transition-colors text-center">
                    {item.text}
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent " />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
