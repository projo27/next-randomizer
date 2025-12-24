import { Header } from "@/components/header";
import { PublicPresetList } from "@/components/public-preset-list";
import { getAllPublicPresets } from "@/services/supabase-preset-service";
import { ToolPreset } from "@/types/presets";

const PRESETS_PER_PAGE = 15;

export default async function PublicPresetsPage() {
  const initialPresets: ToolPreset[] = await getAllPublicPresets(0);
  
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-4xl mx-auto mt-6">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Public Presets</h1>
            <p className="text-muted-foreground mt-2">Discover and use presets shared by the community.</p>
        </div>
        <PublicPresetList 
          initialPresets={initialPresets} 
          presetsPerPage={PRESETS_PER_PAGE}
        />
      </main>
    </div>
  );
}
