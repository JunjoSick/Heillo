import type { BaseConsonantToken, GeminateToken, PhonemeToken } from "@/lib/types";
import { isBaseConsonantToken, isGeminateToken } from "@/lib/phonetics/tokens";

const GEMINATE_BASE: Record<GeminateToken, BaseConsonantToken> = {
  PP: "P",
  BB: "B",
  TT: "T",
  DD: "D",
  KK: "K",
  GG: "G",
  FF: "F",
  VV: "V",
  SS: "S",
  ZZ: "Z",
  MM: "M",
  NN: "N",
  LL: "L",
  RR: "R"
};

export interface LengthFeature {
  base: BaseConsonantToken;
  long: boolean;
}

export function getLengthFeature(token: PhonemeToken): LengthFeature | null {
  if (isBaseConsonantToken(token)) {
    return { base: token, long: false };
  }

  if (isGeminateToken(token)) {
    return { base: GEMINATE_BASE[token], long: true };
  }

  return null;
}
