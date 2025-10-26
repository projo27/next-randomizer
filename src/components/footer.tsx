import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full mt-auto py-6 px-4 md:px-8 text-center text-muted-foreground">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-2">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Randomizer.fun. All rights reserved.
        </p>
        <div className='flex gap-x-4'>
            <Link href="/about" className="text-sm hover:text-foreground transition-colors">
            About
            </Link>
            <Link href="/privacy" className="text-sm hover:text-foreground transition-colors">
            Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm hover:text-foreground transition-colors">
            Terms of Service
            </Link>
        </div>
      </div>
    </footer>
  );
}
