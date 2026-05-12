# Heillo

Heillo is a static Next.js playtest app for an Italian phonetic word-transformation game. It validates moves by simplified game phonemes, exposes tunable thresholds, keeps local custom words, and ships with regression tests for the roadmap examples.

## Development

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

The production build is a static export configured for GitHub Pages at:

```txt
https://junjosick.github.io/Heillo/
```

## Dictionary Source

`public/dictionary.json` is generated from the MIT-licensed `franfranz/Word_Frequency_Lists_ITA` repository, using ItWaC-derived noun, verb, and adjective word-form CSV files:

- https://github.com/franfranz/Word_Frequency_Lists_ITA
- Source license: MIT
- Corpus attribution documented by the source project: ItWaC, Baroni, Bernardini, Ferraresi, and Zanchetta (2009)

Regenerate the dictionary with:

```bash
npm run build:dictionary
```

The generator filters to supported single Italian words, sorts by frequency, keeps roughly 10,000 entries, and force-includes the canonical roadmap and homophone examples.
