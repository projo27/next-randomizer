// src/components/comments/comment-section.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getCommentsForTool } from "@/services/comment-service";
import { CommentClientWrapper } from "./comment-client-wrapper";

type CommentSectionProps = {
  toolId: string;
};

/**
 * A Server Component to fetch and display comments.
 * It delegates client-side interactions to CommentClientWrapper.
 */
export async function CommentSection({ toolId }: CommentSectionProps) {
  // Fetch initial comments data on the server
  const initialComments = await getCommentsForTool(toolId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comments & Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        <CommentClientWrapper
          toolId={toolId}
          initialComments={initialComments}
        />
      </CardContent>
    </Card>
  );
}
