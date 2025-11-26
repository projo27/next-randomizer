// src/components/tool-reactions/tool-reaction-section.tsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getReactionsForTool } from "@/services/tool-reaction-service";
import { ReactionClientWrapper } from "./reaction-client-wrapper";

type ToolReactionSectionProps = {
  toolId: string;
};

/**
 * A Server Component to fetch and display reactions for a tool.
 */
export async function ToolReactionSection({ toolId }: ToolReactionSectionProps) {
  const initialReactions = await getReactionsForTool(toolId);

  return (
    <div className="w-full space-y-2">
      <p className="text-muted-foreground ml-2">How do you feel about this tool? Let us know with a reaction!</p>
      <ReactionClientWrapper
        toolId={toolId}
        initialReactions={initialReactions}
      />
    </div>
  );
}
