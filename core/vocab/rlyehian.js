'use strict';

/*
 * core/vocab/rlyehian.js — R'lyehian, 27 syllables (base 3 × 3 × 3).
 *
 * Lovecraft notes in "The Call of Cthulhu" that the R'lyehian numeral system
 * is ternary. This table honors that: every syllable is placed in a 3×3×3
 * grid — onset(3) × nucleus(3) × coda(3) — built from phonemes that appear in
 * the famous incantation "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn".
 * 27 = 3³, so digit↔cell mapping keeps the ternary structure throughout.
 *
 * Tokens contain no apostrophe and no whitespace; the formatter joins them
 * into pseudo-words with apostrophes ("ph'an phog'ngoth"), which are pure
 * visual separators stripped before matching.
 */
(function () {
  const g = (typeof globalThis !== 'undefined') ? globalThis : self;
  const ns = g.CthulhuCore || (g.CthulhuCore = {});

  const ONSETS = ['ph', 'mgl', 'ng'];   // from "ph'nglui", "mglw'nafh", "wgah'nagl"
  const NUCLEI = ['a', 'u', 'o'];       // R'lyehian vowel shades
  const CODAS = ['n', 'g', 'th'];       // guttural endings ("-n", "-g", "-th")

  const tokens = [];
  for (const onset of ONSETS) {
    for (const nucleus of NUCLEI) {
      for (const coda of CODAS) {
        tokens.push(onset + nucleus + coda);
      }
    }
  }

  // Apostrophe is the only explicit delimiter; whitespace is stripped generically.
  const delimiters = "'";

  /*
   * Prose grammar config (the 'prose' output style).
   *
   * Word shaping: content syllables concatenate into pseudo-words, and each
   * word is marked for a part-of-speech role with a suffix (affix). Particles
   * (openers / joiners / closers) are rendered inside «…» brackets, which the
   * tokenizer skips as a transparent region — so particles may use canonical
   * chant letters (f/t/h/a/g/n) freely.
   *
   * Correctness constraint (tested): every character of affix.* and marks must
   * NOT occur in any content token. R'lyehian tokens use only
   * {a,g,h,l,m,n,o,p,t,u}, so the affixes below use letters from the remaining
   * alphabet {b,c,d,e,f,i,j,k,q,r,s,v,w,x,y,z}, and marks are punctuation.
   */
  const prose = {
    affix: { noun: 'zy', adj: 'cq', verb: 'js' },
    marks: "-~,.;:!?—",
    opener: ['mglw', 'phng', 'ngah'],
    joiner: ['mglah', 'wgahn'],
    closer: ['fhtagn', 'wgahnagl', 'rlyeh']
  };

  const rlyehian = { tokens, delimiters, prose };
  ns.vocab = ns.vocab || {};
  ns.vocab.rlyehian = rlyehian;
  if (typeof module === 'object' && module.exports) module.exports = rlyehian;
})();