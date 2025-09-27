import { Dice5 } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import FirebaseLoginButton from './firebase-login-button';

export function Header() {
  return (
    <header className="relative mb-8 text-center w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap md:justify-between items-center gap-2">
        <div className="flex md:flex-1 order-2 md:order-1 justify-end md:justify-start md:ml-8 items-end">
          <FirebaseLoginButton />
        </div>
        <div className="inline-flex flex-1 md:flex-1 order-1 md:order-2 items-center gap-4">
          <Dice5 className="h-12 w-12 text-accent" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent/60 dark:to-primary">
            Randomizer
          </h1>
        </div>
        <div className="flex md:flex-1 order-3 justify-end md:order-3 md:mr-8">
          <ThemeToggle />
        </div>
      </div>
      <p className="text-muted-foreground mt-4 text-center w-full">
        Your fun-filled tool for making choices!
      </p>
    </header>
  );
}
