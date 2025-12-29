import { Header } from "@/components/header";
import { PublicPresetList } from "@/components/public-preset-list";
import { PresetSearch } from "@/components/preset-search";
import { PresetPagination } from "@/components/preset-pagination";
import { getAllPublicPresets } from "@/services/supabase-preset-service";

const PRESETS_PER_PAGE = 15;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PublicPresetsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const query = typeof searchParams?.q === 'string' ? searchParams.q : undefined;

  // Adjust for 0-based index used in service
  const pageIndex = Math.max(0, page - 1);

  const { data: presets, count } = await getAllPublicPresets(pageIndex, undefined, query);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-4xl mx-auto mt-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Public Presets</h1>
          <p className="text-muted-foreground mt-2">Discover and use presets shared by the community.</p>
        </div>

        <div className="flex flex-col">
          <PresetSearch />

          <PublicPresetList
            presets={presets}
          />

          <PresetPagination
            totalCount={count}
            pageSize={PRESETS_PER_PAGE}
          />
        </div>
      </main>
    </div>
  );
}
