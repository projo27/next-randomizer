// src/app/page.tsx

import { Suspense } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { ToolNavigation } from '@/components/tool-navigation';
import { triggerList } from '@/lib/menu-data';
import { FeedbackSection } from '@/components/feedback/feedback-section';
import { HomePageClient } from '@/components/home-page-client';

function HomePageFallback() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full mt-4" />
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const activeTab =
    typeof searchParams.tab === 'string' ? searchParams.tab : 'list';

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-6xl mx-auto mt-6">
        <Suspense fallback={<HomePageFallback />}>
          <HomePageClient activeTab={activeTab}>
            <div className="mt-8">
              <FeedbackSection toolId={activeTab} />
            </div>
          </HomePageClient>
        </Suspense>
      </main>
    </div>
  );
}
