"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedResultListProps {
    isShuffling: boolean;
    shuffledItems: string[];
    isResultCopied: boolean;
    handleCopyResult: () => void;
    title: string;
    itemClassName?: string;
}

export default function AnimatedResultList({ 
    isShuffling, 
    shuffledItems,
    isResultCopied,
    handleCopyResult,
    title,
    itemClassName
}: AnimatedResultListProps) {
    
    const listItems = isShuffling 
        ? (shuffledItems.length > 0 ? shuffledItems : Array(3).fill(''))
        : shuffledItems;

    return (
         <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{title}</CardTitle>
              {!isShuffling && (
                 <Button variant="ghost" size="icon" onClick={handleCopyResult}>
                 {isResultCopied ? (
                   <Check className="h-5 w-5 text-green-500" />
                 ) : (
                   <Copy className="h-5 w-5" />
                 )}
               </Button>
              )}
            </CardHeader>
            <CardContent>
              {isShuffling ? (
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded-md animate-pulse" />
                  <div className="h-6 bg-muted rounded-md animate-pulse w-5/6" />
                  <div className="h-6 bg-muted rounded-md animate-pulse w-3/4" />
                </div>
              ) : (
                <ol className="list-decimal list-inside space-y-2">
                  {shuffledItems.map((item, index) => (
                    <li key={index} className={cn("text-base", itemClassName)}>
                      {item}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
    )
}