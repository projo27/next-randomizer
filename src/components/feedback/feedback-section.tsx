// src/components/feedback/feedback-section.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getFeedbackForTool } from "@/services/feedback-service";
import { FeedbackClientWrapper } from "./feedback-client-wrapper";

type FeedbackSectionProps = {
  toolId: string;
};

/**
 * A Server Component to fetch and display feedback.
 * It delegates client-side interactions to FeedbackClientWrapper.
 */
export async function FeedbackSection({ toolId }: FeedbackSectionProps) {
  // Fetch initial feedback data on the server
  const initialFeedback = await getFeedbackForTool(toolId);

  return (
    <Card className="w-full mt-12">
      <CardHeader>
        <CardTitle>Feedback & Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <FeedbackClientWrapper
          toolId={toolId}
          initialFeedback={initialFeedback}
        />
      </CardContent>
    </Card>
  );
}
