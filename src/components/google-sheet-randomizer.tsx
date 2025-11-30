// src/components/google-sheet-randomizer.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  getSheetNamesAction,
  randomizeSheetRowsAction,
} from "@/app/actions/google-sheet-randomizer-action";
import { Sheet, Wand2, FileSearch, Link2, Copy, Check } from "lucide-react";
import { useRateLimiter } from "@/hooks/use-rate-limiter";

type InputMode = "picker" | "link";

export default function GoogleSheetRandomizer() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // State for inputs
  const [inputMode, setInputMode] = useState<InputMode>("picker");
  const [publicUrl, setPublicUrl] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [spreadsheetName, setSpreadsheetName] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState("3");

  // State for results and UI
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[][] | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPickerLoaded, setIsPickerLoaded] = useState(false);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5000); // Longer timeout for API calls

  // Google Picker state
  const DEVELOPER_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID!;
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

  // Effect to load the Google Picker API script
  useEffect(() => {
    if (typeof window !== "undefined" && !isPickerLoaded) {
      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.onload = () => {
        window.gapi.load("picker", () => setIsPickerLoaded(true));
      };
      document.body.appendChild(gapiScript);
    }
  }, [isPickerLoaded]);

  // Function to extract spreadsheet ID from URL
  const getSpreadsheetIdFromUrl = (url: string): string | null => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // --- Handlers for fetching sheet names ---
  const handleUrlSubmit = async () => {
    setError(null);
    const id = getSpreadsheetIdFromUrl(publicUrl);
    if (!id) {
      setError("Invalid Google Sheet URL format.");
      return;
    }
    setSpreadsheetId(id);
    setSpreadsheetName("Public Sheet");
    fetchSheetNames(id);
  };

  const pickerCallback = useCallback(
    (data: any) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const file = data.docs[0];
        setSpreadsheetId(file.id);
        setSpreadsheetName(file.name);
        fetchSheetNames(file.id, user?.stsTokenManager.accessToken);
      }
    },
    [user?.stsTokenManager.accessToken]
  );

  const openPicker = () => {
    if (!user || !isPickerLoaded) {
      toast({
        title: "Please Login",
        description:
          "You must be logged in to select files from your Google Drive.",
        variant: "destructive",
      });
      return;
    }

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(user.stsTokenManager.accessToken)
      .setDeveloperKey(DEVELOPER_KEY)
      .setAppId(APP_ID)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  };

  const fetchSheetNames = async (id: string, token?: string) => {
    setIsLoadingSheets(true);
    setError(null);
    setSheetNames([]);
    setSelectedSheet(null);
    setResults(null);
    try {
      const names = await getSheetNamesAction({
        spreadsheetId: id,
        accessToken: token,
      });
      if (names.length > 0) {
        setSheetNames(names);
        setSelectedSheet(names[0]); // Default to the first sheet
      } else {
        setError("No sheets found in this spreadsheet.");
      }
    } catch (e: any) {
      setError(
        "Could not fetch sheet names. Make sure the sheet is public or you have given permission."
      );
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // --- Handler for Randomization ---
  const handleRandomize = async () => {
    if (!spreadsheetId || !selectedSheet || isRandomizing || isRateLimited)
      return;
    triggerRateLimit();
    setIsRandomizing(true);
    setError(null);
    setResults(null);
    setIsCopied(false);

    try {
      const response = await randomizeSheetRowsAction({
        spreadsheetId,
        sheetName: selectedSheet,
        count: parseInt(rowCount, 10),
        accessToken:
          inputMode === "picker" ? user?.stsTokenManager.accessToken : undefined,
      });
      setResults(response);
    } catch (e: any) {
      setError(
        e.message || "An error occurred while randomizing rows."
      );
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleCopy = () => {
    if (!results) return;
    const textToCopy = results.map((row) => row.join("\t")).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({ title: "Copied!", description: "Random rows copied to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Google Sheet Row Randomizer</CardTitle>
        <CardDescription>
          Pick random rows from a public or your own Google Sheet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          defaultValue="picker"
          value={inputMode}
          onValueChange={(v) => setInputMode(v as InputMode)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="picker" id="picker" disabled={authLoading || !user} />
            <Label htmlFor="picker">Select from Google Drive (Login required)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="link" id="link" />
            <Label htmlFor="link">Use Public Link</Label>
          </div>
        </RadioGroup>

        {inputMode === "link" ? (
          <div className="flex w-full items-end gap-2">
            <div className="grid flex-grow items-center gap-1.5">
              <Label htmlFor="sheet-url">Public Google Sheet URL</Label>
              <Input
                id="sheet-url"
                value={publicUrl}
                onChange={(e) => setPublicUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                disabled={isLoadingSheets}
              />
            </div>
            <Button onClick={handleUrlSubmit} disabled={isLoadingSheets}>
              <Link2 className="mr-2" /> Load
            </Button>
          </div>
        ) : (
          <Button
            onClick={openPicker}
            disabled={!user || authLoading || !isPickerLoaded || isLoadingSheets}
            className="w-full"
          >
            <FileSearch className="mr-2" /> Choose a File from Google Drive
          </Button>
        )}

        {spreadsheetId && (
          <Card className="bg-muted/50 p-4">
            <p className="text-sm font-semibold">
              Selected Sheet:{" "}
              <span className="font-normal text-primary">{spreadsheetName}</span>
            </p>
          </Card>
        )}

        {isLoadingSheets && <Skeleton className="h-10 w-full" />}
        {sheetNames.length > 0 && !isLoadingSheets && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="sheet-select">Select a Sheet (Tab)</Label>
              <Select
                value={selectedSheet ?? ""}
                onValueChange={setSelectedSheet}
              >
                <SelectTrigger id="sheet-select">
                  <SelectValue placeholder="Select a sheet" />
                </SelectTrigger>
                <SelectContent>
                  {sheetNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="row-count">Number of Rows to Pick</Label>
              <Input
                id="row-count"
                type="number"
                min="1"
                value={rowCount}
                onChange={(e) => setRowCount(e.target.value)}
              />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="relative">
            <h3 className="text-lg font-semibold mb-2">Randomly Selected Rows</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {results[0].map((header, index) => (
                    <TableHead key={index}>Column {index + 1}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="absolute -top-4 right-0">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
            </div>
          </div>
        )}

        {isRandomizing && (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={
            !spreadsheetId || !selectedSheet || isRandomizing || isRateLimited
          }
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2" />
          {isRandomizing ? "Randomizing..." : "Randomize Rows"}
        </Button>
      </CardFooter>
    </Card>
  );
}
