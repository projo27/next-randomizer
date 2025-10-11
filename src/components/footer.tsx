import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full mt-auto py-6 px-4 md:px-8 text-center text-muted-foreground">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Randomizer.fun. All rights reserved.
        </p>
        <Link href="/privacy" className="text-sm hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
