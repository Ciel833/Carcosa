# Carcosa
Encode boring text into unnameable eldritch chants.

> When human language fails to bear secrets, only the whispers of the Great Old Ones can guard the truth for you.

A **reversible** Cthulhu-Mythos cipher toy: any UTF-8 input (English, emoji, binary files etc.) can be encoded into three "Lovecraftian languages" — and decoded back losslessly. An optional password adds keystream obfuscation. Output comes in two styles:

- **Prose** *(default)* — a grammar engine turns the cipher's digits into full pseudo-language articles with parts of speech (`noun / verb / noun / adjective …`), particles and punctuation, the way [魔曰 / Abracadabra](https://github.com/SheepChef/Abracadabra) renders sentences;
- **Verse** *(original)* — the chant-style one-word-per-format of the first release.

| Mode | Register | Table | Prose look |
|---|---|---|---|
| **R'lyehian** | sacred chant | 27 syllables | `«mglw» Phanphanzy phanphagjs «wgahn»; ngogmglanzy mglothngogcq. «fhtagn»` |
| **Deep One** | guttural vernacular | 256 syllables | `«khth» Khaagkhaagqy khaagkhaagjz «ghuun»; kheanshuundheenqy thiinghaagthoegbf. «nghth»` |
| **Elder Gods** | scriptural litany | 32 names | `«Iä» Cthulhu Cthulhu «Sothoth»; Cthulhu Yog-Sothoth. «fhtagn»` |

## How it works

One pipeline, three vocabularies:

```
plaintext ──► UTF-8 bytes ──► [optional] password keystream XOR ──►
            length header (W=5 base-N digits) ++ base-N digits of the value ──►
            token lookup ──► mode formatter ──► ciphertext

decode: strip the mode's delimiters + prose marks + «…» regions + whitespace ──►
        prefix-free trie greedy match ──►
        read the first W symbols → L ──► remainder → value ──► right-justify to exactly L bytes ──►
        [optional] un-XOR ──► plaintext
```

## Prose — a grammar engine over the same digits

The v1 output was one *format* — monotonous, as you noticed. v2 adds a generative grammar layer, deterministic and **completely strippable**, so it costs nothing on decode:

1. **Word shaping.** Content syllables concatenate into pseudo-words of 2–3 syllables (Elder Gods: one divine name per word). No hand-curated vocabulary — every possible digit stream yields words, so the language is *productive*, not a fixed dictionary.
2. **Parts of speech.** Each word gets a role from a repeating clause pattern — `noun → verb → noun → adjective → verb → noun …` — marked by a register-specific affix suffix: R'lyehian `-zy/-js/-cq`, Deep One `-qy/-jz/-bf`. This answers “名词/形容词/动词”: affixes `zy`/`cq` and `qy`/`bf` are noun/adjective, `js`/`jz` are verb markers.
3. **Particles.** Function-word phonemes rendered in `«…»` — `«mglw»` / `«khth»` / `«Iä»` open a sentence, `«wgahn»` / `«ghuun»` / `«Sothoth»` join clauses, `«fhtagn»` / `«nghth»` / `«cthulhu»` close it. The brackets mark a **transparent region**: the tokenizer skips the whole `«…»` span, so particles may freely reuse chant letters (`fhtagn`) that also appear in content tokens.
4. **Punctuation.** Clauses join with `,` `;` `—`; sentences end in `.` `!` `?`. Selection of openers/joiners/closers and final marks is **seeded by the digit values themselves**, so identical input produces the identical article (deterministic), yet different inputs read differently (organic).

**Why this keeps the cipher reversible:** the grammar layer is pure visualization over the same digit stream the verse style uses. Decode never parses grammar — it strips the affix letters and marks as transparent characters and skips `«…»` regions, then greedy-matches tokens exactly as before. None of the decode math changes; old verse ciphertexts decode through the same code path.

Example article (R'lyehian, prose, no password):

```
«mglw» Phanphanzy phanphagjs «wgahn»; phunphugmglunzy ngathphagcq. «fhtagn»

Nguthmgluthnguthjs ngonphanzy «mglah»; mglagmglonzy phothphathjs. «fhtagn»
```

## Security disclaimer

**Toy-grade obfuscation, not encryption.** Do not use for real secrets:

- Saltless. Same password + same plaintext ⇒ same ciphertext (deliberate: it's a *ritual*, not a stream cipher).
- Not hardened against cryptanalysis; positional patterns leak structure across repeated ciphertexts.
- Truncating/tampering with ciphertext in the BigInt modes yields plausible-but-wrong plaintext (Deep One mode rejects it via its exact byte-count rule).

## Limits & performance

- Single-input cap (W=5 header): R'lyehian `27⁵−1 ≈ 14.3 MB`; Elder Gods `32⁵−1 ≈ 33.5 MB`; Deep One `256⁵−1 ≈ 1.1 TB` (practically bounded by BigInt/memory). Oversized input throws.
- Output expansion: Deep One ≈ 5 chars/byte, R'lyehian ≈ 8, Elder Gods ≈ 11.
- Performance: a few kilobytes are instant; 1 MB Deep One ~0.3–3 s; the BigInt modes (R'lyehian / Elder Gods) get slower on large files — fine for a toy.