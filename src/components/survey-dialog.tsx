
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  getVotedTools,
  recordUserVote,
} from "@/services/user-preferences";
import {
  getSurveyList,
  incrementSurveyVotes,
  getSurveyResults,
} from "@/services/survey-service";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { LockKeyhole } from "lucide-react";

type SurveyResultData = { name: string; votes: number }[];
const SURVEY_ID = "newToolRequests";

export function SurveyDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [surveyOptions, setSurveyOptions] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [otherTool, setOtherTool] = useState("");
  const [votedTools, setVotedTools] = useState<string[]>([]);
  const [surveyResults, setSurveyResults] = useState<SurveyResultData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [options, results, userVotedTools] = await Promise.all([
        getSurveyList(),
        getSurveyResults(SURVEY_ID),
        user ? getVotedTools(user.uid) : Promise.resolve([]),
      ]);

      setSurveyOptions(options);
      setVotedTools(userVotedTools);

      // Transform results for the chart
      const chartData = Object.entries(results)
        .map(([name, votes]) => ({ name, votes }))
        .sort((a, b) => b.votes - a.votes);
      setSurveyResults(chartData);
    } catch (e) {
      setError("Could not load survey data. Please try again later.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open, fetchInitialData]);

  const handleToggleSelection = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool)
        ? prev.filter((t) => t !== tool)
        : [...prev, tool],
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    const finalSelections = [...selectedTools];
    const normalizedOther = otherTool.trim();

    if (normalizedOther) {
      // Find if "other" matches an existing option, ignoring case
      const existingOption = surveyOptions.find(
        (opt) => opt.toLowerCase() === normalizedOther.toLowerCase(),
      );
      if (existingOption) {
        // If it exists, add the properly cased version to selections if not already there
        if(!finalSelections.includes(existingOption)) {
          finalSelections.push(existingOption);
        }
      } else {
        // If it's a truly new tool, add it
        finalSelections.push(normalizedOther);
      }
    }
    
    const uniqueSelections = [...new Set(finalSelections)];

    if (uniqueSelections.length === 0) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select at least one tool to vote for.",
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Pass the current options to check against for new entries
      await incrementSurveyVotes(SURVEY_ID, uniqueSelections, surveyOptions);
      await recordUserVote(user.uid, uniqueSelections);
      toast({
        title: "Vote Submitted!",
        description: "Thank you for your feedback!",
      });
      // Refetch data to show updated results
      await fetchInitialData();
    } catch (e) {
      setError("Failed to submit your vote. Please try again.");
    } finally {
      setIsSubmitting(false);
      // Reset form state after submission
      setSelectedTools([]);
      setOtherTool("");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="text-center py-8">
          <LockKeyhole className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Login Required</h3>
          <p className="text-muted-foreground">
            Please log in to participate in the survey and see the results.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4 mb-8">
          <h4 className="font-semibold">Which new randomizer tool would you like to see next?</h4>
          <p className="text-sm text-muted-foreground">
            Select all that apply. Your votes help us decide what to build!
          </p>
          {surveyOptions.map((tool) => {
            const hasVoted = votedTools.includes(tool);
            return (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={() => handleToggleSelection(tool)}
                  disabled={hasVoted || isSubmitting}
                />
                <Label
                  htmlFor={tool}
                  className={
                    hasVoted
                      ? "text-muted-foreground italic line-through"
                      : "cursor-pointer"
                  }
                >
                  {tool} {hasVoted && "(Already Voted)"}
                </Label>
              </div>
            );
          })}
          <div className="pt-2">
            <Label htmlFor="other-tool">
              Something else? (Enter your idea)
            </Label>
            <Input
              id="other-tool"
              placeholder="e.g., Random Recipe Generator"
              value={otherTool}
              onChange={(e) => setOtherTool(e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (selectedTools.length === 0 && !otherTool.trim())}
            className="w-full"
          >
            {isSubmitting ? "Submitting Vote..." : "Vote Now"}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4 text-center">Current Results</h4>
          {surveyResults && surveyResults.length > 0 ? (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={surveyResults}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tickLine={false}
                    axisLine={false}
                    tick={{fontSize: 12}}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      background: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="votes" position="right" offset={10} className="fill-foreground" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No survey results yet. Be the first to vote!
            </p>
          )}
        </div>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Request New Tools
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Tool Survey</DialogTitle>
          <DialogDescription>
            We love to help you to create tool for making choices, so Help us decide what features to build next!
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
