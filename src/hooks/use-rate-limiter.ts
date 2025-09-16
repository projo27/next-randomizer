"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * A custom hook to enforce a client-side rate limit on function calls.
 * @param timeout The cooldown period in milliseconds.
 * @returns A tuple containing a boolean `isRateLimited` and a function `trigger` to start the rate limit.
 */
export function useRateLimiter(timeout: number) {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const trigger = useCallback(() => {
    if (isRateLimited) return;

    setIsRateLimited(true);
    timerRef.current = setTimeout(() => {
      setIsRateLimited(false);
    }, timeout);
  }, [isRateLimited, timeout]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return [isRateLimited, trigger] as const;
}
