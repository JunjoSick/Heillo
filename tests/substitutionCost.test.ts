import { describe, expect, it } from "vitest";
import { getSubstitutionCost } from "@/lib/phonetics/substitutionCost";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("getSubstitutionCost", () => {
  it("uses vowel costs", () => {
    expect(getSubstitutionCost("O", "E", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("E", "O", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("E", "I", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("O", "U", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("I", "U", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("A", "U", defaultSettings)).toBe(1.5);
    expect(getSubstitutionCost("A", "I", defaultSettings)).toBe(1.5);
  });

  it("uses base consonant costs", () => {
    expect(getSubstitutionCost("P", "B", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("K", "P", defaultSettings)).toBe(1.5);
    expect(getSubstitutionCost("K", "R", defaultSettings)).toBe(2.5);
  });

  it("uses geminate length features", () => {
    expect(getSubstitutionCost("L", "LL", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("LL", "RR", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("L", "RR", defaultSettings)).toBe(2);
    expect(getSubstitutionCost("TT", "KK", defaultSettings)).toBe(1.5);
  });

  it("uses special and semivowel costs", () => {
    expect(getSubstitutionCost("CD", "GD", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("CD", "SC", defaultSettings)).toBe(1.5);
    expect(getSubstitutionCost("GN", "N", defaultSettings)).toBe(1.5);
    expect(getSubstitutionCost("GL", "L", defaultSettings)).toBe(1.5);
    expect(getSubstitutionCost("CD", "P", defaultSettings)).toBe(2.5);
    expect(getSubstitutionCost("GD", "B", defaultSettings)).toBe(2.5);
    expect(getSubstitutionCost("J", "I", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("J", "E", defaultSettings)).toBe(1.5);
    expect(getSubstitutionCost("W", "U", defaultSettings)).toBe(1);
    expect(getSubstitutionCost("W", "O", defaultSettings)).toBe(1.5);
  });
});
