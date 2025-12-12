
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dice5, HelpCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import FirebaseLoginButton from "./firebase-login-button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { SurveyDialog } from "./survey-dialog";
import { triggerList } from "@/lib/menu-data";

// List of available feature tabs (excluding protected/hidden ones for this logic)
const availableTabs = triggerList.filter((item) => !item.hidden).map((item) => item.value);

export function Header() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);

  const handleDiceClick = () => {
    if (isSpinning) return;

    // 1. Start animation
    setIsSpinning(true);

    // 2. Pick a random tab
    const randomTab =
      availableTabs[Math.floor(Math.random() * availableTabs.length)];

    // 3. Navigate after a short delay for the animation to be visible
    setTimeout(() => {
      router.push(`/?tab=${randomTab}`);
    }, 300);

    // 4. Stop animation after it completes
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000); // Corresponds to the animation duration in globals.css
  };

  return (
    <header className="relative mb-8 text-center w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap md:justify-between justify-center items-center gap-2">
        <div className="flex md:flex-1 order-2 md:order-1 justify-end md:justify-start md:ml-8 items-end">
          <FirebaseLoginButton />
        </div>
        <div className="inline-flex md:flex-1 w-full order-1 md:order-2 items-center gap-4 justify-center">
          <button onClick={handleDiceClick} aria-label="Go to a random feature">
            <Dice5
              className={cn(
                "h-12 w-12 text-accent cursor-pointer transition-transform duration-200 hover:scale-110",
                isSpinning && "animate-spin-dice",
              )}
            />
          </button>
          <Link href={"/"}>
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent/60 dark:to-primary">
              Randomizer
            </h1>
          </Link>
        </div>
        <div className="flex md:flex-1 order-3 justify-end md:order-3 md:mr-8 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="ring-1 ring-accent dark:ring-0"
              >
                <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Open helper menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SurveyDialog />
              <DropdownMenuItem asChild>
                <Link href="/tutorial">Tutorial</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
      <p className="text-muted-foreground mt-4 text-center w-full">
        Your fun-filled tool for making choices!
      </p>
    </header>
  );
}
