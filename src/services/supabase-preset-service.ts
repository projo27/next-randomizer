import { supabase } from "@/lib/supabase-client";
import type { ToolPreset, AnyPresetParams } from "@/types/presets";

const TABLE_NAME = "user_presets";
const REACTIONS_TABLE = "preset_reactions";
const PAGE_SIZE = 15;

export type UserInfo = {
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

/**
 * Saves a new preset or updates an existing one.
 */
export async function savePreset(
  userId: string,
  toolId: string,
  name: string,
  parameters: AnyPresetParams,
  isPublic: boolean,
  userInfo: UserInfo
): Promise<string> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      tool_id: toolId,
      name,
      parameters,
      is_public: isPublic,
      user_email: userInfo.email,
      user_display_name: userInfo.displayName,
      user_avatar_url: userInfo.avatarUrl,
      reaction_counts: {},
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error saving preset:", error);
    throw new Error(error.message);
  }

  return data.id;
}

/**
 * Updates the visibility of a preset.
 */
export async function updatePresetVisibility(
  presetId: string,
  isPublic: boolean
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", presetId);

  if (error) {
    console.error("Error updating preset visibility:", error);
    throw new Error(error.message);
  }
}

/**
 * Retrieves presets for a specific tool for a given user with pagination.
 */
export async function getUserPresets(
  userId: string,
  toolId: string,
  page: number = 0
): Promise<ToolPreset[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*, user_reaction:preset_reactions(reaction)")
    .eq("user_id", userId)
    .eq("tool_id", toolId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching user presets:", error);
    throw new Error(error.message);
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    toolId: item.tool_id,
    parameters: item.parameters,
    createdAt: item.created_at,
    isPublic: item.is_public,
    userId: item.user_id,
    reactionCounts: item.reaction_counts || {},
    userReaction: item.user_reaction?.[0]?.reaction || null,
  }));
}

/**
 * Retrieves public presets for a specific tool with pagination.
 */
export async function getPublicPresets(
  toolId: string,
  page: number = 0,
  currentUserId?: string
): Promise<ToolPreset[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("tool_id", toolId)
    .eq("is_public", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  // If we have a current user, we want to fetch their reaction too
  // However, Supabase joins on foreign keys. user_presets has no FK to preset_reactions for *current user*.
  // preset_reactions has FK to user_presets.
  // We can't easily join "my reaction" in a single query without a complex view or RPC if we want efficient paging on the main table.
  // But we can fetch reactions separately or use the `user_reaction` relation if we filter it.
  // Actually, we can use the reverse relation if defined, but standard Supabase join:
  // .select("*, preset_reactions(reaction)") will get ALL reactions for the preset, which is bad.
  // We need to filter preset_reactions by user_id.
  // Supabase supports filtering on joined tables: .select("*, preset_reactions(reaction)").eq("preset_reactions.user_id", currentUserId)
  // BUT this performs an INNER JOIN behavior usually or filters the parent rows.
  // Correct way: .select("*, my_reaction:preset_reactions(reaction)").eq("my_reaction.user_id", currentUserId)
  // This will return the preset even if no reaction, but `my_reaction` will be empty array or filtered array.
  
  if (currentUserId) {
    // We need to be careful. If we use !inner, it filters presets. We want left join.
    // Supabase JS client handles this.
    // We need to alias the relation to avoid conflict if we were fetching all reactions (which we aren't).
    // Let's try to fetch it.
    // Note: This assumes a foreign key exists from preset_reactions.preset_id to user_presets.id
    // And we need to filter that relation.
    // Syntax: .select("*, my_reaction:preset_reactions(reaction)")
    // And then we might need to apply a filter on that relation, but Supabase JS .eq() applies to top level usually unless scoped.
    // Scoped filters in select string: preset_reactions!user_id=eq.UUID
    
    query = supabase
      .from(TABLE_NAME)
      .select(`*, my_reaction:preset_reactions(reaction)`)
      .eq("tool_id", toolId)
      .eq("is_public", true)
      .eq("is_deleted", false)
      .filter("my_reaction.user_id", "eq", currentUserId)
      .order("created_at", { ascending: false })
      .range(from, to);
  } else {
    query = supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("tool_id", toolId)
      .eq("is_public", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching public presets:", error);
    throw new Error(error.message);
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    toolId: item.tool_id,
    parameters: item.parameters,
    createdAt: item.created_at,
    isPublic: item.is_public,
    userId: item.user_id,
    userEmail: item.user_email,
    userDisplayName: item.user_display_name,
    userAvatarUrl: item.user_avatar_url,
    reactionCounts: item.reaction_counts || {},
    userReaction: item.my_reaction?.[0]?.reaction || null,
  }));
}

/**
 * Toggles a reaction on a preset.
 */
export async function togglePresetReaction(
  userId: string,
  presetId: string,
  reaction: string
): Promise<void> {
  const { error } = await supabase.rpc("toggle_reaction", {
    p_user_id: userId,
    p_preset_id: presetId,
    p_reaction: reaction,
  });

  // console.log(userId, presetId, reaction);

  if (error) {
    console.error("Error toggling reaction:", error);
    throw new Error(error.message);
  }
}

/**
 * Soft deletes a preset.
 */
export async function deletePreset(presetId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq("id", presetId);

  if (error) {
    console.error("Error deleting preset:", error);
    throw new Error(error.message);
  }
}
