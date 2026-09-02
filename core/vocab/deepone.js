'use strict';

/*
 * core/vocab/deepone.js — Deep One syllables, 256 tokens (8×16×2).
 *
 * The Deep Ones' speech in "The Shadow over Innsmouth" is a guttural,
 * amphibian-sounding tongue built on heavy consonant clusters. This table
 * generates 256 equal-length (5-char) syllables from onset clusters ×
 * unearthly vowel nuclei × closing nasals/plosives.
 *
 * Equal length ⇒ automatic prefix-freeness: no token is a prefix of another,
 * so the formatter's spaces are pure visual separators. Base 256 also means
 * one ciphertext byte maps to exactly one syllable — the shortest output of
 * the three modes.
 */
(function () {
  const g = (typeof globalThis !== 'undefined') ? globalThis : self;
  const ns = g.CthulhuCore || (g.CthulhuCore = {});

  const ONSETS = ['kh', 'gh', 'sh', 'th', 'mh', 'ng', 'dh', 'wg'];
  const NUCLEI = [
    'aa', 'ee', 'ii', 'oo', 'uu',
    'ae', 'ai', 'au', 'ei', 'ou',
    'oe', 'ui', 'ea', 'oi', 'ia', 'uo'
  ];
  const CODAS = ['g', 'n'];

  const tokens = [];
  for (const onset of ONSETS) {
    for (const nucleus of NUCLEI) {
      for (const coda of CODAS) {
        tokens.push(onset + nucleus + coda);
      }
    }
  }

  // No explicit delimiter; space is handled as generic whitespace.
  const delimiters = '';

  /*
   * Prose grammar config (the 'prose' output style).
   *
   * Deep One syllables concatenate into pseudo-words and get a part-of-speech
   * suffix; openers/joiners/closers are «…»-bracketed particles (transparent
   * to the tokenizer). Deep One tokens use only {a,d,e,g,h,i,k,m,n,o,s,t,u,w},
   * so the affixes below are built from the remaining alphabet
   * {b,c,f,j,l,p,q,r,v,x,y,z}; marks are punctuation.
   */
  const prose = {
    affix: { noun: 'qy', adj: 'bf', verb: 'jz' },
    marks: "-~,.;:!?'—",
    opener: ['khth', 'mglh', 'dhsh'],
    joiner: ['wgh', 'ghuun', 'nhgh'],
    closer: ['nghth', 'ghuukth', 'wgmh']
  };

  const deepone = { tokens, delimiters, prose };
  ns.vocab = ns.vocab || {};
  ns.vocab.deepone = deepone;
  if (typeof module === 'object' && module.exports) module.exports = deepone;
})();