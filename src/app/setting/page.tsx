"use client";

import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { LockKeyhole, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SettingsPageContent() {
  const { animationDuration, setAnimationDuration } = useSettings();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center mt-2 justify-center p-8 bg-primary dark:bg-secondary border border-red-200 rounded-lg text-center max-w-2xl mx-auto">
        <LockKeyhole className="h-12 w-12 text-red-70 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
        <p className="text-lg text-current">
          You must be logged in to view and change settings.
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Customize your experience across the application.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-8 py-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="animation-duration" className="text-base">
              Animation Duration
            </Label>
            <span className="font-mono text-xl text-primary">
              {animationDuration}s
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Controls the duration of various animations, like the lottery
            spinner.
          </p>
          <Slider
            id="animation-duration"
            min={1}
            max={10}
            step={1}
            value={[animationDuration]}
            onValueChange={(value) => setAnimationDuration(value[0])}
            className="[&&&]:pt-4"
          />
        </div>
      </CardContent>
      <Separator />
      <CardFooter>
        <div className="flex justify-between items-end mt-4 w-full">
          <Button variant={"secondary"}>
            <Link href="/">&#8592; Home</Link>
          </Button>
          <Button variant={"default"} className="bg-accent">
            <Save />
            Save
          </Button>
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
