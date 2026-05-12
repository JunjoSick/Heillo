import { describe, expect, it } from "vitest";
import { validateMove } from "@/lib/phonetics/validateMove";
import { defaultSettings } from "@/lib/settings/defaultSettings";

describe("validateMove", () => {
  it("validates canonical roadmap examples", () => {
    const giocoGeco = validateMove("gioco", "geco", defaultSettings);
    expect(giocoGeco.cost).toBe(1);
    expect(giocoGeco.class).toBe("smooth");
    expect(giocoGeco.meaningfulChangeCount).toBe(1);
    expect(giocoGeco.isCompound).toBe(false);

    expect(validateMove("pala", "palla", defaultSettings).class).toBe("smooth");
    expect(validateMove("mamma", "manna", defaultSettings).class).toBe("smooth");
    expect(validateMove("cane", "pane", defaultSettings).class).toBe("valid");
    expect(validateMove("pala", "pila", defaultSettings).class).toBe("valid");
    expect(validateMove("cena", "scena", defaultSettings).class).toBe("valid");
  });

  it("separates class and compoundness", () => {
    const schemaSchiena = validateMove("schema", "schiena", defaultSettings);
    expect(schemaSchiena.cost).toBe(2.5);
    expect(schemaSchiena.class).toBe("borderline");
    expect(schemaSchiena.isCompound).toBe(true);

    const scenaSchema = validateMove("scena", "schema", defaultSettings);
    expect(scenaSchema.cost).toBe(3.5);
    expect(scenaSchema.class).toBe("borderline");
    expect(scenaSchema.isCompound).toBe(true);
  });

  it("invalidates overly large moves", () => {
    expect(validateMove("scena", "schiena", defaultSettings).class).toBe("invalid");
    expect(validateMove("cane", "scena", defaultSettings).class).toBe("invalid");
  });

  it("keeps dictionary status separate from phonetic status", () => {
    const result = validateMove("gioco", "geco", defaultSettings, {
      dictionaryWords: ["gioco"],
      customWords: ["geco"]
    });

    expect(result.class).toBe("smooth");
    expect(result.lexical.source).toBe("local-override");
    expect(result.lexical.toWordInDictionary).toBe(true);
  });
});
