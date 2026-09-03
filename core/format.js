'use strict';

/*
 * core/format.js — token matching (trie) and per-mode ciphertext formatters.
 *
 * Contract: formatting is PURE VISUALIZATION. Reversibility is guaranteed at
 * the digit level, not the format level:
 *   - the tokenizer strips the mode's delimiters (explicit chars) plus ALL
 *     whitespace, then walks a lowercase trie with greedy longest-prefix
 *     matching — so decorations (apostrophes, spacing, line wrapping, even
 *     copy-paste mangling) never affect the decoded bytes;
 *   - the vocab tables are prefix-free, so greedy matching is unambiguous.
 *
 * Besides the verse delimiters, the tokenizer treats «…» regions as fully
 * transparent (prose particles like «fhtagn» live there) and strips a mode's
 * prose grammar marks (part-of-speech affix letters, punctuation) — so prose
 * ciphertexts tokenize back to the same digit stream without any decode logic
 * knowing about grammar.
 *
 * Tolerated mangling (tested): extra spaces, newlines, wrapped lines,
 * title-casing, «…» particles, punctuation, and any inserted delimiter chars.
 */