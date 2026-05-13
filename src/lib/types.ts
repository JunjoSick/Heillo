export type VowelToken = "A" | "E" | "I" | "O" | "U";

export type BaseConsonantToken =
  | "P"
  | "B"
  | "T"
  | "D"
  | "K"
  | "G"
  | "F"
  | "V"
  | "S"
  | "Z"
  | "M"
  | "N"
  | "L"
  | "R";

export type SpecialToken = "CD" | "GD" | "SC" | "GN" | "GL" | "J" | "W";

export type GeminateToken =
  | "PP"
  | "BB"
  | "TT"
  | "DD"
  | "KK"
  | "GG"
  | "FF"
  | "VV"
  | "SS"
  | "ZZ"
  | "MM"
  | "NN"
  | "LL"
  | "RR";

export type PhonemeToken =
  | VowelToken
  | BaseConsonantToken
  | SpecialToken
  | GeminateToken;

export type MoveClass = "smooth" | "valid" | "borderline" | "invalid";

export type ChangeType =
  | "substitution"
  | "insertion"
  | "deletion"
  | "lengthening"
  | "shortening"
  | "cluster-change"
  | "onset-change"
  | "swap";

export interface PhoneticWord {
  raw: string;
  normalized: string;
  phonemes: PhonemeToken[];
}

export interface MoveChange {
  type: ChangeType;
  from?: PhonemeToken | PhonemeToken[];
  to?: PhonemeToken | PhonemeToken[];
  cost: number;
  description: string;
}

export interface AlignmentStep {
  from: PhonemeToken[];
  to: PhonemeToken[];
  cost: number;
  type: ChangeType | "match";
}

export interface LexicalStatus {
  toWordInDictionary: boolean;
  source: "dictionary" | "local-override" | "missing";
}

export interface MoveValidation {
  from: PhoneticWord;
  to: PhoneticWord;

  cost: number;
  class: MoveClass;
  phoneticValid: boolean;

  changes: MoveChange[];
  explanation: string;

  meaningfulChangeCount: number;
  isCompound: boolean;

  zeroDistance: boolean;
  sameOrthographicWord: boolean;
  homophoneMove: boolean;
  acceptAsProgress: boolean;

  lexical: LexicalStatus;
  alignment: AlignmentStep[] | null;
}

export interface GameSettings {
  smoothMax: number;
  validMax: number;
  borderlineMax: number;

  insertVowelCost: number;
  deleteVowelCost: number;

  insertSemivowelCost: number;
  deleteSemivowelCost: number;

  insertConsonantCost: number;
  deleteConsonantCost: number;

  lengthMismatchCost: number;
  specialFallbackCost: number;

  swapBaseCost: number;
  swapVowelLiquidCost: number;
  swapVowelSemivowelCost: number;
  swapVowelNasalCost: number;
  swapVowelObstruentCost: number;
  swapSameBroadClassCost: number;
  swapSpecialPenalty: number;

  maxCompoundStreak: number;
  allowHomophoneMoves: boolean;
}

export interface Suggestion {
  word: string;
  phonemes: PhonemeToken[];
  validation: MoveValidation;
}

export interface DictionaryContext {
  dictionaryWords?: Iterable<string>;
  customWords?: Iterable<string>;
}

export interface PathEntry {
  word: PhoneticWord;
  move?: MoveValidation;
}

export interface PathAcceptance {
  accepted: boolean;
  reason:
    | "accepted"
    | "invalid-move"
    | "not-progress"
    | "compound-streak-exceeded";
  message: string;
}
