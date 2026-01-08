// src/components/home-page-client.tsx
'use client';

import { ToolNavigation } from '@/components/tool-navigation';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { triggerList } from '@/lib/menu-data';
import { useEffect } from 'react';
import { LazyTabContent } from './ui/lazy-tab-content';
import TabContentGuard from './ui/tab-content-guard';

import { usePathname } from 'next/navigation';

interface HomePageClientProps {
  children: React.ReactNode; // This will receive the server components
}

export function HomePageClient({ children }: HomePageClientProps) {
  const pathname = usePathname();
  // Extract activeTab from pathname /tool/[toolName]
  const activeTab = pathname?.split('/')[2] || 'list';

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
          <LazyTabContent value={item.value} activeTab={activeTab}>
            {item.contentGuard ? (
              <TabContentGuard>{item.content}</TabContentGuard>
            ) : (
              item.content
            )}
          </LazyTabContent>
        </TabsContent>
      ))}

      {/* This is where the FeedbackSection/CommentSection Server Component will be rendered */}
      {children}
    </Tabs>
  );
}
