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

    const giocoFioco = validateMove("gioco", "fioco", defaultSettings);
    expect(giocoFioco.from.phonemes).toEqual(["GD", "O", "K", "O"]);
    expect(giocoFioco.to.phonemes).toEqual(["F", "J", "O", "K", "O"]);
    expect(giocoFioco.cost).toBe(2.0);
    expect(giocoFioco.class).toBe("valid");
    expect(giocoFioco.meaningfulChangeCount).toBe(1);
    expect(giocoFioco.isCompound).toBe(false);
    expect(giocoFioco.changes[0].type).toBe("onset-change");

    const fiocoGioco = validateMove("fioco", "gioco", defaultSettings);
    expect(fiocoGioco.cost).toBe(2.0);
    expect(fiocoGioco.class).toBe("valid");
    expect(fiocoGioco.changes[0].type).toBe("onset-change");

    const tarmaTrama = validateMove("tarma", "trama", defaultSettings);
    expect(tarmaTrama.from.phonemes).toEqual(["T", "A", "R", "M", "A"]);
    expect(tarmaTrama.to.phonemes).toEqual(["T", "R", "A", "M", "A"]);
    expect(tarmaTrama.cost).toBe(1.25);
    expect(tarmaTrama.class).toBe("valid");
    expect(tarmaTrama.meaningfulChangeCount).toBe(1);
    expect(tarmaTrama.isCompound).toBe(false);
    expect(tarmaTrama.changes[0].type).toBe("swap");

    const tramaTarma = validateMove("trama", "tarma", defaultSettings);
    expect(tramaTarma.cost).toBe(1.25);
    expect(tramaTarma.class).toBe("valid");
    expect(tramaTarma.changes[0].type).toBe("swap");
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

  it("does not treat phonetic token splits as swaps", () => {
    const result = validateMove("stagna", "stanga", defaultSettings);

    expect(result.from.phonemes).toEqual(["S", "T", "A", "GN", "A"]);
    expect(result.to.phonemes).toEqual(["S", "T", "A", "N", "G", "A"]);
    expect(result.changes.some((change) => change.type === "swap")).toBe(false);
    expect(result.cost).toBeGreaterThanOrEqual(3.5);
    expect(result.class === "borderline" || result.class === "invalid").toBe(true);
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
