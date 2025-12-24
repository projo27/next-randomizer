"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function PresetSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const currentQ = searchParams.get("q") || "";

    // Only update if value changed
    if (debouncedValue === currentQ && !params.has("page")) return;

    // Logic: 
    // 1. Update 'q'
    if (debouncedValue) {
      params.set("q", debouncedValue);
    } else {
      params.delete("q");
    }

    // 2. If 'q' changed, reset page. 
    // Use debouncedValue vs currentQ to check if search term changed.
    if (debouncedValue !== currentQ) {
      params.set("page", "1");
    }

    // 3. Avoid push if string is identical (to prevent loop)
    if (params.toString() === searchParams.toString()) {
      return;
    }

    router.push(`?${params.toString()}`);
  }, [debouncedValue, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm mb-6">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search presets..."
        className="pl-8"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
