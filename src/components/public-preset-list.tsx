import { ToolPreset } from "@/types/presets";
import { PresetCard } from "./preset-card";

interface PublicPresetListProps {
  presets: ToolPreset[];
}

export function PublicPresetList({ presets }: PublicPresetListProps) {
  if (presets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
        <p>No presets found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {presets.map((preset) => (
        <PresetCard key={preset.id} preset={preset} />
      ))}
    </div>
  );
}

