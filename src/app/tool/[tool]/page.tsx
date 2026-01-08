import { CommentSection } from '@/components/comments/comment-section';
import { ToolReactionSection } from '@/components/tool-reactions/tool-reaction-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const resolvedParams = await params;
  const activeTab = resolvedParams.tool;

  return (
    <ToolReactionAndCommentSection toolId={activeTab} />
  );
}
