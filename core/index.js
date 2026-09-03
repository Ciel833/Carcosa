'use strict';

/*
 * core/index.js — the cipher pipeline, assembled as one public API.
 *
 * Pipeline (encode):
 *   bytes ──► [optional] password keystream XOR ──►
 *              length header (W base-N digits) ++ base-N digits of the value ──►
 *              token lookup ──► mode formatter ──► ciphertext string
 *
 *   decode: tokenize (strip delimiters + whitespace, trie match) ──►
 *           read W header digits → L ──► body digits → value ──►
 *           right-justify to exactly L bytes ──► [optional] un-XOR ──► Uint8Array
 *
 * BigInt is available in every modern browser and Node, so the same code runs
 * in both. Base 256 (deepone) takes a fast path: its digits ARE the bytes, so
 * no BigInt conversion is needed.
 *
 * API (works in Node via require, in browsers as the global `CthulhuCipher`):
 *   encodeBytes(bytes, {mode, password})  → ciphertext string
 *   decode(text, {mode, password})        → Uint8Array
 *   encodeText(text, opts) / decodeText(text, opts)  → string conveniences
 */
(function () {
  const g = (typeof globalThis !== 'undefined') ? globalThis : self;
  const ns = g.CthulhuCore || (g.CthulhuCore = {});

  let base, prng, format, vocab;
  if (typeof module === 'object' && module.exports) {
    base = require('./base');
    prng = require('./prng');
    format = require('./format');
    vocab = {
      rlyehian: require('./vocab/rlyehian'),
      deepone: require('./vocab/deepone'),
      gods: require('./vocab/gods')
    };
  } else {
    base = ns.base;
    prng = ns.prng;
    format = ns.format;
    vocab = ns.vocab;
  }

  const W = 5; // fixed width (in base-N digits) of the length header

  const MODES = {
    rlyehian: {
      base: 27,
      tokens: vocab.rlyehian.tokens,
      delimiters: vocab.rlyehian.delimiters,
      prose: vocab.rlyehian.prose,
      formatter: format.formatRlyehian
    },
    deepone: {
      base: 256,
      tokens: vocab.deepone.tokens,
      delimiters: vocab.deepone.delimiters,
      prose: vocab.deepone.prose,
      formatter: format.formatDeepOne
    },
    gods: {
      base: 32,
      tokens: vocab.gods.tokens,
      delimiters: vocab.gods.delimiters,
      prose: vocab.gods.prose,
      formatter: format.formatGods
    }
  };

  const STYLE_SET = { verse: true, prose: true };

  /**
   * Characters a prose ciphertext may contain that carry no data: «» brackets
   * (transparent regions), the mode's grammar marks, and every part-of-speech
   * affix letter. Unioned into the decode strip set so verse and prose outputs
   * both decode through the same path.
   */
  function proseStrippable(proseDef) {
    let s = '«»' + (proseDef.marks || '');
    const af = proseDef.affix;
    if (af) {
      for (const k of ['noun', 'adj', 'verb']) {
        if (typeof af[k] === 'string') s += af[k];
      }
    }
    return s;
  }

  function utf8Bytes(s) {
    return new TextEncoder().encode(s);
  }

  function getMode(mode) {
    if (!Object.prototype.hasOwnProperty.call(MODES, mode)) {
      throw new Error(`unknown mode '${mode}' (available: ${Object.keys(MODES).join(', ')})`);
    }
    return MODES[mode];
  }

  /** Largest payload (bytes) a mode's W-digit header can express. */
  function maxPayloadBytes(mode) {
    return Number(base.maxDigitsValue(getMode(mode).base, W));
  }

  /** Uint8Array → ciphertext string. */
  function encodeBytes(bytes, opts) {
    opts = opts || {};
    const cfg = getMode(opts.mode || 'rlyehian');
    const maxL = maxPayloadBytes(opts.mode || 'rlyehian');
    if (bytes.length > maxL) {
      throw new RangeError(
        `input of ${bytes.length} bytes exceeds ${opts.mode || 'rlyehian'} mode's ${maxL}-byte limit`);
    }
    const style = opts.style || 'prose'; // 'prose' (default) or 'verse'
    if (!STYLE_SET[style]) {
      throw new Error(`unknown style '${style}' (available: verse, prose)`);
    }
    const pwd = utf8Bytes(typeof opts.password === 'string' ? opts.password : '');
    const xored = prng.xorBytes(bytes, pwd);

    // Length header: the post-XOR byte count is exactly the payload length.
    const header = base.padDigits(xored.length, cfg.base, W);
    let body;
    if (cfg.base === 256) {
      body = Array.from(xored); // fast path: base-256 digits ARE the bytes
    } else {
      body = base.bigIntToDigits(base.bytesToBigInt(xored), cfg.base);
    }
    const digits = header.concat(body);
    return style === 'verse'
      ? cfg.formatter(digits, cfg.tokens)
      : format.formatProse(digits, cfg.tokens, cfg.prose);
  }

  /** Ciphertext string → Uint8Array. Throws on garbage the tokenizer can't read. */
  function decode(text, opts) {
    opts = opts || {};
    const cfg = getMode(opts.mode || 'rlyehian');
    const strippable = cfg.delimiters + proseStrippable(cfg.prose);
    const digits = format.tokenize(text, cfg.tokens, strippable);
    if (digits.length < W) {
      throw new Error('ciphertext too short to contain a length header');
    }
    const L = Number(base.digitsToBigInt(digits.slice(0, W), cfg.base));
    const maxL = maxPayloadBytes(opts.mode || 'rlyehian');
    if (L > maxL) {
      throw new RangeError(`encoded length ${L} exceeds the ${opts.mode || 'rlyehian'} mode limit (${maxL})`);
    }
    const bodyDigits = digits.slice(W);
    let xored;
    if (cfg.base === 256) {
      if (bodyDigits.length !== L) {
        throw new Error(`token count ${bodyDigits.length} does not match header length ${L}`);
      }
      xored = Uint8Array.from(bodyDigits);
    } else {
      const V = base.digitsToBigInt(bodyDigits, cfg.base);
      // right-justify restores the leading zero bytes BigInt conversion dropped
      xored = base.rightJustifyBytes(base.bigIntToBytes(V), L);
    }
    const pwd = utf8Bytes(typeof opts.password === 'string' ? opts.password : '');
    return prng.xorBytes(xored, pwd);
  }

  /** String → ciphertext string. */
  function encodeText(text, opts) {
    return encodeBytes(utf8Bytes(text), opts);
  }

  /** Ciphertext string → decoded string (invalid UTF-8 becomes U+FFFD). */
  function decodeText(text, opts) {
    return new TextDecoder('utf-8', { fatal: false }).decode(decode(text, opts));
  }

  const api = {
    encodeBytes,
    decode,
    encodeText,
    decodeText,
    maxPayloadBytes,
    W,
    styles: Object.keys(STYLE_SET),
    MODES,
    modenames: Object.keys(MODES)
  };

  ns.api = api;
  g.CthulhuCipher = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})();