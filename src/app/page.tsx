"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import TabContentGuard from "@/components/ui/tab-content-guard";
import { ToolNavigation } from "@/components/tool-navigation";
import { triggerList } from "@/lib/menu-data";
import { FeedbackSection } from "@/components/feedback/feedback-section";

function HomePageContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "list";

  useEffect(() => {
    const currentTool = triggerList.find((item) => item.value === activeTab);
    if (currentTool) {
      document.title = `Randomizer Fun - ${currentTool.text} Randomizer`;
    } else {
      document.title =
        "Randomizer Fun - Your fun-filled tool for making choices!";
    }
  }, [activeTab]);

  return (
    <Tabs value={activeTab} className="w-full">
      <ToolNavigation />

      {/* Tabs Content */}
      {triggerList.map((item) => (
        <TabsContent key={item.value} value={item.value} forceMount>
          {item.contentGuard ? (
            <TabContentGuard>{item.content}</TabContentGuard>
          ) : (
            item.content
          )}
        </TabsContent>
      ))}

      <div className="mt-8">
        <FeedbackSection toolId={activeTab} />
      </div>
    </Tabs>
  );
}

function HomePageFallback() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-6xl mx-auto mt-6">
        <Suspense fallback={<HomePageFallback />}>
          <HomePageContent />
        </Suspense>
      </main>
    </div>
  );
}
