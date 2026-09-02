'use strict';

/*
 * core/vocab/gods.js — Elder God names, 32 tokens.
 *
 * A curated pantheon of Great Old Ones and Elder Gods, encoded as a litany
 * ("Cthulhu! Yog-Sothoth! Azathoth · Nyarlathotep …"). Base 32 keeps the
 * table curated (not templated): every name is a real name from the mythos.
 *
 * Delimiter rules (critical for reversibility):
 *   - '-' and '\'' ARE legal inside tokens (Yog-Sothoth, Y'golonac, Gla'aki)
 *   - therefore the delimiters must be '!' and '·', which no name contains
 *   - no name contains whitespace (two-word names like "Quachil Uttaus"
 *     were excluded so space stays a safe separator)
 */
(function () {
  const g = (typeof globalThis !== 'undefined') ? globalThis : self;
  const ns = g.CthulhuCore || (g.CthulhuCore = {});

  const tokens = [
    'Cthulhu',
    'Yog-Sothoth',
    'Azathoth',
    'Nyarlathotep',
    'Shub-Niggurath',
    'Hastur',
    'Dagon',
    'Hydra',
    'Tsathoggua',
    'Yig',
    'Ghatanothoa',
    'Nodens',
    "Y'golonac",
    "Gla'aki",
    'Eihort',
    'Vulthoom',
    'Ithaqua',
    'Cthylla',
    'Abhoth',
    'Ubbo-Sathla',
    'Mordiggian',
    'Nyogtha',
    'Zhar',
    'Lloigor',
    'Ossadogwah',
    'Rhan-Tegoth',
    'Tulzscha',
    'Byatis',
    'Gnophkeh',
    'Zathog',
    'Kthanid',
    'Cxaxukluth'
  ];

  const delimiters = '!·';

  /*
   * Prose grammar config (the 'prose' output style).
   *
   * The entire lowercase alphabet appears inside the 32 names (all except
   * f/j/v), so letter suffixes are nearly unusable here — the Elder Gods
   * register achieves its grammar purely through punctuation and «…»-bracketed
   * liturgical particles ("Iä", "R'lyeh", "fhtagn"). Marks must not include
   * '-', "'", '!', '·' or whitespace: '-' and "'" are token-internal, and
   * '!' + '·' are already the verse delimiters.
   */
  const prose = {
    affix: null,
    marks: ",.;:?~—",
    opener: ['Iä', 'Nyarlat'],
    joiner: ["R'lyeh", 'Sothoth', 'ftaghn'],
    closer: ['fhtagn', 'cthulhu']
  };

  const gods = { tokens, delimiters, prose };
  ns.vocab = ns.vocab || {};
  ns.vocab.gods = gods;
  if (typeof module === 'object' && module.exports) module.exports = gods;
})();