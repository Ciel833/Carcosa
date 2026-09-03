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
(function () {
  const g = (typeof globalThis !== 'undefined') ? globalThis : self;
  const ns = g.CthulhuCore || (g.CthulhuCore = {});

  const trieCache = new WeakMap();

  function buildTrie(tokens) {
    const root = { children: new Map(), index: -1 };
    for (let idx = 0; idx < tokens.length; idx++) {
      const token = tokens[idx].toLowerCase();
      let node = root;
      for (const ch of token) {
        let next = node.children.get(ch);
        if (!next) {
          next = { children: new Map(), index: -1 };
          node.children.set(ch, next);
        }
        node = next;
      }
      node.index = idx;
    }
    return root;
  }

  const isWhitespace = (ch) => /\s/u.test(ch);

  /**
   * Parse ciphertext back into digit indices.
   * Strip chars (delimiters + whitespace) are transparent: they may appear
   * anywhere — between tokens or even inside one (line-wrap split a name) —
   * and never affect the match. Throws on any other unknown character.
   */
  function tokenize(text, tokens, delimiters) {
    const stripSet = new Set(delimiters);
    let trie = trieCache.get(tokens);
    if (!trie) {
      trie = buildTrie(tokens);
      trieCache.set(tokens, trie);
    }
    const lower = text.toLowerCase();
    const digits = [];
    let i = 0;
    while (i < lower.length) {
      const ch = lower[i];
      // «…» regions are fully transparent: the tokenizer skips the whole
      // region (particles such as «fhtagn» may use content letters). A stray
      // unbalanced '«' or '»' is harmless (it is in the strip set below).
      if (ch === '«') {
        const close = lower.indexOf('»', i + 1);
        i = close === -1 ? lower.length : close + 1;
        continue;
      }
      if (isWhitespace(ch) || stripSet.has(ch)) { i++; continue; }
      let node = trie;
      let j = i;
      let matched = -1;
      while (j < lower.length) {
        const c = lower[j];
        // «…» regions are transparent to matching as well — otherwise the walk
        // would stop on a particle's letter (e.g. the 'w' of «wgahn») and leave
        // the outer loop on an unrecognized char.
        if (c === '«') {
          const close = lower.indexOf('»', j + 1);
          j = close === -1 ? lower.length : close + 1;
          continue;
        }
        if (isWhitespace(c) || stripSet.has(c)) { j++; continue; } // strippable chars are transparent to matching
        const next = node.children.get(c);
        if (!next) break;
        node = next;
        j++;
        if (node.index !== -1) matched = node.index;
      }
      if (matched === -1) {
        const bad = lower[i];
        const snippet = lower.slice(Math.max(0, i - 10), i + 10);
        throw new Error(`unrecognized symbol '${bad}' near position ${i} ("${snippet}")`);
      }
      digits.push(matched);
      i = j;
    }
    return digits;
  }

  /** Map digit indices to their canonical token spellings. */
  function digitsToTokens(digits, tokens) {
    return digits.map((d) => {
      if (d < 0 || d >= tokens.length) {
        throw new RangeError(`digit ${d} out of range for a ${tokens.length}-token table`);
      }
      return tokens[d];
    });
  }

  const WORD_PATTERN = [3, 2, 3, 4, 2, 3];

  /** R'lyehian: syllables joined into pseudo-words with apostrophes. */
  function formatRlyehian(digits, tokens) {
    const syllables = digitsToTokens(digits, tokens);
    const words = [];
    let i = 0;
    let wi = 0;
    while (i < syllables.length) {
      const len = WORD_PATTERN[wi % WORD_PATTERN.length];
      const word = syllables.slice(i, i + len).join("'");
      words.push(word);
      i += len;
      wi++;
    }
    return words.join(' ');
  }

  /** Deep One: syllables paired into capitalized phonetic bursts. */
  function formatDeepOne(digits, tokens) {
    const syllables = digitsToTokens(digits, tokens);
    const bursts = [];
    for (let i = 0; i < syllables.length; i += 2) {
      let s = syllables[i];
      if (i + 1 < syllables.length) s += syllables[i + 1];
      bursts.push(s.charAt(0).toUpperCase() + s.slice(1));
    }
    return bursts.join(' ');
  }

  /**
   * Elder Gods: litany style — each name followed by '!', every 5th name
   * separated by ' · ' instead, ending with a definitive '!'.
   */
  function formatGods(digits, tokens) {
    const names = digitsToTokens(digits, tokens);
    const parts = [];
    for (let i = 0; i < names.length; i++) {
      parts.push(names[i]);
      if (i % 5 === 4) {
        parts.push(' · ');
      } else {
        parts.push(i + 1 < names.length ? '! ' : '!');
      }
    }
    return parts.join('');
  }

  /*
   * Generic grammar renderer for the 'prose' style.
   *
   * Pure visualization over the SAME digit stream the verse formatters use.
   * Decode never depends on it: every mark it emits (affix letters, marks,
   * «…» particles) is added to the mode's strippable set, so a prose
   * ciphertext tokenizes back to the identical digit sequence. Rules are
   * deterministic — seeded by digit values — so identical input yields
   * identical prose.
   *
   * Word shaping: 2-3 content syllables combine into a pseudo-word; each word
   * takes a part-of-speech role from a repeated clause pattern (noun, verb,
   * noun, adjective, verb, noun …) and gets the role's affix suffix. Words
   * group into clauses (2 words) and sentences (2 clauses); «…» particles are
   * seeded-sparse (they occur but don't saturate every slot): a sentence may
   * open with a particle, clauses may join with a particle + mark, and a
   * sentence often ends with a final mark + «…» invocation.
   */
  function formatProse(digits, tokens, prose) {
    const affixOf = (role) => (prose.affix && prose.affix[role]) || '';
    const pick = (arr, seed) => arr[seed % arr.length];
    const capFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const has = (arr) => Array.isArray(arr) && arr.length > 0;

    const GLUE = [',', ';', '—'];
    const FINAL = ['.', '!', '?'];
    const ROLE_CYCLE = ['noun', 'verb', 'noun', 'adj', 'verb', 'noun'];
    const WORDS_PER_CLAUSE = 2;
    const CLAUSES_PER_SENTENCE = 2;

    // 1) syllables → pseudo-words with POS affixes.
    const words = [];
    let i = 0;
    while (i < digits.length) {
      // Syllable modes group 2-3 syllables into a word; the name-based Elder
      // Gods register keeps one name per word (fully distinct lexemes).
      const seed = digits[i];
      const size = prose.affix ? 2 + (seed % 2) : 1;
      const syls = digitsToTokens(digits.slice(i, i + size), tokens);
      i += size;
      const role = ROLE_CYCLE[words.length % ROLE_CYCLE.length];
      const text = prose.affix
        ? (syls.join('') + affixOf(role)).toLowerCase()
        : syls.join('');
      words.push({ text, seed: seed + words.length });
    }

    // 2) words → clauses → sentences (fixed rhythm).
    const clauses = [];
    for (let w = 0; w < words.length; w += WORDS_PER_CLAUSE) {
      clauses.push(words.slice(w, w + WORDS_PER_CLAUSE));
    }
    const sentences = [];
    for (let c = 0; c < clauses.length; c += CLAUSES_PER_SENTENCE) {
      sentences.push(clauses.slice(c, c + CLAUSES_PER_SENTENCE));
    }

    // 3) sentence rendering. Commas/semicolons attach to the preceding word
    //    (no space before); particles and em dashes keep their spaces.
    const NO_SPACE_BEFORE = new Set([',', ';', '.', '!', '?']);
    const out = [];
    for (const sentence of sentences) {
      const seed = sentence[0][0].seed;
      let str = (seed % 4 === 0 && has(prose.opener))
        ? '«' + pick(prose.opener, seed >>> 1) + '»'
        : '';
      let firstWord = true;
      sentence.forEach((clause, ci) => {
        clause.forEach((word, wj) => {
          if (str) str += ' ';
          if (firstWord) { str += capFirst(word.text); firstWord = false; }
          else str += word.text;
          if (wj === clause.length - 1) {
            if (ci < sentence.length - 1) {
              if ((seed + ci + wj) % 3 === 1 && has(prose.joiner)) {
                str += ' «' + pick(prose.joiner, seed + ci + wj) + '»';
              }
              str += GLUE[(seed + ci + wj) % GLUE.length];
            }
            if (ci === sentence.length - 1) {
              str += FINAL[seed % FINAL.length];
            }
          }
        });
      });
      if (seed % 2 === 0 && has(prose.closer)) {
        str += ' «' + pick(prose.closer, seed >>> 2) + '»';
      }
      out.push(str);
    }
    return out.join('\n\n');
  }

  const format = {
    tokenize,
    digitsToTokens,
    buildTrie,
    formatRlyehian,
    formatDeepOne,
    formatGods,
    formatProse
  };

  ns.format = format;
  if (typeof module === 'object' && module.exports) module.exports = format;
})();