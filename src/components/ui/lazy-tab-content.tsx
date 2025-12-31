'use client';

import { useState, useEffect } from 'react';

interface LazyTabContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
}

export function LazyTabContent({ value, activeTab, children }: LazyTabContentProps) {
  const [hasBeenActive, setHasBeenActive] = useState(false);

  useEffect(() => {
    if (value === activeTab) {
      setHasBeenActive(true);
    }
  }, [value, activeTab]);

  if (!hasBeenActive && value !== activeTab) {
    return null;
  }

  return <>{children}</>;
}
