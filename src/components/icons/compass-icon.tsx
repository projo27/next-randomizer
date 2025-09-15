import { cn } from "@/lib/utils";
import { SVGProps } from "react";

export function CompassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
    >
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M50 2 L50 98" stroke="currentColor" strokeWidth="1" />
      <path d="M2 50 L98 50" stroke="currentColor" strokeWidth="1" />
      <path d="M15.9 15.9 L84.1 84.1" stroke="currentColor" strokeWidth="1" />
      <path d="M15.9 84.1 L84.1 15.9" stroke="currentColor" strokeWidth="1" />
      
      <polygon points="50,10 55,20 50,18 45,20" fill="hsl(var(--primary))" />
      <polygon points="50,90 55,80 50,82 45,80" fill="currentColor" />
      
      <text x="50" y="12" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">N</text>
      <text x="50" y="92" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">S</text>
      <text x="10" y="52" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">W</text>
      <text x="90" y="52" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">E</text>
    </svg>
  );
}
