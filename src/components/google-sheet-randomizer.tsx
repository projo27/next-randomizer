"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Wand2, Copy, Check, FileUp, Link as LinkIcon, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { useAuth } from "@/context/AuthContext";
import { randomizeSheet } from "@/app/actions/google-sheet-actions";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Skeleton } from "./ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";


declare global {
    interface Window {
        google: any;
        gapi: any;
    }
}

export default function GoogleSheetRandomizer() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [numToPick, setNumToPick] = useState("1");
  const [inputMode, setInputMode] = useState<"url" | "picker">("url");
  
  const [results, setResults] = useState<any[][] | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5000);
  const { user } = useAuth();
  
  // States for Google Picker
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load Google Picker and GAPI scripts
   useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => setGapiLoaded(true);
    document.body.appendChild(script);

    const pickerScript = document.createElement('script');
    pickerScript.src = 'https://www.google.com/jsapi';
    pickerScript.onload = () => {
        window.google.load('picker', '1', { 'callback': () => setPickerApiLoaded(true) });
    };
    document.body.appendChild(pickerScript);
  }, []);

  // Get Access Token when user is available
  useEffect(() => {
    if (user && gapiLoaded) {
      window.gapi.load('auth2', () => {
        const auth2 = window.gapi.auth2.init({
          // This client ID should be for a Web Application from your Google Cloud Console
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file',
        });

        auth2.then(() => {
            const googleUser = auth2.currentUser.get();
            if (googleUser.hasGrantedScopes('https://www.googleapis.com/auth/drive.file')) {
                const token = googleUser.getAuthResponse().access_token;
                setAccessToken(token);
            }
        });
      });
    }
  }, [user, gapiLoaded]);


  const handleRandomize = async () => {
    if (isRandomizing || isRateLimited) return;
    triggerRateLimit();
    setError(null);
    setResults(null);
    setIsCopied(false);

    if (!sheetUrl) {
      setError("Please provide a Google Sheet URL or select a file.");
      return;
    }

    setIsRandomizing(true);
    try {
      const response = await randomizeSheet({
        sheetUrl,
        sheetName,
        numberOfRows: parseInt(numToPick, 10),
        accessToken: inputMode === "picker" ? accessToken ?? undefined : undefined,
      });
      setResults(response);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsRandomizing(false);
    }
  };
  
  const createPicker = () => {
    if (!pickerApiLoaded || !accessToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Google Picker is not ready or you are not logged in.",
      });
      return;
    }

    const view = new window.google.picker.View(window.google.picker.ViewId.SPREADSHEETS);
    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setAppId(process.env.NEXT_PUBLIC_FIREBASE_APP_ID!)
      .setOAuthToken(accessToken)
      .addView(view)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
      .setCallback((data: any) => {
        if (data[window.google.picker.Action.PICKED]) {
          const doc = data[window.google.picker.Action.PICKED][0];
          setSheetUrl(doc.url);
          setSheetName(doc.name);
          toast({ title: "File Selected", description: doc.name });
        }
      })
      .build();
    picker.setVisible(true);
  };


  const handleCopyResult = () => {
    if (!results) return;
    const resultString = results.map((row) => row.join("\t")).join("\n");
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Random rows copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const embedUrl = useMemo(() => {
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) return null;
    const sheetId = sheetIdMatch[1];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&widget=true&headers=false&rm=minimal`;
  }, [sheetUrl]);

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Google Sheet Randomizer</CardTitle>
        <CardDescription>
          Randomly pick rows from a Google Sheet. Use a public URL or select a file from your Google Drive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={inputMode} onValueChange={(val) => setInputMode(val as "url" | "picker")} className="flex gap-4">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url-mode" />
                <Label htmlFor="url-mode">Public URL</Label>
            </div>
             <div className="flex items-center space-x-2">
                <RadioGroupItem value="picker" id="picker-mode" disabled={!user}/>
                <Label htmlFor="picker-mode">Google Drive</Label>
                 {!user && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>You must be logged in to use the Google Drive picker.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </RadioGroup>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            {inputMode === 'url' ? (
                 <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="sheet-url">Google Sheet URL</Label>
                    <Input id="sheet-url" placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
                </div>
            ) : (
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="sheet-picker">Select from Google Drive</Label>
                    <Button id="sheet-picker" variant="outline" onClick={createPicker} disabled={!user || !gapiLoaded || !pickerApiLoaded || !accessToken}>
                        <FileUp className="mr-2 h-4 w-4"/>
                        {sheetName ? `Selected: ${sheetName}` : "Choose a Spreadsheet"}
                    </Button>
                </div>
            )}
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="sheet-name">Sheet Name</Label>
                <Input id="sheet-name" placeholder="e.g., Sheet1" value={sheetName} onChange={(e) => setSheetName(e.target.value)} />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="num-to-pick">Number of Rows to Pick</Label>
                <Input id="num-to-pick" type="number" min="1" value={numToPick} onChange={(e) => setNumToPick(e.target.value)} />
            </div>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {embedUrl && (
            <div className="w-full aspect-video rounded-lg overflow-hidden border">
                <iframe src={embedUrl} className="w-full h-full"></iframe>
            </div>
        )}

        {isRandomizing && <Skeleton className="h-40 w-full" />}
        {results && (
            <Card className="mt-4 border-accent">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Randomly Picked Rows</CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleCopyResult}>
                        {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                             <TableRow>
                                {results[0].map((_, colIndex) => (
                                    <TableHead key={colIndex}>Column {colIndex + 1}</TableHead>
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
                </CardContent>
            </Card>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleRandomize} disabled={isRandomizing || isRateLimited} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing ? "Randomizing..." : isRateLimited ? "Please wait..." : "Randomize Rows"}
        </Button>
      </CardFooter>
    </Card>
  );
}
