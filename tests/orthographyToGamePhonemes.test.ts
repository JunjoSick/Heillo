import { describe, expect, it } from "vitest";
import { normalizeWord } from "@/lib/phonetics/normalizeWord";
import { orthographyToGamePhonemes } from "@/lib/phonetics/orthographyToGamePhonemes";

function transcribe(word: string) {
  return orthographyToGamePhonemes(normalizeWord(word));
}

describe("orthographyToGamePhonemes", () => {
  it("handles roadmap transcription examples", () => {
    expect(transcribe("gioco")).toEqual(["GD", "O", "K", "O"]);
    expect(transcribe("geco")).toEqual(["GD", "E", "K", "O"]);
    expect(transcribe("scena")).toEqual(["SC", "E", "N", "A"]);
    expect(transcribe("schema")).toEqual(["S", "K", "E", "M", "A"]);
    expect(transcribe("schiena")).toEqual(["S", "K", "J", "E", "N", "A"]);
    expect(transcribe("piano")).toEqual(["P", "J", "A", "N", "O"]);
    expect(transcribe("quadro")).toEqual(["K", "W", "A", "D", "R", "O"]);
    expect(transcribe("mai")).toEqual(["M", "A", "J"]);
    expect(transcribe("auto")).toEqual(["A", "W", "T", "O"]);
    expect(transcribe("palla")).toEqual(["P", "A", "LL", "A"]);
    expect(transcribe("mamma")).toEqual(["M", "A", "MM", "A"]);
    expect(transcribe("gnomo")).toEqual(["GN", "O", "M", "O"]);
    expect(transcribe("figlio")).toEqual(["F", "I", "GL", "O"]);
    expect(transcribe("ho")).toEqual(["O"]);
    expect(transcribe("hanno")).toEqual(["A", "NN", "O"]);
  });

  it("handles additional soft, hard, and diphthong examples", () => {
    expect(transcribe("cena")).toEqual(["CD", "E", "N", "A"]);
    expect(transcribe("ciao")).toEqual(["CD", "A", "O"]);
    expect(transcribe("chiave")).toEqual(["K", "J", "A", "V", "E"]);
    expect(transcribe("sciame")).toEqual(["SC", "A", "M", "E"]);
    expect(transcribe("ghetto")).toEqual(["G", "E", "TT", "O"]);
    expect(transcribe("lei")).toEqual(["L", "E", "J"]);
    expect(transcribe("poi")).toEqual(["P", "O", "J"]);
    expect(transcribe("noi")).toEqual(["N", "O", "J"]);
  });
});
