import { cn } from "@/lib/utils";
import { SVGProps } from "react";

export function JokerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 13.5c-2.5 0-5 2-5 5h10c0-3-2.5-5-5-5z" />
      <path d="M12 10.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 3.5 12 3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
      <path d="M12 10.5c-1.93 0-3.5-1.57-3.5-3.5" />
      <path d="M15.5 7A3.5 3.5 0 0 0 12 3.5" />
      <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />
      <path d="M6 16.5c-2-1.5-2-4.5 0-6" />
      <path d="M18 16.5c2-1.5 2-4.5 0-6" />
    </svg>
  );
}
