import { describe, expect, it } from "vitest";
import {
  casefoldTrim,
  getUnsupportedWordReason,
  normalizeWord
} from "@/lib/phonetics/normalizeWord";

describe("normalizeWord", () => {
  it("lowercases, trims, normalizes, and strips diacritics", () => {
    expect(normalizeWord(" Però ")).toBe("pero");
    expect(normalizeWord("CITTÀ")).toBe("citta");
    expect(normalizeWord("è")).toBe("e");
  });

  it("keeps diacritics for same-orthographic comparison", () => {
    expect(casefoldTrim(" Però ")).toBe("però");
    expect(casefoldTrim("pero")).toBe("pero");
  });

  it("rejects apostrophes and multiword expressions", () => {
    expect(getUnsupportedWordReason("l'amore")).toContain("Apostrophes");
    expect(getUnsupportedWordReason("d’accordo")).toContain("Apostrophes");
    expect(getUnsupportedWordReason("un altra")).toContain("Apostrophes");
  });
});
