# Cthulhu-Mythos-Cipher
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