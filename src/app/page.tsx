// src/app/page.tsx

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { HomePageClient } from '@/components/home-page-client';
import { CommentSection } from '@/components/comments/comment-section';
import { ToolReactionSection } from '@/components/tool-reactions/tool-reaction-section';

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
            {/* The children prop is now used for server-rendered content below the client component */}
            <div className="mt-8 space-y-12">
              <ToolReactionSection toolId={activeTab} />
              <CommentSection toolId={activeTab} />
            </div>
          </HomePageClient>
        </Suspense>
      </main>
    </div>
  );
}
