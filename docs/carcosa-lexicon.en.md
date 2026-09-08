# Carcosa Root and Affix Lexicon

This is the English reference for Carcosa's roots, affixes, particles, and
punctuation. The original full HTML reference remains available at
[`carcosa-lexicon.html`](./carcosa-lexicon.html).

## Register overview

| Register | Description | Roots | Base | Expansion |
|---|---|---:|---:|---:|
| R'lyehian | Guttural vernacular | 256 syllables | 256 | about 5 chars/byte |
| Elder Gods | Scriptural litany | 32 names | 32 | about 11 chars/byte |

## R'lyehian

R'lyehian uses the former Deep One dictionary: heavy consonant onsets,
unnatural vowel nuclei, and closing nasals. Every root has the same length,
so the table is prefix-free. Base-256 digits map directly to bytes.

### Phoneme components

| Onsets | Nuclei | Codas |
|---|---|---|
| `kh`, `gh`, `sh`, `th` | `aa`, `ee`, `ii`, `oo`, `uu`, `ae`, `ai`, `au` | `g`, `n` |
| `mh`, `ng`, `dh`, `wg` | `ei`, `ou`, `oe`, `ui`, `ea`, `oi`, `ia`, `uo` | `g`, `n` |

```text
onset × nucleus × coda = 8 × 16 × 2 = 256
```

### Complete 256-root matrix

Each cell contains both roots for that onset+nucleus combination: the `g`
and `n` coda variants.

| onset \ nucleus | aa | ee | ii | oo | uu | ae | ai | au |
|---|---|---|---|---|---|---|---|---|
| `kh` | `khaag / khaan` | `kheeg / kheen` | `khiig / khiin` | `khoog / khoon` | `khuug / khuun` | `khaeg / khaen` | `khaig / khain` | `khaug / khaun` |
| `gh` | `ghaag / ghaan` | `gheeg / gheen` | `ghiig / ghiin` | `ghoog / ghoon` | `ghuug / ghuun` | `ghaeg / ghaen` | `ghaig / ghain` | `ghaug / ghaun` |
| `sh` | `shaag / shaan` | `sheeg / sheen` | `shiig / shiin` | `shoog / shoon` | `shuug / shuun` | `shaeg / shaen` | `shaig / shain` | `shaug / shaun` |
| `th` | `thaag / thaan` | `theeg / theen` | `thiig / thiin` | `thoog / thoon` | `thuug / thuun` | `thaeg / thaen` | `thaig / thain` | `thaug / thaun` |
| `mh` | `mhaag / mhaan` | `mheeg / mheen` | `mhiig / mhiin` | `mhoog / mhoon` | `mhuug / mhuun` | `mhaeg / mhaen` | `mhaig / mhain` | `mhaug / mhaun` |
| `ng` | `ngaag / ngaan` | `ngeeg / ngeen` | `ngiig / ngiin` | `ngoog / ngoon` | `nguug / nguun` | `ngaeg / ngaen` | `ngaig / ngain` | `ngaug / ngaun` |
| `dh` | `dhaag / dhaan` | `dheeg / dheen` | `dhiig / dhiin` | `dhoog / dhoon` | `dhuug / dhuun` | `dhaeg / dhaen` | `dhaig / dhain` | `dhaug / dhaun` |
| `wg` | `wgaag / wgaan` | `wgeeg / wgeen` | `wgiig / wgiin` | `wgoog / wgoon` | `wguug / wguun` | `wgaeg / wgaen` | `wgaig / wgain` | `wgaug / wgaun` |

| onset \ nucleus | ei | ou | oe | ui | ea | oi | ia | uo |
|---|---|---|---|---|---|---|---|---|
| `kh` | `kheig / khein` | `khoug / khoun` | `khoeg / khoen` | `khuig / khuin` | `kheag / khean` | `khoig / khoin` | `khiag / khian` | `khuog / khuon` |
| `gh` | `gheig / ghein` | `ghoug / ghoun` | `ghoeg / ghoen` | `ghuig / ghuin` | `gheag / ghean` | `ghoig / ghoin` | `ghiag / ghian` | `ghuog / ghuon` |
| `sh` | `sheig / shein` | `shoug / shoun` | `shoeg / shoen` | `shuig / shuin` | `sheag / shean` | `shoig / shoin` | `shiag / shian` | `shuog / shuon` |
| `th` | `theig / thein` | `thoug / thoun` | `thoeg / thoen` | `thuig / thuin` | `theag / thean` | `thoig / thoin` | `thiag / thian` | `thuog / thuon` |
| `mh` | `mheig / mhein` | `mhoug / mhoun` | `mhoeg / mhoen` | `mhuig / mhuin` | `mheag / mhean` | `mhoig / mhoin` | `mhiag / mhian` | `mhuog / mhuon` |
| `ng` | `ngeig / ngein` | `ngoug / ngoun` | `ngoeg / ngoen` | `nguig / nguin` | `ngeag / ngean` | `ngoig / ngoin` | `ngiag / ngian` | `nguog / nguon` |
| `dh` | `dheig / dhein` | `dhoug / dhoun` | `dhoeg / dhoen` | `dhuig / dhuin` | `dheag / dhean` | `dhoig / dhoin` | `dhiag / dhian` | `dhuog / dhuon` |
| `wg` | `wgeig / wgein` | `wgoug / wgoun` | `wgoeg / wgoen` | `wguig / wguin` | `wgeag / wgean` | `wgoig / wgoin` | `wgiag / wgian` | `wguog / wguon` |

### Affixes

| Affix | Part of speech | Example |
|---|---|---|
| `-qy` | noun | `khaag'khaagqy` |
| `-jz` | verb | `khaag'khaagjz` |
| `-bf` | adjective | `thiin'ghaag'shounbf` |

### Particles and punctuation

| Position | Condition | Particles |
|---|---|---|
| Sentence opener | `seed % 4 === 0` | `«khth»`, `«mglh»`, `«dhsh»` |
| Clause joiner | `(seed + ci + wj) % 3 === 1` | `«wgh»`, `«ghuun»`, `«nhgh»` |
| Sentence closer | `seed % 2 === 0` | `«nghth»`, `«ghuukth»`, `«wgmh»` |

Grammar marks are `- ~ , . ; : ! ? ' —`. Apostrophes join syllables
visually and can be disabled with `conjunction: false`.

## Elder Gods

Elder Gods uses 32 divine names as base-32 roots. Names are already complete
words, so this register has no affixes.

| Digit | Name | Digit | Name | Digit | Name | Digit | Name |
|---:|---|---:|---|---:|---|---:|---|
| 0 | Cthulhu | 8 | Tsathoggua | 16 | Ithaqua | 24 | Ossadogwah |
| 1 | Yog-Sothoth | 9 | Yig | 17 | Cthylla | 25 | Rhan-Tegoth |
| 2 | Azathoth | 10 | Ghatanothoa | 18 | Abhoth | 26 | Tulzscha |
| 3 | Nyarlathotep | 11 | Nodens | 19 | Ubbo-Sathla | 27 | Byatis |
| 4 | Shub-Niggurath | 12 | Y'golonac | 20 | Mordiggian | 28 | Gnophkeh |
| 5 | Hastur | 13 | Gla'aki | 21 | Nyogtha | 29 | Zathog |
| 6 | Dagon | 14 | Eihort | 22 | Zhar | 30 | Kthanid |
| 7 | Hydra | 15 | Vulthoom | 23 | Lloigor | 31 | Cxaxukluth |

Particles are `«Iä»`, `«Nyarlat»`, `«R'lyeh»`, `«Sothoth»`, `«ftaghn»`,
`«fhtagn»`, and `«cthulhu»`. Since `-` and `'` occur inside names, this
register uses `!` and `·` as explicit delimiters.

## Reversibility

The encoder writes a five-digit length header followed by the payload digits.
The decoder transparently ignores whitespace, delimiters, affixes,
punctuation, and complete `«…»` particle regions. These are presentation
layers only; disabling particles changes appearance, never decoded bytes.
