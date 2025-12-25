import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function ScrollerText({ text, className }: { text: string; className?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [moveDistance, setMoveDistance] = useState(0);

  useEffect(() => {
    const calculateScroll = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth) {
          setMoveDistance(textWidth - containerWidth);
        } else {
          setMoveDistance(0);
        }
      }
    };

    calculateScroll();
    window.addEventListener('resize', calculateScroll);
    return () => window.removeEventListener('resize', calculateScroll);
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden whitespace-nowrap min-w-0", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={textRef}
        className="inline-block transition-transform ease-linear will-change-transform"
        style={{
          transform: isHovered && moveDistance > 0 ? `translateX(-${moveDistance}px)` : 'translateX(0)',
          // Adjust duration based on width for consistent speed (e.g., 20ms per pixel)
          transitionDuration: isHovered && moveDistance > 0 ? `${moveDistance * 20}ms` : '300ms'
        }}
      >
        {text}
      </div>
    </div>
  );
};