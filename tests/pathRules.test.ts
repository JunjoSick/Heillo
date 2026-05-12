import { describe, expect, it } from "vitest";
import { canAcceptMove } from "@/lib/path/pathRules";
import { validateMove } from "@/lib/phonetics/validateMove";
import { defaultSettings } from "@/lib/settings/defaultSettings";
import type { MoveValidation } from "@/lib/types";

function compoundMove(id: string): MoveValidation {
  const base = validateMove("schema", "schiena", defaultSettings);

  return {
    ...base,
    to: {
      ...base.to,
      raw: id
    },
    isCompound: true,
    acceptAsProgress: true,
    phoneticValid: true,
    class: "borderline"
  };
}

describe("path rules", () => {
  it("blocks invalid moves and pure no-ops", () => {
    expect(
      canAcceptMove([], validateMove("scena", "schiena", defaultSettings), defaultSettings)
        .reason
    ).toBe("invalid-move");
    expect(
      canAcceptMove([], validateMove("gioco", "gioco", defaultSettings), defaultSettings)
        .reason
    ).toBe("not-progress");
  });

  it("accepts homophone moves by default", () => {
    expect(canAcceptMove([], validateMove("ho", "o", defaultSettings), defaultSettings).accepted).toBe(
      true
    );
  });

  it("blocks the third compound move in a row", () => {
    const path = [compoundMove("one"), compoundMove("two")];
    const third = compoundMove("three");

    expect(canAcceptMove(path, third, defaultSettings)).toEqual({
      accepted: false,
      reason: "compound-streak-exceeded",
      message: "Compound streak: 2/2."
    });
  });
});
