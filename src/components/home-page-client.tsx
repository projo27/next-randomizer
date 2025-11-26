// src/components/home-page-client.tsx
'use client';

import { useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ToolNavigation } from '@/components/tool-navigation';
import { triggerList } from '@/lib/menu-data';
import TabContentGuard from './ui/tab-content-guard';

interface HomePageClientProps {
  activeTab: string;
  children: React.ReactNode; // This will receive the server components
}

export function HomePageClient({ activeTab, children }: HomePageClientProps) {
  useEffect(() => {
    const currentTool = triggerList.find(item => item.value === activeTab);
    if (currentTool) {
      document.title = `Randomizer Fun - ${currentTool.text} Randomizer`;
    } else {
      document.title =
        'Randomizer Fun - Your fun-filled tool for making choices!';
    }
  }, [activeTab]);

  return (
    <Tabs value={activeTab} className="w-full">
      <ToolNavigation />

      {/* Tabs Content for tools */}
      {triggerList.map(item => (
        <TabsContent key={item.value} value={item.value} forceMount>
          {item.contentGuard ? (
            <TabContentGuard>{item.content}</TabContentGuard>
          ) : (
            item.content
          )}
        </TabsContent>
      ))}

      {/* This is where the FeedbackSection/CommentSection Server Component will be rendered */}
      {children}
    </Tabs>
  );
}
