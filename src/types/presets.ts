// types/presets.ts

/**
 * Base structure for any preset.
 */
export type Preset<T> = {
  id: string;
  name: string;
  toolId: string;
  parameters: T;
  createdAt: string | Date;
  isPublic?: boolean;
  userId?: string;
  userEmail?: string;
  userDisplayName?: string;
  userAvatarUrl?: string;
  reactionCounts?: Record<string, number>;
  userReaction?: string | null;
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

export type SpinnerPresetParams = {
  items: string; // Stored as a newline-separated string
};

export type LotteryPresetParams = {
  length: string;
  includeLetters: boolean;
  mode?: 'simple' | 'complex';
  segments?: Array<{
    id: string;
    type: string;
    value: string | number;
    min?: number;
    max?: number;
    allowedChars?: string;
  }>;
};

export type OotdPresetParams = {
  gender: string;
  style: string;
  season: string;
  height: string;
  weight: string;
};

export type DataObjectPresetParams = {
  data: string; // JSON string
  count: string;
  columns?: any[]; // Optional column definitions
};

export type UnsplashPresetParams = {
  query: string;
  autoPlayDuration: number;
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
  | SeatingChartPresetParams
  | SpinnerPresetParams
  | LotteryPresetParams
  | OotdPresetParams
  | DataObjectPresetParams
  | UnsplashPresetParams;

// Generic preset type for use in components
export type ToolPreset = Preset<AnyPresetParams>;
