import { describe, expect, it } from "vitest";
import { chainOpToVisualChanges } from "@/components/chain/chainOpToVisualChanges";
import { classifyChain } from "@/components/chain/diff";
import { moveValidationToVisualChanges } from "@/components/chain/moveValidationToVisualChanges";
import { defaultSettings } from "@/lib/settings/defaultSettings";
import { validateMove } from "@/lib/phonetics";

describe("moveValidationToVisualChanges", () => {
  it("renders ho → o as a single homophone change", () => {
    const validation = validateMove("ho", "o", defaultSettings);
    const visual = moveValidationToVisualChanges(validation);

    expect(visual).toHaveLength(1);
    expect(visual[0].type).toBe("homophone");
    expect(visual[0].source).toBe("phonetic");
    expect(visual[0].cost).toBe(0);
  });

  it("renders tarma → trama as a phonetic swap of A and R", () => {
    const validation = validateMove("tarma", "trama", defaultSettings);
    const visual = moveValidationToVisualChanges(validation);

    expect(visual).toHaveLength(1);
    expect(visual[0].type).toBe("swap");
    expect(visual[0].from).toEqual(["A", "R"]);
    expect(visual[0].to).toEqual(["R", "A"]);
    expect(visual[0].source).toBe("phonetic");
  });

  it("does not render stagna → stanga as a swap", () => {
    const validation = validateMove("stagna", "stanga", defaultSettings);
    const visual = moveValidationToVisualChanges(validation);

    expect(visual.some((change) => change.type === "swap")).toBe(false);
    expect(visual.every((change) => change.source === "phonetic")).toBe(true);
  });

  it("renders schema → schiena as a compound move with insertion + substitution", () => {
    const validation = validateMove("schema", "schiena", defaultSettings);
    const visual = moveValidationToVisualChanges(validation);

    expect(visual.length).toBeGreaterThan(1);
    const types = visual.map((change) => change.type);
    expect(types).toContain("insertion");
    expect(types).toContain("substitution");
  });

  it("carries target phoneme indices for validated row highlights", () => {
    const validation = validateMove("casa", "caso", defaultSettings);
    const visual = moveValidationToVisualChanges(validation);

    expect(visual[0]).toMatchObject({
      type: "substitution",
      from: ["A"],
      to: ["O"],
      fromIndices: [3],
      toIndices: [3]
    });
  });

  it("keeps gioco → fioco typed as a phonetic onset change", () => {
    const validation = validateMove("gioco", "fioco", defaultSettings);
    const visual = moveValidationToVisualChanges(validation);

    expect(visual[0]).toMatchObject({
      type: "onset-change",
      source: "phonetic",
      toIndices: [0, 1]
    });
  });

  it("returns an empty list for same-spelling no-ops", () => {
    const validation = validateMove("gioco", "gioco", defaultSettings);
    expect(moveValidationToVisualChanges(validation)).toEqual([]);
  });
});

describe("chainOpToVisualChanges", () => {
  it("tags every preview change with source spelling-preview", () => {
    const op = classifyChain("stagna", "stanga");
    const visual = chainOpToVisualChanges(op);

    expect(visual.length).toBeGreaterThan(0);
    expect(visual.every((change) => change.source === "spelling-preview")).toBe(
      true
    );
  });

  it("maps substitution → single-letter from/to arrays", () => {
    const visual = chainOpToVisualChanges(classifyChain("plame", "plate"));
    expect(visual).toEqual([
      {
        type: "substitution",
        from: ["m"],
        to: ["t"],
        description: "m → t",
        source: "spelling-preview"
      }
    ]);
  });

  it("maps insertion → empty from, single-element to", () => {
    const visual = chainOpToVisualChanges(classifyChain("plate", "plates"));
    expect(visual).toEqual([
      {
        type: "insertion",
        from: [],
        to: ["s"],
        description: "+s",
        source: "spelling-preview"
      }
    ]);
  });

  it("maps lengthening to a doubled to[] array", () => {
    const visual = chainOpToVisualChanges(classifyChain("plates", "plattes"));
    expect(visual[0]).toMatchObject({
      type: "lengthening",
      from: ["t"],
      to: ["t", "t"]
    });
  });

  it("maps cluster-change to character-split from/to", () => {
    const visual = chainOpToVisualChanges(classifyChain("plate", "glave"));
    expect(visual[0]).toMatchObject({
      type: "cluster-change",
      from: ["p", "l", "a", "t"],
      to: ["g", "l", "a", "v"]
    });
  });

  it("returns an empty list for noop ops", () => {
    expect(chainOpToVisualChanges({ type: "noop" })).toEqual([]);
  });
});
