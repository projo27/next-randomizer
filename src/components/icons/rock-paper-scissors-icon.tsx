import { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function RockPaperScissorsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
      <path d="M9 11.5v-3a1.5 1.5 0 0 1 3 0v3" />
      <path d="M12.5 11.5a1.5 1.5 0 0 1-3 0" />
      <path d="M5 12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1z" />
      <path d="M18 9.5V8a2 2 0 0 0-4 0v2" />
      <path d="M15 9h-1" />
      <path d="M3 14.5a2.5 2.5 0 0 1 5 0V16a2 2 0 0 1-4 0v-1.5" />
    </svg>
  );
}