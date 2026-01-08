import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HomePageClient } from '@/components/home-page-client';
import { SlidingInfo } from '@/components/sliding-info';
import { Skeleton } from '@/components/ui/skeleton';
import { getSlidingInfoItems } from '@/services/sliding-info-service';
import { Suspense } from 'react';

function HomePageFallback() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full mt-4" />
    </div>
  );
}

export default async function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch sliding info items from Supabase
  const slidingInfoItems = await getSlidingInfoItems();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <SlidingInfo items={slidingInfoItems} />
      <main className="w-full max-w-6xl mx-auto mt-6">
        <Suspense fallback={<HomePageFallback />}>
          {/* HomePageClient will handle the tabs and rendering of children (server content) */}
          <HomePageClient>
            {children}
          </HomePageClient>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
