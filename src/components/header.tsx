import { Dice5 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="mb-8 text-center w-full max-w-2xl mx-auto flex justify-between items-center">
      <div className="flex-1"></div>
      <div className="inline-flex items-center gap-4">
        <Dice5 className="h-12 w-12 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Randomizer
        </h1>
      </div>
      <div className="flex-1 flex justify-end">
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground mt-2 absolute top-24">
        Your fun-filled tool for making choices!
      </p>
    </header>
  );
}
