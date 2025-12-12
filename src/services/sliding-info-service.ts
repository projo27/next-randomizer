import { supabase } from "@/lib/supabase-client";

export interface SlidingInfoItem {
  id: number;
  text: string;
  href: string;
  icon: string;
  is_visible: boolean;
  created_at: string;
}

export async function getSlidingInfoItems(): Promise<SlidingInfoItem[]> {
  const { data, error } = await supabase
    .from("sliding_info")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sliding info items:", error);
    return [];
  }

  return data as SlidingInfoItem[];
}
