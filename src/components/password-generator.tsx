"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { generateReadablePassword } from "@/lib/password-generator";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { PresetManager } from "./preset-manager";
import type { PasswordPresetParams } from "@/types/presets";

export default function PasswordGenerator() {
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [password, setPassword] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(10000);

  const getCurrentParams = (): PasswordPresetParams => ({
    length,
    includeNumbers,
    includeSymbols,
    includeUppercase,
  });

  const handleLoadPreset = (params: any) => {
    const p = params as PasswordPresetParams;
    setLength(p.length);
    setIncludeNumbers(p.includeNumbers);
    setIncludeSymbols(p.includeSymbols);
    setIncludeUppercase(p.includeUppercase);
    // toast({ title: "Preset Loaded", description: "Your settings have been restored." });
  };


  const handleGenerate = useCallback(() => {
    // triggerRateLimit();
    const newPassword = generateReadablePassword(
      length,
      includeNumbers,
      includeSymbols,
      includeUppercase
    );
    setPassword(newPassword);
    setIsCopied(false);
  }, [length, includeNumbers, includeSymbols, includeUppercase]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>Create a strong and readable password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PresetManager
          toolId="password"
          currentParams={getCurrentParams()}
          onLoadPreset={handleLoadPreset}
        />
        <div className="relative">
          <Input
            readOnly
            value={password}
            className="pr-20 pl-6 sm:text-sm md:text-base lg:text-2xl font-mono tracking-wider h-20"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {isCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleGenerate} disabled={isRateLimited}>
              <RefreshCw className={`h-5 w-5 ${isRateLimited ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Length: {length}</Label>
          </div>
          <Slider
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            min={8}
            max={32}
            step={1}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="uppercase"
            checked={includeUppercase}
            onCheckedChange={setIncludeUppercase}
          />
          <Label htmlFor="uppercase">Include Uppercase</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="numbers"
            checked={includeNumbers}
            onCheckedChange={setIncludeNumbers}
          />
          <Label htmlFor="numbers">Include Numbers</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="symbols"
            checked={includeSymbols}
            onCheckedChange={setIncludeSymbols}
          />
          <Label htmlFor="symbols">Include Symbols</Label>
        </div>
      </CardContent>
    </Card>
  );
}
