// src/app/page.tsx

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { HomePageClient } from '@/components/home-page-client';
import { CommentSection } from '@/components/comments/comment-section';
import { ToolReactionSection } from '@/components/tool-reactions/tool-reaction-section';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function HomePageFallback() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full mt-4" />
    </div>
  );
}

function ToolReactionAndCommentSection({ toolId }: { toolId: string }) {
  return (
    <Card className="mt-8 border-none">
      <CardHeader>
        <CardTitle>Tool Reaction and Comment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 space-y-2">
        <ToolReactionSection toolId={toolId} />
        <Separator />
        <CommentSection toolId={toolId} />
      </CardContent>
    </Card>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTab =
    typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : 'list';

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-6xl mx-auto mt-6">
        <Suspense fallback={<HomePageFallback />}>
          <HomePageClient activeTab={activeTab}>
            {/* The children prop is now used for server-rendered content below the client component */}
            <ToolReactionAndCommentSection toolId={activeTab} />
          </HomePageClient>
        </Suspense>
      </main>
    </div>
  );
}
