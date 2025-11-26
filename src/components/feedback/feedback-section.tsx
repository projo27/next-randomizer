// src/components/feedback/feedback-section.tsx
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
    <div className="w-full max-w-4xl mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-4">Feedback & Comments</h2>
      <FeedbackClientWrapper
        toolId={toolId}
        initialFeedback={initialFeedback}
      />
    </div>
  );
}
