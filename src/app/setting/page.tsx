
"use client";

import { Header } from "@/components/header";
import { MenuOrderSettings } from "@/components/settings/menu-order-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useMenuOrder } from "@/context/MenuOrderContext";
import { useSettings } from "@/context/SettingsContext";
import { LockKeyhole, RotateCcw } from "lucide-react";
import Link from "next/link";

// --- Main Settings Page Content ---
function SettingsPageContent() {
  const {
    animationDuration,
    setAnimationDuration,
    playSounds,
    setPlaySounds,
    visibleToolCount,
    setVisibleToolCount,
    confettiConfig,
    setConfettiConfig,
    loading: settingsLoading,
  } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const { menuOrder, resetMenuOrder } = useMenuOrder();

  const isLoading = authLoading || settingsLoading;

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-8 py-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center mt-2 justify-center p-8 bg-primary dark:bg-secondary border border-red-200 rounded-lg text-center max-w-4xl mx-auto">
        <LockKeyhole className="h-12 w-12 text-red-70 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
        <p className="text-lg text-current">
          You must be logged in to view and change settings.
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Customize your experience across the application. Changes are saved
          automatically.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-8 py-6">
        <div className="flex flex-col space-y-2" id="animation-duration">
          <div className="flex justify-between items-center">
            <Label htmlFor="animation-duration" className="text-base">
              Animation Duration
            </Label>
            <span className="font-mono font-bold text-2xl dark:text-primary">
              {animationDuration}s
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Controls the duration of various animations, like dice rolls and
            spinners.
          </p>
          <Slider
            id="animation-duration"
            min={1}
            max={10}
            step={1}
            value={[animationDuration]}
            onValueChange={(value) => setAnimationDuration(value[0])}
            className="[&&&]:mt-4"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between" id="play-sounds">
          <div className="space-y-1">
            <Label htmlFor="play-sounds" className="text-base">
              Play Sounds
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable sounds during randomization actions.
            </p>
          </div>
          <Switch
            id="play-sounds"
            checked={playSounds}
            onCheckedChange={setPlaySounds}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between" id="confetti-enabled">
          <div className="space-y-1">
            <Label htmlFor="confetti-enabled" className="text-base">
              Confetti Effects
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable confetti animation when a result is picked.
            </p>
          </div>
          <Switch
            id="confetti-enabled"
            checked={confettiConfig.enabled}
            onCheckedChange={(checked) =>
              setConfettiConfig({ ...confettiConfig, enabled: checked })
            }
          />
        </div>

        {confettiConfig.enabled && (
          <div className="space-y-6 pt-4 border-t ml-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="particle-count" className="text-base">
                  Particle Count
                </Label>
                <span className="font-mono font-bold text-2xl dark:text-primary">
                  {confettiConfig.particleCount}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Number of confetti particles to throw.
              </p>
              <Slider
                id="particle-count"
                min={20}
                max={500}
                step={10}
                value={[confettiConfig.particleCount]}
                onValueChange={(value) =>
                  setConfettiConfig({ ...confettiConfig, particleCount: value[0] })
                }
                className="[&&&]:mt-4"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="confetti-spread" className="text-base">
                  Spread
                </Label>
                <span className="font-mono font-bold text-2xl dark:text-primary">
                  {confettiConfig.spread}°
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                How wide the confetti spreads.
              </p>
              <Slider
                id="confetti-spread"
                min={20}
                max={180}
                step={5}
                value={[confettiConfig.spread]}
                onValueChange={(value) =>
                  setConfettiConfig({ ...confettiConfig, spread: value[0] })
                }
                className="[&&&]:mt-4"
              />
            </div>
          </div>
        )}

        <Separator />

        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="visible-tool-count" className="text-base">
              Visible Tool Count
            </Label>
            <span className="font-mono font-bold text-2xl dark:text-primary">
              {visibleToolCount}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            The number of tools to show before the "Show More" button.
          </p>
          <Slider
            id="visible-tool-count"
            min={1}
            max={menuOrder.visible.length + menuOrder.hidden.length}
            step={1}
            value={[visibleToolCount]}
            onValueChange={(value) => setVisibleToolCount(value[0])}
            className="[&&&]:mt-4"
          />
        </div>

        {/* <Separator /> */}

        <div className="space-y-4" id="tools-order">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-base">Tools Order</Label>
              <Button variant="ghost" size="sm" onClick={resetMenuOrder}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Drag and drop to reorder the tools. The divider shows where the
              "Show More" button will appear.
            </p>
          </div>
          <MenuOrderSettings />
        </div>
      </CardContent>
      <Separator />
      <CardFooter>
        <div className="flex justify-between items-end mt-4 w-full">
          <Link href="/">&#8592; Home</Link>
          <p className="text-sm text-muted-foreground italic">
            Settings are saved automatically.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full mt-6">
        <SettingsPageContent />
      </main>
    </div>
  );
}
