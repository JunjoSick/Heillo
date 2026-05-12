import { describe, expect, it } from "vitest";
import { getSubstitutionCost } from "@/lib/phonetics/substitutionCost";
import { ALL_TOKENS } from "@/lib/phonetics/tokens";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("substitution cost invariants", () => {
  it("is symmetric for every token pair", () => {
    for (const a of ALL_TOKENS) {
      for (const b of ALL_TOKENS) {
        expect(getSubstitutionCost(a, b, defaultSettings)).toBe(
          getSubstitutionCost(b, a, defaultSettings)
        );
      }
    }
  });

  it("is zero for identity", () => {
    for (const token of ALL_TOKENS) {
      expect(getSubstitutionCost(token, token, defaultSettings)).toBe(0);
    }
  });
});
