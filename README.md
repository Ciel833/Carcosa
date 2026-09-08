# Carcosa
[中文文档](./README.zh-CN.md)

Encode boring text into unnameable eldritch chants.

<a href="https://ciel833.github.io/Carcosa/"><strong>▶ Open the Frontend Demo</strong></a>

> When human language fails to bear secrets, only the whispers of the Great Old Ones can guard the truth for you.

A **reversible** Cthulhu-Mythos cipher toy: any UTF-8 input (English, emoji, binary files etc.) can be encoded into two "Lovecraftian registers" — and decoded back losslessly. An optional password adds keystream obfuscation. Output comes in two styles:

- **Prose** *(default)* — a grammar engine turns the cipher's digits into full pseudo-language articles with parts of speech (`noun / verb / noun / adjective …`), particles and punctuation, the way [魔曰 / Abracadabra](https://github.com/SheepChef/Abracadabra) renders sentences;
- **Verse** *(original)* — the chant-style one-word-per-format of the first release.

| Mode | Register | Table | Prose look |
|---|---|---|---|
| **R'lyehian** | guttural vernacular | 256 syllables | `«khth» Khaag'khaagqy khaag'khaagjz «ghuun»; khean'shoeg'thuugqy thiin'ghaag'shounbf. «nghth»` |
| **Elder Gods** | scriptural litany | 32 names | `«Iä» Cthulhu Cthulhu «Sothoth»; Cthulhu Cthulhu. «fhtagn»` |

## How it works

One pipeline, two vocabularies:

```
plaintext ──► UTF-8 bytes ──► [optional] password keystream XOR ──►
            length header (W=5 base-N digits) ++ base-N digits of the value ──►
            token lookup ──► mode formatter ──► ciphertext

decode: scan past the mode's delimiters + prose marks + whitespace and skip
        complete «…» regions ──► prefix-free trie greedy match ──►
        read the first W symbols → L ──► remainder → value ──► right-justify to exactly L bytes ──►
        [optional] un-XOR ──► plaintext
```

Key design decisions:

- **The length header lives in digit space, not inside the BigInt.** `bytesToBigInt` drops leading zero bytes, so the payload byte count `L` is carried as W=5 *fixed-width base-N digits prepended to the token stream*. On decode, the bytes are right-justified (zero-padded on the left) to exactly `L` bytes — exact round-trip even for leading-zero, all-zero, and binary payloads.
- **Prefix-free tables.** No token is a prefix of another within a mode, so formatting marks (apostrophes / spaces / `!` / `·`) are purely visual. During parsing those marks are **transparent to matching** — they may even appear *inside* a token (e.g. a line-wrap splitting `Yog-Sothoth`) without affecting the result. Copy-paste-mangled ciphertext still decodes.
- **Elder Gods delimiter discipline.** `-` and `'` are legal token-internal characters (`Yog-Sothoth`, `Y'golonac`, `Gla'aki`), so that mode's delimiters must be `!` and `·` — characters no name contains — and parsing never strips `-` / `'`.
- **Password keystream.** keystream byte *i* = `FNV1a32(password ∥ big-endian u32 i) & 0xff` — position-mixed, with `Math.imul` keeping Node and browsers bit-identical. Empty password = no obfuscation.

## One language, two registers

Are the two modes one language? **Yes — one pipeline, one grammar engine, two phonetic registers.** Every mode runs the identical byte pipeline; the only difference is the table that maps digits to phonemes. The shared grammar engine renders both with the same sentence structure.

- **R'lyehian — the guttural vernacular register.** It uses the former Deep One dictionary: heavy onset clusters, unearthly vowel nuclei and closing nasals generate 256 equal-length syllables. Base 256 maps each syllable directly to one byte.
- **Elder Gods — the scriptural register.** Its lexemes are 32 real divine names (Cthulhu, Yog-Sothoth, Azathoth, Nyarlathotep…). Because every name is already a complete word, its grammar uses **particles + punctuation only** (no word-forming affixes that would need unused letters): `«Iä» Cthulhu Cthulhu «Sothoth»; Cthulhu Yog-Sothoth. «fhtagn»`.

## Prose — a grammar engine over the same digits

The v1 output was one *format* — monotonous, as you noticed. v2 adds a generative grammar layer, deterministic and **completely strippable**, so it costs nothing on decode:

1. **Word shaping.** Content syllables concatenate into pseudo-words of 2–3 syllables, joined with the conjunction apostrophe the canon chant uses — `phan'phanzy`, like `Ph'nglui` / `wgah'nagl`. Elder Gods is the exception: one divine name per word, and `'` is token-internal there (`Y'golonac`), so no apostrophes are added. No hand-curated vocabulary — every possible digit stream yields words, so the language is *productive*, not a fixed dictionary.
2. **Parts of speech.** Each word gets a role from a repeating clause pattern — `noun → verb → noun → adjective → verb → noun …` — marked by R'lyehian affix suffixes `-zy/-js/-cq`.
3. **Particles.** Function-word phonemes rendered in `«…»` — `«mglw»` / `«Iä»` open a sentence, `«wgahn»` / `«Sothoth»` join clauses, `«fhtagn»` / `«cthulhu»` close it. The brackets mark a **transparent region**: the tokenizer skips the whole `«…»` span. Particles can be switched off entirely — `particles: false` (JS API), `-P/--no-particles` (CLI), or the UI toggle.
4. **Punctuation.** Clauses join with `,` `;` `—`; sentences end in `.` `!` `?`. Selection of openers/joiners/closers and final marks is **seeded by the digit values themselves**, so identical input produces the identical article (deterministic), yet different inputs read differently (organic).

**Why this keeps the cipher reversible:** the grammar layer is pure visualization over the same digit stream the verse style uses. Decode never parses grammar — it strips the affix letters and marks as transparent characters and skips `«…»` regions, then greedy-matches tokens exactly as before. None of the decode math changes; old verse ciphertexts decode through the same code path.

Example article (R'lyehian, prose, no password):

```
«mglw» Phan'phanzy phan'phanjs «wgahn»; phog'phun'mglathzy phuth'nguth'ngagcq. «fhtagn»

Ngug'mglagjs phug'phagzy, phog'ngoth'mglagzy? «fhtagn»
```

## Security disclaimer

**Toy-grade obfuscation, not encryption.** Do not use for real secrets:

- Saltless. Same password + same plaintext ⇒ same ciphertext (deliberate: it's a *ritual*, not a stream cipher).
- Not hardened against cryptanalysis; positional patterns leak structure across repeated ciphertexts.
- Truncating/tampering with ciphertext in the BigInt modes yields plausible-but-wrong plaintext.

## Limits & performance

- Single-input cap (W=5 header): R'lyehian `256⁵−1 ≈ 1.1 TB`; Elder Gods `32⁵−1 ≈ 33.5 MB` (practically bounded by memory). Oversized input throws.
- Output expansion: R'lyehian ≈ 5, Elder Gods ≈ 11.
- Performance: a few kilobytes are instant; the BigInt modes (R'lyehian / Elder Gods) get slower on large files — fine for a toy.

## Development

Zero dependencies; Node's built-in test runner:

```bash
npm test        # = node --test
```

Coverage: full round-trips for every mode × with/without password across Chinese, emoji (4-byte UTF-8), combining marks, RTL, NUL, leading-zero, all-`0xFF`, empty, and header-boundary payloads; vocab properties (table size, prefix-freeness, delimiter discipline); mangled-ciphertext robustness; keystream determinism; garbage rejection; a 1 MB perf smoke. Grammar layer: prose/verse cross-style equivalence, per-mode alphabet safety (affix letters + marks never collide with tokens), prose determinism, mangled-prose robustness, and default-prose/verse CLI style tests.

## Planned features

Future releases are planned to add:

- Finer modifier-density controls (an on/off particle toggle is now available)
- Sentence-randomness controls
- Rotor encryption

## License

MIT © 2026 Ciel