import { Dice5 } from "lucide-react";

export function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="inline-flex items-center gap-4">
        <Dice5 className="h-12 w-12 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Randomizer
        </h1>
      </div>
      <p className="text-muted-foreground mt-2">
        Your fun-filled tool for making choices!
      </p>
    </header>
  );
}
