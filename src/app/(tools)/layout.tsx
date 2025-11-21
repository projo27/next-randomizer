import { Suspense } from 'react';
import { Header } from '@/components/header';
import { ToolNavigation } from '@/components/tool-navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-6xl mx-auto mt-6">
        <Suspense
          fallback={
            <div className="w-full space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <ToolNavigation />
          {children}
        </Suspense>
      </main>
    </div>
  );
}
