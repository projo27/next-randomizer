import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full max-w-6xl mx-auto mt-10 py-6 px-4 md:px-8 text-center text-muted-foreground">
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-2">
        <div className='flex gap-x-4'>
          <Link href="/about" className="text-sm hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/presets" className="text-sm hover:text-foreground transition-colors">
            Public Presets
          </Link>
          <Link href="/privacy" className="text-sm hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="text-sm ml-auto">
          &copy; {new Date().getFullYear()} <Link href="/" className="hover:underline">Randomizer.fun</Link> All rights reserved.
        </p>
      </div>
    </footer>
  );
}
