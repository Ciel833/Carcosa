'use strict';

/*
 * core/vocab/rlyehian.js — R'lyehian using the Deep One 256-syllable table.
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
      for (const coda of CODAS) tokens.push(onset + nucleus + coda);
    }
  }

  const prose = {
    affix: { noun: 'qy', adj: 'bf', verb: 'jz' },
    marks: "-~,.;:!?'—",
    opener: ['khth', 'mglh', 'dhsh'],
    joiner: ['wgh', 'ghuun', 'nhgh'],
    closer: ['nghth', 'ghuukth', 'wgmh']
  };

  const rlyehian = { tokens, delimiters: '', prose };
  ns.vocab = ns.vocab || {};
  ns.vocab.rlyehian = rlyehian;
  if (typeof module === 'object' && module.exports) module.exports = rlyehian;
})();
