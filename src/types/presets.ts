// types/presets.ts

/**
 * Base structure for any preset.
 */
export type Preset<T> = {
  id: string; // Firestore document ID
  name: string;
  toolId: string;
  parameters: T;
  createdAt: any; // Firestore Timestamp
};

/**
 * Parameter types for each tool.
 */
export type ListPresetParams = {
  items: string; // Stored as a newline-separated string
  count: string;
};

export type NumberPresetParams = {
  min: string;
  max: string;
  count: string;
};

export type SequencePresetParams = {
  items: string; // Stored as a newline-separated string
};

export type PairPresetParams = {
  listA: string; // Stored as a newline-separated string
  listB: string; // Stored as a newline-separated string
};

export type PasswordPresetParams = {
  length: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
  includeUppercase: boolean;
};

export type DatePresetParams = {
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  count: string;
  includeTime: boolean;
  startTime: string;
  endTime: string;
  is24Hour: boolean;
  dateFormat: string;
};

export type TeamShufflerPresetParams = {
  participants: string; // Stored as a newline-separated string, optionally with levels
  teamSize: string;
  useLevels: boolean;
  inputMode: 'panel' | 'textarea';
};

export type SeatingChartPresetParams = {
  rows: string;
  cols: string;
  participants: string; // Stored as a newline-separated string
};

// Union type for any possible preset parameters
export type AnyPresetParams =
  | ListPresetParams
  | NumberPresetParams
  | SequencePresetParams
  | PairPresetParams
  | PasswordPresetParams
  | DatePresetParams
  | TeamShufflerPresetParams
  | SeatingChartPresetParams;

// Generic preset type for use in components
export type ToolPreset = Preset<AnyPresetParams>;
