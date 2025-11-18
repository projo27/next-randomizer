import { db } from "@/lib/firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import type { ToolPreset, AnyPresetParams } from "@/types/presets";

const USER_PREFERENCE_COLLECTION = "userPreferences";
const PRESETS_SUBCOLLECTION = "presets";

/**
 * Saves a new preset for a specific tool for a given user.
 * @param userId The ID of the user.
 * @param toolId The identifier for the tool (e.g., 'list', 'number').
 * @param presetName The name for the preset.
 * @param parameters The parameters object to save.
 * @returns The ID of the newly created preset.
 */
export async function savePreset(
  userId: string,
  toolId: string,
  presetName: string,
  parameters: AnyPresetParams
): Promise<string> {
  if (!userId || !toolId || !presetName) {
    throw new Error("User ID, Tool ID, and Preset Name are required.");
  }
  try {
    const presetsColRef = collection(
      db,
      USER_PREFERENCE_COLLECTION,
      userId,
      PRESETS_SUBCOLLECTION
    );
    const newPreset = {
      name: presetName,
      toolId,
      parameters,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(presetsColRef, newPreset);
    return docRef.id;
  } catch (error) {
    console.error("Error saving preset:", error);
    throw new Error("Failed to save the preset. Please try again.");
  }
}

/**
 * Retrieves all presets for a specific tool for a given user.
 * @param userId The ID of the user.
 * @param toolId The identifier for the tool.
 * @returns An array of presets.
 */
export async function getPresets(
  userId: string,
  toolId: string
): Promise<ToolPreset[]> {
  if (!userId || !toolId) return [];
  try {
    const presetsColRef = collection(
      db,
      USER_PREFERENCE_COLLECTION,
      userId,
      PRESETS_SUBCOLLECTION
    );
    const q = query(
      presetsColRef,
      where("toolId", "==", toolId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ToolPreset)
    );
  } catch (error) {
    console.error("Error getting presets:", error);
    return [];
  }
}

/**
 * Deletes a specific preset for a user.
 * @param userId The ID of the user.
 * @param presetId The ID of the preset document to delete.
 */
export async function deletePreset(
  userId: string,
  presetId: string
): Promise<void> {
  if (!userId || !presetId) {
    throw new Error("User ID and Preset ID are required.");
  }
  try {
    const presetDocRef = doc(
      db,
      USER_PREFERENCE_COLLECTION,
      userId,
      PRESETS_SUBCOLLECTION,
      presetId
    );
    await deleteDoc(presetDocRef);
  } catch (error) {
    console.error("Error deleting preset:", error);
    throw new Error("Failed to delete the preset. Please try again.");
  }
}
