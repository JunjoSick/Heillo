# Smooth Phonetic Word Game — Testing Site v0 Roadmap

> Spec version: merged-final-2026-05-12. Includes sameOrthographicWord/raw-vs-normalized fix, DP cluster-respelling transitions, expanded vowel tests, compound-streak test, and geminate insertion note.

## 0. Goal

Build a small web app for testing a phonetic word-transformation game.

The game is based on this principle:

> Words are written in normal Italian orthography, but moves are judged by a simplified phonetic representation.

The v0 is not meant to solve full paths automatically from word A to word B. It should instead help us test and tune the rules.

Users should be able to:

1. enter a starting Italian word;
2. see how the app “hears” the word phonetically;
3. enter a candidate next word;
4. see whether the move is `smooth`, `valid`, `borderline`, or `invalid`;
5. inspect the phonetic changes and cost;
6. accept valid moves into a visible path;
7. receive local suggestions from a dictionary;
8. tune thresholds live during playtesting.

The most important v0 property is:

> deterministic, explainable, tunable phonetic validation.

Do not implement neural embeddings, SLMs, LLMs, or full automatic path-solving yet.

---

## 1. Product Scope

### 1.1 Must have

- Web UI.
- Italian word input.
- Simplified phonetic transcription.
- Move validator.
- Move scoring.
- Move history.
- Suggestions panel.
- Runtime-tunable settings.
- Dictionary loading from JSON.
- Local custom-word override.
- Export custom words as JSON.
- Debug mode showing phoneme-by-phoneme comparison.
- Regression tests for transcription, costs, edit distance, validation, homophones, and suggestions.

### 1.2 Must not have yet

- No SLM.
- No LLM.
- No neural embeddings.
- No FAISS/vector database.
- No full path solver.
- No multiplayer.
- No user accounts.
- No database backend.
- No full IPA.
- No perfect Italian morphology.
- No perfect syllabification.
- No scientific accent/stress model.

---

## 2. Recommended Stack

Use:

```txt
Next.js
TypeScript
React
Tailwind
Vitest or Jest
public/dictionary.json
localStorage for custom accepted words
```

Prefer a pure TypeScript phonetic engine in v0.

Do not add a Python backend unless there is a strong reason. The first prototype should be easy to inspect, test, and modify.

---

## 3. Core Product Idea

A normal written word:

```txt
gioco
```

is converted into a simplified game phonetic form:

```txt
GD O K O
```

Another word:

```txt
geco
```

becomes:

```txt
GD E K O
```

The move:

```txt
gioco -> geco
```

is judged by the phonetic difference:

```txt
GD O K O
GD E K O
```

Only one thing changes:

```txt
O -> E
```

So the move is:

```txt
cost = 1
class = smooth
```

---

## 4. Game Phoneme Tokens

### 4.1 Vowels

```ts
A E I O U
```

Do not distinguish open/closed vowels in v0:

```txt
/e/ vs /ɛ/ -> E
/o/ vs /ɔ/ -> O
```

This avoids early regional-pronunciation problems.

### 4.2 Base consonants

```ts
P B T D K G F V S Z M N L R
```

### 4.3 Special Italian phonetic units

```ts
CD = c dolce, as in "cena", "ciao"
GD = g dolce, as in "gelo", "gioco"
SC = sc dolce, as in "scena", "sciame"
GN = gn, as in "gnomo", "bagno"
GL = gli, as in "figlio", "aglio"
J  = semivocalic i
W  = semivocalic u
```

### 4.4 Geminated consonants

Represent double consonants as long tokens:

```ts
PP BB TT DD KK GG
FF VV SS ZZ
MM NN LL RR
```

Examples:

```txt
pala  -> P A L A
palla -> P A LL A

fato  -> F A T O
fatto -> F A TT O

mamma -> M A MM A
manna -> M A NN A
```

---

## 5. Type Definitions

Create:

```txt
src/lib/types.ts
```

Use these types.

```ts
export type VowelToken = "A" | "E" | "I" | "O" | "U";

export type BaseConsonantToken =
  | "P" | "B" | "T" | "D" | "K" | "G"
  | "F" | "V" | "S" | "Z"
  | "M" | "N" | "L" | "R";

export type SpecialToken =
  | "CD" | "GD" | "SC" | "GN" | "GL" | "J" | "W";

export type GeminateToken =
  | "PP" | "BB" | "TT" | "DD" | "KK" | "GG"
  | "FF" | "VV" | "SS" | "ZZ"
  | "MM" | "NN" | "LL" | "RR";

export type PhonemeToken =
  | VowelToken
  | BaseConsonantToken
  | SpecialToken
  | GeminateToken;

export type MoveClass =
  | "smooth"
  | "valid"
  | "borderline"
  | "invalid";

export type ChangeType =
  | "substitution"
  | "insertion"
  | "deletion"
  | "lengthening"
  | "shortening"
  | "cluster-change";

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

  maxCompoundStreak: number;
  allowHomophoneMoves: boolean;
}
```

---

## 6. Default Settings

Use these defaults.

```ts
export const defaultSettings: GameSettings = {
  smoothMax: 1.0,
  validMax: 2.0,
  borderlineMax: 3.5,

  insertVowelCost: 1.5,
  deleteVowelCost: 1.5,

  insertSemivowelCost: 1.5,
  deleteSemivowelCost: 1.5,

  insertConsonantCost: 2.0,
  deleteConsonantCost: 2.0,

  lengthMismatchCost: 1.0,
  specialFallbackCost: 2.5,

  maxCompoundStreak: 2,
  allowHomophoneMoves: true
};
```

Important:

```txt
smoothMax must remain 1.0.
```

Do not fix edge cases by raising `smoothMax` to `1.5`, because that would incorrectly make these moves smooth:

```txt
cane -> pane
pala -> pila
```

They should be `valid`, not `smooth`.

---

## 7. Normalization

Implement:

```ts
normalizeWord(word: string): string
```

Behavior:

1. lowercase;
2. trim;
3. Unicode normalize;
4. strip diacritics;
5. reject unsupported apostrophes and multiword expressions for v0.

Example implementation idea:

```ts
export function normalizeWord(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
```

Examples:

```txt
però -> pero
città -> citta
è    -> e
```

Also implement a weaker comparison helper for detecting whether two inputs are literally the same orthographic word:

```ts
export function casefoldTrim(input: string): string {
  return input.trim().toLowerCase();
}
```

Important: `casefoldTrim` must **not** strip diacritics. It is used for `sameOrthographicWord`, so `però` and `pero` remain different orthographic inputs even though they normalize to the same game phonetic form.

In debug mode, show:

```txt
Input: però
Normalized: pero
Phonemes: P E R O
```

### 7.1 Apostrophes

Reject apostrophe/multiword expressions in v0:

```txt
l'amore
d'accordo
un'altra
```

Show:

```txt
Apostrophes and multiword expressions are not supported in v0. Use a single plain word.
```

---

## 8. Orthography-to-Phoneme Rules

Implement:

```ts
orthographyToGamePhonemes(word: string): PhonemeToken[]
```

The function receives a normalized word.

The order of rules matters. Handle digraphs/trigraphs before general single-letter logic.

### 8.1 C rules

```txt
ca co cu -> K A / K O / K U
ce ci    -> CD E / CD I
cia cio ciu -> CD A / CD O / CD U
che chi -> K E / K I
```

Examples:

```txt
cane  -> K A N E
cena  -> CD E N A
ciao  -> CD A O
chi   -> K I
```

Important:

```txt
ciao -> CD A O
```

not:

```txt
CD J A O
```

The `i` in `cia/cio/ciu` is technical: it marks the soft C.

### 8.2 G rules

```txt
ga go gu -> G A / G O / G U
ge gi    -> GD E / GD I
gia gio giu -> GD A / GD O / GD U
ghe ghi -> G E / G I
```

Examples:

```txt
gatto  -> G A TT O
gelo   -> GD E L O
gioco  -> GD O K O
geco   -> GD E K O
ghetto -> G E TT O
```

Important:

```txt
gioco -> GD O K O
```

not:

```txt
GD I O K O
```

The `i` in `gia/gio/giu` is technical.

### 8.3 SC / SCH rules

```txt
sce sci scia scio sciu -> SC + vowel
sca sco scu -> S K + vowel
sche schi -> S K + vowel
```

Examples:

```txt
scena   -> SC E N A
sciame  -> SC A M E
schema  -> S K E M A
schiena -> S K J E N A
schiavo -> S K J A V O
```

For `schie`, `schia`, `schio`, `schiu`, use:

```txt
schiena -> S K J E N A
schiavo -> S K J A V O
```

The `i` after `sch` and before another vowel becomes `J`.

### 8.4 GN

```txt
gn -> GN
```

Examples:

```txt
gnomo -> GN O M O
bagno -> B A GN O
```

### 8.5 GL

Handle `gli`, `glia`, `glie`, `glio`, `gliu` as `GL`.

Examples:

```txt
figlio -> F I GL O
aglio  -> A GL O
```

Do not over-engineer cases like `glicine` in v0. Add exceptions later.

### 8.6 H

Ignore silent `h`, except when part of:

```txt
ch
gh
sch
```

Examples:

```txt
ho    -> O
hanno -> A NN O
```

### 8.7 Semivocalic J and W

#### Prevocalic i/u

If `i` appears before another vowel and was not already consumed as part of a technical softening sequence such as `cia`, `gio`, `scia`, emit `J`.

Examples:

```txt
piano   -> P J A N O
pieno   -> P J E N O
chiave  -> K J A V E
schiena -> S K J E N A
```

If `u` appears before another vowel, emit `W`.

Examples:

```txt
uomo   -> W O M O
quadro -> K W A D R O
quasi  -> K W A S I
```

Handle `qu + vowel` as:

```txt
qu + vowel -> K W + vowel
```

Examples:

```txt
quadro -> K W A D R O
quasi  -> K W A S I
```

#### Postvocalic i/u

Also handle common falling diphthongs.

If `i` follows a vowel and is word-final or followed by a consonant, emit `J`.

Examples:

```txt
mai -> M A J
lei -> L E J
poi -> P O J
noi -> N O J
sei -> S E J
```

If `u` follows a vowel and is word-final or followed by a consonant, emit `W`.

Examples:

```txt
auto -> A W T O
```

Known limitation: without stress information, this may over-collapse some hiatus cases. Add an exception table for disputed words if needed.

Recommended structure:

```ts
const PHONETIC_EXCEPTIONS: Record<string, PhonemeToken[]> = {
  // Add playtest-driven corrections here.
};
```

The exception table should be checked before normal rule-based transcription.

### 8.8 Doubles

When two identical consonant letters form an Italian double consonant, emit the corresponding geminated token.

Examples:

```txt
palla -> P A LL A
fatto -> F A TT O
mamma -> M A MM A
cassa -> K A SS A
```

Do not produce:

```txt
L L
T T
M M
S S
```

Prefer:

```txt
LL
TT
MM
SS
```

---

## 9. Cost Model Overview

The cost model has these components:

1. vowel substitution matrix;
2. base consonant substitution matrix;
3. geminate formula;
4. special-token explicit costs;
5. special-token fallback cost;
6. semivowel-vowel explicit costs;
7. insertion/deletion costs;
8. cluster respelling costs.

The metric is a game smoothness metric, not a perfect linguistic metric.

---

## 10. Vowel Matrix

Use this matrix.

| From \ To | A | E | I | O | U |
|---|---:|---:|---:|---:|---:|
| **A** | 0 | 1 | 1.5 | 1 | 1.5 |
| **E** | 1 | 0 | 1 | 1 | 1.5 |
| **I** | 1.5 | 1 | 0 | 1.5 | 1 |
| **O** | 1 | 1 | 1.5 | 0 | 1 |
| **U** | 1.5 | 1.5 | 1 | 1 | 0 |

Critical requirement:

```txt
O <-> E = 1
```

This preserves the canonical example:

```txt
gioco -> geco
GD O K O -> GD E K O
O -> E
cost = 1
class = smooth
```

Required tests:

```ts
expect(getSubstitutionCost("O", "E", defaultSettings)).toBe(1);
expect(getSubstitutionCost("E", "O", defaultSettings)).toBe(1);

expect(validateMove("gioco", "geco", defaultSettings).cost).toBe(1);
expect(validateMove("gioco", "geco", defaultSettings).class).toBe("smooth");
```

---

## 11. Base Consonant Matrix

Use this matrix for simple base consonants:

```txt
P B T D K G F V S Z M N L R
```

Interpretation:

```txt
0   = identical
1.0 = very smooth
1.5 = nearby / valid
2.0 = rough but possible
2.5 = very rough
3.0 = essentially too far for a normal one-edit move
```

| From \ To | P | B | T | D | K | G | F | V | S | Z | M | N | L | R |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **P** | 0 | 1 | 1.5 | 2 | 1.5 | 2 | 1.5 | 2 | 2 | 2.5 | 1.5 | 2 | 2.5 | 2.5 |
| **B** | 1 | 0 | 2 | 1.5 | 2 | 1.5 | 2 | 1.5 | 2.5 | 2 | 1.5 | 2 | 2.5 | 2.5 |
| **T** | 1.5 | 2 | 0 | 1 | 1.5 | 2 | 2 | 2.5 | 1.5 | 2 | 2 | 1.5 | 2 | 2 |
| **D** | 2 | 1.5 | 1 | 0 | 2 | 1.5 | 2.5 | 2 | 2 | 1.5 | 2 | 1.5 | 2 | 2 |
| **K** | 1.5 | 2 | 1.5 | 2 | 0 | 1 | 2.5 | 2.5 | 2 | 2.5 | 2.5 | 2.5 | 2.5 | 2.5 |
| **G** | 2 | 1.5 | 2 | 1.5 | 1 | 0 | 2.5 | 2.5 | 2.5 | 2 | 2.5 | 2.5 | 2.5 | 2.5 |
| **F** | 1.5 | 2 | 2 | 2.5 | 2.5 | 2.5 | 0 | 1 | 1.5 | 2 | 2 | 2.5 | 2.5 | 2.5 |
| **V** | 2 | 1.5 | 2.5 | 2 | 2.5 | 2.5 | 1 | 0 | 2 | 1.5 | 2 | 2.5 | 2.5 | 2.5 |
| **S** | 2 | 2.5 | 1.5 | 2 | 2 | 2.5 | 1.5 | 2 | 0 | 1 | 2.5 | 2 | 2 | 2 |
| **Z** | 2.5 | 2 | 2 | 1.5 | 2.5 | 2 | 2 | 1.5 | 1 | 0 | 2.5 | 2 | 2 | 2 |
| **M** | 1.5 | 1.5 | 2 | 2 | 2.5 | 2.5 | 2 | 2 | 2.5 | 2.5 | 0 | 1 | 2 | 2 |
| **N** | 2 | 2 | 1.5 | 1.5 | 2.5 | 2.5 | 2.5 | 2.5 | 2 | 2 | 1 | 0 | 1.5 | 1.5 |
| **L** | 2.5 | 2.5 | 2 | 2 | 2.5 | 2.5 | 2.5 | 2.5 | 2 | 2 | 2 | 1.5 | 0 | 1 |
| **R** | 2.5 | 2.5 | 2 | 2 | 2.5 | 2.5 | 2.5 | 2.5 | 2 | 2 | 2 | 1.5 | 1 | 0 |

Expected consequences:

```txt
P -> B = 1
T -> D = 1
K -> G = 1
F -> V = 1
S -> Z = 1
M -> N = 1
L -> R = 1

K -> P = 1.5
K -> R = 2.5
T -> S = 1.5
```

Important canonical example:

```txt
cane -> pane
K A N E -> P A N E
K -> P = 1.5
class = valid
```

not `smooth`.

---

## 12. Symmetry Optimization for Cost Matrices

The vowel and consonant substitution matrices are symmetric:

```ts
cost(a, b) === cost(b, a)
```

This can be exploited, but the main benefit in v0 is correctness and maintainability, not a huge speedup.

### 12.1 Recommended implementation

Store only one canonical direction of each pair.

Example:

```ts
function pairKey(a: PhonemeToken, b: PhonemeToken): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}
```

Then define tables like:

```ts
const BASE_CONSONANT_COSTS: Record<string, number> = {
  [pairKey("P", "B")]: 1,
  [pairKey("P", "T")]: 1.5,
  [pairKey("P", "D")]: 2,
  // ...
};
```

And lookup:

```ts
function symmetricLookup(
  table: Record<string, number>,
  a: PhonemeToken,
  b: PhonemeToken
): number | undefined {
  if (a === b) return 0;
  return table[pairKey(a, b)];
}
```

### 12.2 Why this helps

It avoids duplicating both:

```txt
P -> B
B -> P
```

and it makes asymmetric mistakes harder.

This is useful because the consonant matrix has many cells. The implementation should not require writing both directions manually.

### 12.3 Speed impact

This alone will not produce a dramatic speedup. The matrices are tiny.

The real performance costs come from:

```txt
number of candidate words × edit-distance cost per candidate
```

So the larger speedups come from:

1. precomputing dictionary transcriptions;
2. dynamic length filtering;
3. not recomputing suggestions on every keystroke;
4. pruning edit distance when partial cost already exceeds `borderlineMax`;
5. optionally bucketing candidates by phoneme length.

### 12.4 Early-return optimization

Inside `getSubstitutionCost`, always do:

```ts
if (a === b) return 0;
```

before doing table lookup.

This matters because weighted edit distance checks many identity alignments.

### 12.5 Bounded edit-distance pruning

For suggestions, the engine only cares about candidates with cost <= `borderlineMax`.

Implement an optional max-cost argument:

```ts
weightedEditDistance(from, to, settings, { maxCost: settings.borderlineMax })
```

If a DP row cannot possibly produce a result <= `maxCost`, stop early and return:

```ts
{
  cost: Infinity,
  changes: [],
  alignment: null
}
```

This is more important than symmetric matrix lookup when the dictionary grows.

### 12.6 Keep symmetry invariant tests

Add:

```ts
for (const a of ALL_TOKENS) {
  for (const b of ALL_TOKENS) {
    expect(getSubstitutionCost(a, b, settings))
      .toBe(getSubstitutionCost(b, a, settings));
  }
}
```

This test is mandatory. If future tuning intentionally breaks symmetry, the spec must be updated explicitly.

---

## 13. Latent Structure of Stop Costs

The stop section of the matrix has a useful hidden structure:

```txt
voicing-only change = 1
place-only change   = 1.5
place + voicing      = 2
```

Examples:

```txt
P -> B = 1
P -> T = 1.5
P -> D = 2
K -> G = 1
T -> K = 1.5
```

Do not implement a parametrized stop formula in v0 unless it simplifies code.

Keep the explicit/symmetric matrix because it is easier to tune during playtesting.

---

## 14. Geminate Cost Rule

A geminated consonant has:

```txt
base consonant + length feature
```

Examples:

```txt
L  -> base L, long false
LL -> base L, long true

T  -> base T, long false
TT -> base T, long true
```

Use this formula:

```ts
cost(X, Y) =
  baseSubstitutionCost(base(X), base(Y))
  + lengthMismatchCost(long(X), long(Y))
```

Where:

```ts
lengthMismatchCost(false, false) = 0
lengthMismatchCost(true, true) = 0
lengthMismatchCost(false, true) = settings.lengthMismatchCost
lengthMismatchCost(true, false) = settings.lengthMismatchCost
```

Default:

```txt
lengthMismatchCost = 1
```

Examples:

```txt
L  -> R   = 1
LL -> RR  = 1
L  -> LL  = 1
LL -> L   = 1
L  -> RR  = 1 + 1 = 2
T  -> KK  = 1.5 + 1 = 2.5
TT -> KK  = 1.5
MM -> NN  = 1
```

### 14.1 Atomicity

A substitution that changes both base consonant and length is still one atomic edit.

Example:

```txt
L -> RR
```

Cost:

```txt
L -> R = 1
length mismatch = 1
total = 2
```

But it counts as:

```txt
meaningfulChangeCount = 1
```

not `2`.

The same applies to:

```txt
T -> KK
```

Cost:

```txt
T -> K = 1.5
length mismatch = 1
total = 2.5
```

Still one meaningful change.

---

## 15. Special Token Costs

Special tokens:

```txt
CD GD SC GN GL J W
```

Use explicit special costs where defined.

| From | To | Cost | Reason |
|---|---:|---:|---|
| CD | GD | 1 | same affricate, voicing change |
| CD | SC | 1.5 | affricate/fricative, close |
| GD | SC | 2 | voiced affricate to voiceless fricative |
| GN | N | 1.5 | nasal to nasal |
| GN | M | 2 | nasal to nasal, farther |
| GL | L | 1.5 | liquid to liquid |
| GL | R | 2 | liquid to liquid, less direct |
| SC | S | 1.5 | fricative relation |
| CD | T | 2 | affricate to stop component |
| GD | D | 2 | affricate to stop component |
| J | W | 1.5 | semivowel to semivowel |

The table must be symmetric:

```ts
cost("CD", "GD") === cost("GD", "CD")
```

Use the same `pairKey`/symmetric-lookup helper described above.

---

## 16. Semivowel-Vowel Costs

Do not let these fall through to the rough `2.5` special fallback.

### 16.1 J costs

| From | To | Cost |
|---|---:|---:|
| J | I | 1 |
| J | E | 1.5 |
| J | A | 2 |
| J | O | 2.5 |
| J | U | 2 |

### 16.2 W costs

| From | To | Cost |
|---|---:|---:|
| W | U | 1 |
| W | O | 1.5 |
| W | A | 2 |
| W | E | 2.5 |
| W | I | 2 |

Again, symmetric:

```ts
cost("J", "E") === cost("E", "J") === 1.5
cost("W", "O") === cost("O", "W") === 1.5
```

---

## 17. Special Fallback Cost

If a pair involves at least one special token and there is no explicit cost, use:

```txt
settings.specialFallbackCost = 2.5
```

Examples:

```txt
CD -> P  = 2.5
GD -> B  = 2.5
SC -> K  = 2.5
GL -> P  = 2.5
GN -> R  = 2.5
J  -> N  = 2.5
W  -> L  = 2.5
```

This is intentionally rough. During playtesting, disputed pairs can be promoted into the explicit special-cost table.

---

## 18. Insertion and Deletion Costs

Use token class:

```ts
insert vowel      = settings.insertVowelCost       // default 1.5
delete vowel      = settings.deleteVowelCost       // default 1.5

insert semivowel  = settings.insertSemivowelCost   // default 1.5
delete semivowel  = settings.deleteSemivowelCost   // default 1.5

insert consonant  = settings.insertConsonantCost   // default 2.0
delete consonant  = settings.deleteConsonantCost   // default 2.0
```

Treat `J` and `W` as semivowels.

Treat all other consonants, including special consonants and geminates, as consonants for insertion/deletion cost unless a better rule is added later.

Note: insertion/deletion of geminate tokens is expected to be rare in practice because most natural double-consonant differences should appear as substitutions such as `L -> LL`, not as insertion of `LL`. Keep the simple consonant insertion/deletion cost for v0 and tune only if playtesting exposes bad cases.

---

## 19. Cluster Respelling Costs

Some single phonetic units may be related to clusters.

Implement:

```ts
getClusterRespellingCost(
  fromSlice: PhonemeToken[],
  toSlice: PhonemeToken[],
  settings: GameSettings
): number | null
```

Known cluster respellings:

| Single token | Cluster | Cost |
|---|---|---:|
| SC | S K | 2.5 |
| GL | G L | 2.5 |
| GN | G N | 2.5 |
| CD | T SC | 2.5 |
| GD | D SC | 2.5 |

Only this one is crucial for v0:

```txt
SC <-> S K = 2.5
```

Example:

```txt
scena -> schema

SC E N A
S K E M A

SC -> S K = 2.5
N -> M = 1

total = 3.5
class = borderline
```

### 19.1 Atomicity

Known cluster respelling is one atomic edit.

Example:

```txt
SC -> S K
```

counts as:

```ts
{
  type: "cluster-change",
  from: ["SC"],
  to: ["S", "K"],
  cost: 2.5
}
```

It counts as one meaningful change, not two.

### 19.2 Unknown cluster fallback

If no cluster respelling entry exists:

```ts
return null
```

Then the weighted edit-distance engine should use ordinary substitution/insertion/deletion operations.

Do not apply `specialFallbackCost` directly to unknown slice-level cluster changes.

Example:

```ts
getClusterRespellingCost(["SS"], ["S", "K"], settings) === null
```

---

## 20. Weighted Edit Distance

Implement weighted edit distance over `PhonemeToken[]`.

Core function:

```ts
weightedEditDistance(
  from: PhonemeToken[],
  to: PhonemeToken[],
  settings: GameSettings,
  options?: { maxCost?: number }
): {
  cost: number;
  changes: MoveChange[];
  alignment: unknown;
}
```

It must support:

1. substitution;
2. insertion;
3. deletion;
4. atomic cluster respellings;
5. geminate-aware substitution costs;
6. optional max-cost pruning for suggestions.

The edit distance should prefer the minimum-cost path.

Important: known cluster respellings should be available as special multi-token transitions, otherwise cases like:

```txt
SC -> S K
```

may be incorrectly represented as delete/insert noise.

### 20.1 DP integration for cluster respelling

For each DP cell `(i, j)`, consider the three standard operations:

```txt
substitution: (i + 1, j + 1)
deletion:     (i + 1, j)
insertion:    (i, j + 1)
```

In addition, consider every known cluster respelling as an atomic multi-token transition. For every entry `(fromSlice, toSlice, cost)`, if:

```ts
from.slice(i, i + fromSlice.length) === fromSlice
to.slice(j, j + toSlice.length) === toSlice
```

then add the transition:

```ts
(i + fromSlice.length, j + toSlice.length)
```

with the given cluster-respelling cost and one `cluster-change` record. The reverse direction must also work through symmetric lookup, e.g. `SC -> S K` and `S K -> SC`.

This is required so that:

```txt
SC -> S K
```

is represented as one atomic change with cost `2.5`, not as arbitrary delete/insert noise.

### 20.2 Bounded pruning for suggestions

When called from `suggestNextWords`, pass:

```ts
{ maxCost: settings.borderlineMax }
```

If a candidate cannot possibly remain within `borderlineMax`, return early with:

```ts
{
  cost: Infinity,
  changes: [],
  alignment: null
}
```

This is optional for correctness but recommended for performance once the dictionary grows.

---

## 21. Move Classification

Move class is determined only by total cost.

```ts
function classifyMove(cost: number, settings: GameSettings): MoveClass {
  if (cost <= settings.smoothMax) {
    return "smooth";
  }

  if (cost <= settings.validMax) {
    return "valid";
  }

  if (cost <= settings.borderlineMax) {
    return "borderline";
  }

  return "invalid";
}
```

Default thresholds:

```txt
smooth:     cost <= 1.0
valid:      cost <= 2.0
borderline: cost <= 3.5
invalid:    cost > 3.5
```

Do not classify by number of changes.

---

## 22. Meaningful Changes and Compound Moves

A meaningful change is:

```ts
change.cost > 0
```

Therefore:

```ts
meaningfulChangeCount = changes.filter(change => change.cost > 0).length;
isCompound = meaningfulChangeCount > 1;
```

Examples:

```txt
gioco -> geco
O -> E
meaningfulChangeCount = 1
isCompound = false
```

```txt
scena -> schema
SC -> S K
N -> M
meaningfulChangeCount = 2
isCompound = true
```

```txt
L -> RR
one substitution with cost 2
meaningfulChangeCount = 1
isCompound = false
```

Compoundness is independent from class.

A move can be:

```txt
class = valid
isCompound = true
```

or:

```txt
class = borderline
isCompound = false
```

---

## 23. Homophones and Zero-Distance Moves

Zero-distance moves require a distinction.

Use the raw orthographic input for sameness, not the fully normalized transcription form.

Definitions:

```ts
const sameOrthographicWord =
  casefoldTrim(from.raw) === casefoldTrim(to.raw);

const zeroDistance = cost === 0;
const homophoneMove = zeroDistance && !sameOrthographicWord;
```

This means:

```txt
però -> pero
```

is a homophone move, not a pure no-op. Both normalize to `pero` for transcription, but their raw orthographic forms differ.

### 23.1 Pure no-op

Same spelling and same phonetic form:

```txt
gioco -> gioco
```

Result:

```ts
zeroDistance = true
sameOrthographicWord = true
homophoneMove = false
acceptAsProgress = false
```

Always block as progress.

### 23.2 Homophone move

Different spelling, same phonetic form:

```txt
ho -> o
hanno -> anno
però -> pero
```

Result:

```ts
zeroDistance = true
sameOrthographicWord = false
homophoneMove = true
```

Default behavior:

```ts
allowHomophoneMoves = true
```

So:

```ts
acceptAsProgress = true
```

UI label:

```txt
Homophone move: different spelling, same game phonetics.
```

### 23.3 Acceptance logic

```ts
if (sameOrthographicWord) {
  acceptAsProgress = false;
} else if (homophoneMove) {
  acceptAsProgress = settings.allowHomophoneMoves;
} else {
  acceptAsProgress = phoneticValid;
}
```

Dictionary status is separate and must not overwrite phonetic classification.

---

## 24. Dictionary Model

Do not hardcode a tiny dictionary as a TypeScript list.

Use:

```txt
public/dictionary.json
```

Recommended v0 size:

```txt
at least 5,000–10,000 Italian words
```

A frequency-based common-word list is better than a huge list full of rare forms.

Important: lemma-only dictionaries are frustrating. Players will try inflected forms:

```txt
corro
corre
correvo
correrei
case
cani
andavo
```

The app should either support a large form list or allow local overrides.

### 24.1 Lexical and phonetic status are separate

A move result should show both:

```txt
Phonetic move: valid
Dictionary status: missing
```

Do not collapse them into one result.

A word can be:

```txt
phonetically valid but missing from dictionary
```

This is useful during playtesting.

### 24.2 Local override

If a word is missing, expose:

```txt
Accept as word
```

When clicked, store it in:

```txt
localStorage["customAcceptedWords"]
```

Then treat it as:

```ts
source = "local-override"
```

### 24.3 Export custom words

Add:

```txt
Export custom words JSON
```

Output format:

```json
{
  "customWords": [
    "corro",
    "correvo",
    "correrei"
  ],
  "exportedAt": "2026-05-12T00:00:00.000Z"
}
```

This allows playtest discoveries to be merged into the main dictionary.

---

## 25. Suggestion Engine

Implement:

```ts
suggestNextWords(
  currentWord: string,
  dictionary: string[],
  settings: GameSettings
): Suggestion[]
```

Type:

```ts
export interface Suggestion {
  word: string;
  phonemes: PhonemeToken[];
  validation: MoveValidation;
}
```

### 25.1 Naive v0 algorithm

1. transcribe current word;
2. loop through dictionary candidates;
3. skip identical word;
4. apply dynamic length filter;
5. validate candidate move with bounded edit distance;
6. keep candidates whose class is not `invalid`;
7. sort by:
   - class priority: `smooth`, `valid`, `borderline`;
   - lower cost;
   - lower meaningfulChangeCount;
   - shorter word if tied;
8. return top 20.

### 25.2 Precompute transcriptions

At dictionary load:

```ts
Map<string, PhonemeToken[]>
```

Do not retranscribe every candidate on every suggestion request.

### 25.3 Dynamic length filter

Do not hardcode:

```ts
Math.abs(a.length - b.length) > 3
```

Use a dynamic filter:

```ts
function getMaxLengthDelta(settings: GameSettings): number {
  const minInsertCost = Math.min(
    settings.insertVowelCost,
    settings.insertSemivowelCost,
    settings.insertConsonantCost
  );

  return Math.floor(settings.borderlineMax / minInsertCost);
}
```

With defaults:

```txt
borderlineMax = 3.5
minInsertCost = 1.5
maxLengthDelta = floor(3.5 / 1.5) = 2
```

Skip candidate if:

```ts
Math.abs(currentPhonemes.length - candidatePhonemes.length) > maxLengthDelta
```

### 25.4 Do not recompute on every raw keystroke

Suggestions should be triggered by:

```txt
Generate suggestions
```

or by debounced input.

---

## 26. Path Rules

The path is a list of accepted words and move validations.

Example:

```txt
scena
schema
schiena
```

For each candidate:

1. validate move from current last word;
2. compute lexical status;
3. reject if move class is `invalid`;
4. reject if `acceptAsProgress` is false;
5. reject if accepting would create more than `maxCompoundStreak` compound moves in a row;
6. otherwise append to path.

### 26.1 Compound streak rule

Default:

```txt
maxCompoundStreak = 2
```

Logic:

```ts
if (lastNMovesAreCompound(path, settings.maxCompoundStreak) && candidateMove.isCompound) {
  rejectForPathRule();
}
```

Display:

```txt
Compound streak: 2/2
```

Do not conflate compound streak with phonetic validity.

---

## 27. Main Validator Pipeline

Implement:

```ts
validateMove(
  fromWord: string,
  toWord: string,
  settings: GameSettings,
  dictionaryContext?: DictionaryContext
): MoveValidation
```

Pipeline:

```txt
raw input words
→ normalize orthography
→ reject unsupported apostrophes/multiword input
→ transcribe both words to game phonemes
→ compute weighted edit distance
   using:
     - vowel matrix
     - base consonant matrix
     - geminate formula
     - special explicit costs
     - semivowel-vowel explicit costs
     - special fallback cost
     - insertion/deletion costs
     - atomic cluster respellings
→ collect changes
→ discard zero-cost changes from meaningfulChangeCount
→ classify only by total cost
→ compute isCompound independently
→ compute zeroDistance / sameOrthographicWord / homophoneMove
  - sameOrthographicWord must use casefoldTrim(raw), not normalized
→ compute dictionary status separately
→ compute acceptAsProgress from settings
→ return full explanation
```

No example-specific runtime exceptions.

Examples belong in tests only.

---

## 28. UI Requirements

Single-page app.

### 28.1 Start word section

```txt
Starting word: [________] [Start]
```

After start:

```txt
gioco
GD O K O
```

### 28.2 Path view

Show vertical history:

```txt
1. scena      SC E N A
2. schema     S K E M A      borderline, cost 3.5
3. schiena    S K J E N A    borderline, cost 2.5
```

For each move, show changes:

```txt
SC -> S K
N -> M
```

### 28.3 Candidate flow

Use this flow:

1. user enters candidate;
2. user clicks `Verify`;
3. app shows result;
4. if acceptable, show `Accept move`.

Do not show `Accept move` before validation.

Example:

```txt
Next word: [________] [Verify]
```

After verification:

```txt
Result: valid
Cost: 1.5
Changes:
K -> P
[Accept move]
```

If invalid:

```txt
Invalid move.
Reason: cost > borderlineMax / too many changes / unsupported input.
```

### 28.4 Debug comparison

Show aligned tokens if possible:

```txt
FROM: SC  E  N  A
TO:   S K E  M  A

Changes:
- SC -> S K, cost 2.5
- N -> M, cost 1

Total cost: 3.5
Class: borderline
Compound: yes
```

### 28.5 Suggestions panel

Button:

```txt
Generate suggestions
```

Group suggestions:

```txt
Smooth
- geco: O -> E

Valid
- pane: K -> P

Borderline
- schema: SC -> S K, N -> M
```

### 28.6 Settings panel

Expose live-tunable settings:

```txt
smoothMax
validMax
borderlineMax
maxCompoundStreak
allowHomophoneMoves
```

Optional advanced settings:

```txt
insertVowelCost
insertSemivowelCost
insertConsonantCost
lengthMismatchCost
specialFallbackCost
```

When settings change, recompute visible validations live.

---

## 29. Onboarding Box

Add a minimal explanation box:

```txt
This game judges words by sound, not spelling.
```

Include four examples.

### 29.1 Smooth example

```txt
gioco -> geco

gioco = GD O K O
geco  = GD E K O

Change:
O -> E

Result:
smooth
```

### 29.2 Borderline example

```txt
scena -> schema

scena  = SC E N A
schema = S K E M A

Changes:
SC -> S K
N -> M

Result:
borderline

Reason:
The spelling looks close, but the sound changes from one compact consonant to a consonant cluster.
```

### 29.3 Invalid example

```txt
scena -> schiena

scena   = SC E N A
schiena = S K J E N A

Result:
invalid

Reason:
Too much changes in one move.
```

### 29.4 Homophone example

```txt
ho -> o

Both become:
O

Result:
homophone move
```

---

## 30. Suggested File Structure

```txt
src/
  app/
    page.tsx

  components/
    WordInput.tsx
    PhonemeView.tsx
    MoveResult.tsx
    PathView.tsx
    SuggestionsPanel.tsx
    DebugAlignment.tsx
    SettingsPanel.tsx
    OnboardingBox.tsx
    CustomWordsPanel.tsx

  data/
    // optional helper data only
    // main dictionary should live in public/dictionary.json

  lib/
    types.ts

    phonetics/
      tokens.ts
      normalizeWord.ts
      orthographyToGamePhonemes.ts
      exceptions.ts
      vowelCosts.ts
      consonantCosts.ts
      symmetricCostLookup.ts
      geminates.ts
      specialCosts.ts
      insertionDeletionCosts.ts
      clusterRespelling.ts
      substitutionCost.ts
      weightedEditDistance.ts
      validateMove.ts
      suggestNextWords.ts

    dictionary/
      loadDictionary.ts
      customWords.ts
      exportCustomWords.ts
      dictionaryContext.ts

    path/
      pathRules.ts

    settings/
      defaultSettings.ts

  tests/
    normalizeWord.test.ts
    orthographyToGamePhonemes.test.ts
    substitutionCost.test.ts
    symmetricCostLookup.test.ts
    weightedEditDistance.test.ts
    validateMove.test.ts
    homophones.test.ts
    suggestions.test.ts
    pathRules.test.ts
```

---

## 31. Implementation Phases

### Phase 1 — Project skeleton

- Create Next.js + TypeScript app.
- Add Tailwind.
- Add test runner.
- Create basic page layout.
- Create default settings.
- Create placeholder dictionary JSON.

Acceptance:

```txt
App runs locally.
Page loads.
Test runner works.
```

### Phase 2 — Normalization and tokens

Implement:

```ts
normalizeWord(word)
```

Define all phoneme tokens.

Acceptance:

```ts
expect(normalizeWord("Però")).toBe("pero");
expect(normalizeWord("CITTÀ")).toBe("citta");
```

### Phase 3 — Transcription engine

Implement:

```ts
orthographyToGamePhonemes(word)
```

Handle:

- vowels;
- base consonants;
- `ci/ce/cia/cio/ciu`;
- `gi/ge/gia/gio/giu`;
- `ch`;
- `gh`;
- `sc/sch`;
- `gn`;
- `gli`;
- `qu`;
- prevocalic `i/u`;
- postvocalic `i/u`;
- doubles;
- silent `h`;
- exception table.

Acceptance tests:

```ts
expect(transcribe("gioco")).toEqual(["GD", "O", "K", "O"]);
expect(transcribe("geco")).toEqual(["GD", "E", "K", "O"]);

expect(transcribe("scena")).toEqual(["SC", "E", "N", "A"]);
expect(transcribe("schema")).toEqual(["S", "K", "E", "M", "A"]);
expect(transcribe("schiena")).toEqual(["S", "K", "J", "E", "N", "A"]);

expect(transcribe("piano")).toEqual(["P", "J", "A", "N", "O"]);
expect(transcribe("pieno")).toEqual(["P", "J", "E", "N", "O"]);
expect(transcribe("chiave")).toEqual(["K", "J", "A", "V", "E"]);

expect(transcribe("quadro")).toEqual(["K", "W", "A", "D", "R", "O"]);

expect(transcribe("mai")).toEqual(["M", "A", "J"]);
expect(transcribe("lei")).toEqual(["L", "E", "J"]);
expect(transcribe("poi")).toEqual(["P", "O", "J"]);
expect(transcribe("noi")).toEqual(["N", "O", "J"]);

expect(transcribe("auto")).toEqual(["A", "W", "T", "O"]);

expect(transcribe("pala")).toEqual(["P", "A", "L", "A"]);
expect(transcribe("palla")).toEqual(["P", "A", "LL", "A"]);

expect(transcribe("mamma")).toEqual(["M", "A", "MM", "A"]);
expect(transcribe("manna")).toEqual(["M", "A", "NN", "A"]);

expect(transcribe("gnomo")).toEqual(["GN", "O", "M", "O"]);
expect(transcribe("figlio")).toEqual(["F", "I", "GL", "O"]);

expect(transcribe("ho")).toEqual(["O"]);
expect(transcribe("hanno")).toEqual(["A", "NN", "O"]);
```

### Phase 4 — Cost model

Implement:

```ts
getSubstitutionCost(a, b, settings)
getInsertionCost(token, settings)
getDeletionCost(token, settings)
```

Include:

- vowel matrix;
- base consonant matrix;
- symmetric lookup helper;
- geminate formula;
- special explicit costs;
- semivowel-vowel costs;
- special fallback.

Acceptance:

```ts
expect(getSubstitutionCost("O", "E", settings)).toBe(1);
expect(getSubstitutionCost("E", "O", settings)).toBe(1);
expect(getSubstitutionCost("E", "I", settings)).toBe(1);
expect(getSubstitutionCost("O", "U", settings)).toBe(1);
expect(getSubstitutionCost("I", "U", settings)).toBe(1);
expect(getSubstitutionCost("A", "U", settings)).toBe(1.5);
expect(getSubstitutionCost("A", "I", settings)).toBe(1.5);

expect(getSubstitutionCost("P", "B", settings)).toBe(1);
expect(getSubstitutionCost("K", "P", settings)).toBe(1.5);
expect(getSubstitutionCost("K", "R", settings)).toBe(2.5);

expect(getSubstitutionCost("L", "LL", settings)).toBe(1);
expect(getSubstitutionCost("LL", "RR", settings)).toBe(1);
expect(getSubstitutionCost("L", "RR", settings)).toBe(2);
expect(getSubstitutionCost("TT", "KK", settings)).toBe(1.5);

expect(getSubstitutionCost("CD", "GD", settings)).toBe(1);
expect(getSubstitutionCost("CD", "SC", settings)).toBe(1.5);
expect(getSubstitutionCost("GN", "N", settings)).toBe(1.5);
expect(getSubstitutionCost("GL", "L", settings)).toBe(1.5);

expect(getSubstitutionCost("CD", "P", settings)).toBe(2.5);
expect(getSubstitutionCost("GD", "B", settings)).toBe(2.5);

expect(getSubstitutionCost("J", "I", settings)).toBe(1);
expect(getSubstitutionCost("J", "E", settings)).toBe(1.5);
expect(getSubstitutionCost("W", "U", settings)).toBe(1);
expect(getSubstitutionCost("W", "O", settings)).toBe(1.5);
```

### Phase 5 — Cost invariants

Add symmetry test:

```ts
for (const a of ALL_TOKENS) {
  for (const b of ALL_TOKENS) {
    expect(getSubstitutionCost(a, b, settings))
      .toBe(getSubstitutionCost(b, a, settings));
  }
}
```

Add identity test:

```ts
for (const token of ALL_TOKENS) {
  expect(getSubstitutionCost(token, token, settings)).toBe(0);
}
```

### Phase 6 — Cluster respelling

Implement:

```ts
getClusterRespellingCost(fromSlice, toSlice, settings)
```

Acceptance:

```ts
expect(getClusterRespellingCost(["SC"], ["S", "K"], settings)).toBe(2.5);
expect(getClusterRespellingCost(["S", "K"], ["SC"], settings)).toBe(2.5);

expect(getClusterRespellingCost(["SS"], ["S", "K"], settings)).toBeNull();
```

### Phase 7 — Weighted edit distance

Implement weighted edit distance with:

- substitutions;
- insertions;
- deletions;
- atomic cluster changes;
- optional bounded pruning.

Acceptance:

```ts
expect(weightedEditDistance(["GD", "O", "K", "O"], ["GD", "E", "K", "O"], settings).cost)
  .toBe(1);

expect(weightedEditDistance(["P", "A", "L", "A"], ["P", "A", "LL", "A"], settings).cost)
  .toBe(1);

const scenaSchema = weightedEditDistance(
  ["SC", "E", "N", "A"],
  ["S", "K", "E", "M", "A"],
  settings
);

expect(scenaSchema.cost).toBe(3.5);
expect(scenaSchema.changes.some(c => c.type === "cluster-change")).toBe(true);

const lToRr = weightedEditDistance(["L"], ["RR"], settings);
expect(lToRr.cost).toBe(2);
expect(lToRr.changes.length).toBe(1);
```

### Phase 8 — Move validator

Implement:

```ts
validateMove(fromWord, toWord, settings, dictionaryContext?)
```

Acceptance:

```ts
const giocoGeco = validateMove("gioco", "geco", settings);
expect(giocoGeco.cost).toBe(1);
expect(giocoGeco.class).toBe("smooth");
expect(giocoGeco.meaningfulChangeCount).toBe(1);
expect(giocoGeco.isCompound).toBe(false);

expect(validateMove("pala", "palla", settings).class).toBe("smooth");
expect(validateMove("mamma", "manna", settings).class).toBe("smooth");

expect(validateMove("cane", "pane", settings).class).toBe("valid");
expect(validateMove("pala", "pila", settings).class).toBe("valid");

expect(validateMove("cena", "scena", settings).class).toBe("valid");

const schemaSchiena = validateMove("schema", "schiena", settings);
expect(schemaSchiena.cost).toBe(2.5);
expect(schemaSchiena.class).toBe("borderline");
expect(schemaSchiena.isCompound).toBe(true);

const scenaSchema = validateMove("scena", "schema", settings);
expect(scenaSchema.cost).toBe(3.5);
expect(scenaSchema.class).toBe("borderline");
expect(scenaSchema.isCompound).toBe(true);

expect(validateMove("scena", "schiena", settings).class).toBe("invalid");
expect(validateMove("cane", "scena", settings).class).toBe("invalid");
```

### Phase 9 — Homophones

Acceptance:

```ts
const same = validateMove("gioco", "gioco", settings);
expect(same.zeroDistance).toBe(true);
expect(same.sameOrthographicWord).toBe(true);
expect(same.homophoneMove).toBe(false);
expect(same.acceptAsProgress).toBe(false);

const homo = validateMove("ho", "o", settings);
expect(homo.zeroDistance).toBe(true);
expect(homo.sameOrthographicWord).toBe(false);
expect(homo.homophoneMove).toBe(true);
expect(homo.acceptAsProgress).toBe(true);
```

Also test:

```ts
const hannoAnno = validateMove("hanno", "anno", settings);
expect(hannoAnno.zeroDistance).toBe(true);
expect(hannoAnno.homophoneMove).toBe(true);

const pero = validateMove("però", "pero", settings);
expect(pero.zeroDistance).toBe(true);
expect(pero.sameOrthographicWord).toBe(false);
expect(pero.homophoneMove).toBe(true);
expect(pero.acceptAsProgress).toBe(true);
```

### Phase 10 — Dictionary loading

Implement:

```ts
loadDictionary()
loadCustomWords()
saveCustomWord(word)
exportCustomWords()
```

Acceptance:

```txt
public/dictionary.json loads.
Custom words are read from localStorage.
Missing word can be accepted as local override.
Custom words can be exported as JSON.
```

### Phase 11 — Path logic

Implement:

```ts
canAcceptMove(path, move, settings)
appendMove(path, move)
resetPath()
```

Acceptance:

```txt
First word starts path.
Invalid move does not append.
Pure no-op does not append.
Homophone move appends by default.
Third compound move in a row is blocked.
```

Add a concrete compound-streak regression test:

```ts
const path = [
  acceptedCompoundMove1,
  acceptedCompoundMove2,
];

const thirdCompound = candidateCompoundMove;

expect(canAcceptMove(path, thirdCompound, settings)).toEqual({
  accepted: false,
  reason: "compound-streak-exceeded",
});
```

The concrete test fixtures can be synthetic `MoveValidation` objects. The goal is to verify path logic, not phonetic scoring.

### Phase 12 — Suggestions

Implement suggestion engine with:

- cached dictionary transcriptions;
- dynamic length filter;
- bounded edit distance;
- sorting by class/cost/meaningful changes.

Acceptance:

```ts
expect(getMaxLengthDelta(defaultSettings)).toBe(2);
```

Manual product checks:

```txt
Given gioco, suggestions include geco if present.
Given pala, suggestions include palla if present.
Given scena, suggestions may include schema but marked borderline.
```

### Phase 13 — UI integration

Build single-page testing UI:

- starting word input;
- phoneme display;
- path view;
- candidate verification flow;
- debug comparison;
- suggestions panel;
- settings panel;
- onboarding box;
- custom-word panel.

Acceptance:

```txt
User can start a path.
User can verify a candidate.
User can inspect cost and changes.
User can accept valid moves.
User can reject/reset.
User can generate suggestions.
User can tune thresholds.
User can add/export custom words.
```

---

## 32. Canonical Product Examples

### 32.1 gioco -> geco

```txt
gioco -> geco

GD O K O
GD E K O

O -> E

cost = 1
class = smooth
compound = false
```

### 32.2 pala -> palla

```txt
pala -> palla

P A L A
P A LL A

L -> LL

cost = 1
class = smooth
compound = false
```

### 32.3 mamma -> manna

```txt
mamma -> manna

M A MM A
M A NN A

MM -> NN

cost = 1
class = smooth
compound = false
```

### 32.4 cane -> pane

```txt
cane -> pane

K A N E
P A N E

K -> P

cost = 1.5
class = valid
compound = false
```

### 32.5 pala -> pila

```txt
pala -> pila

P A L A
P I L A

A -> I

cost = 1.5
class = valid
compound = false
```

### 32.6 cena -> scena

```txt
cena -> scena

CD E N A
SC E N A

CD -> SC

cost = 1.5
class = valid
compound = false
```

### 32.7 schema -> schiena

```txt
schema -> schiena

S K E M A
S K J E N A

insert J
M -> N

cost = 2.5
class = borderline
compound = true
```

### 32.8 scena -> schema

```txt
scena -> schema

SC E N A
S K E M A

SC -> S K
N -> M

cost = 3.5
class = borderline
compound = true
```

### 32.9 scena -> schiena

```txt
scena -> schiena

SC E N A
S K J E N A

too much in one move

class = invalid
```

### 32.10 ho -> o

```txt
ho -> o

O
O

zero distance
homophone move
allowed by default
```

### 32.11 gioco -> gioco

```txt
gioco -> gioco

zero distance
same orthographic word
blocked
```

---

## 33. Regression Tests Summary

At minimum, add test files for:

```txt
normalizeWord.test.ts
orthographyToGamePhonemes.test.ts
substitutionCost.test.ts
symmetricCostLookup.test.ts
clusterRespelling.test.ts
weightedEditDistance.test.ts
validateMove.test.ts
homophones.test.ts
suggestions.test.ts
pathRules.test.ts
```

### 33.1 Property-style sanity tests

For every dictionary word:

```ts
for (const word of dictionary) {
  const result = validateMove(word, word, settings);

  expect(result.cost).toBe(0);
  expect(result.zeroDistance).toBe(true);
  expect(result.sameOrthographicWord).toBe(true);
  expect(result.acceptAsProgress).toBe(false);
}
```

For every token pair:

```ts
for (const a of ALL_TOKENS) {
  for (const b of ALL_TOKENS) {
    expect(getSubstitutionCost(a, b, settings))
      .toBe(getSubstitutionCost(b, a, settings));
  }
}
```

For every token:

```ts
for (const token of ALL_TOKENS) {
  expect(getSubstitutionCost(token, token, settings)).toBe(0);
}
```

---

## 34. Explicit Non-Goals

Do not implement:

```txt
SLM
LLM
neural embeddings
FAISS
automatic full path solving
multiplayer
database persistence
login
full IPA
full Italian morphology
perfect stress handling
perfect syllabification
```

However, keep the architecture extensible for future functions:

```ts
phoneticEmbedding(word)
nearestNeighbors(word)
solvePath(start, target)
rerankSuggestionsWithTarget(current, target)
```

---

## 35. Future Roadmap

### v0.1

- Larger dictionary.
- Better custom-word workflow.
- Exception table improvements.
- User feedback buttons:
  - too strict;
  - correct;
  - too permissive.

### v0.2

- Target word support.
- Suggestions ranked by progress toward target.
- Basic graph/pathfinding.

### v0.3

- Manual phonetic embeddings based on feature vectors.
- Faster nearest-neighbor candidate generation.

### v0.4

- Dataset from user judgments.
- Contrastive or Siamese phonetic encoder.
- Learned phonetic similarity as a reranker.

### v1

- Proper game mode.
- Daily challenges.
- Shareable paths.
- Score system.
- Optional stricter/looser rulesets.

---

## 36. Implementation Principle

The validator must not become a pile of hardcoded example exceptions.

Runtime logic should be:

```txt
normalize word
→ transcribe to game phonemes
→ compute weighted edit distance with matrix + special cluster rules
→ classify by tunable thresholds
→ compute compoundness independently
→ compute homophone/no-op status
→ compute dictionary status separately
→ explain the alignment
```

Examples belong in tests, not in runtime conditionals.

The v0 succeeds if the phonetic engine is:

```txt
deterministic
tunable
explainable
covered by regression tests
not dependent on hardcoded word-pair exceptions
```

The three most important functions are:

```ts
orthographyToGamePhonemes(word)
validateMove(fromWord, toWord, settings)
suggestNextWords(currentWord, dictionary, settings)
```

Everything else is UI around these three functions.
