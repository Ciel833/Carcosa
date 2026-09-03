'use strict';

/*
 * core/base.js — BigInt ↔ bytes ↔ digits primitives.
 *
 * Everything in the cipher is built on number-system conversion. All
 * conversions here are MSB-first (most significant byte/digit first).
 *
 * Works as both a Node CJS module and a browser global:
 *   Node:    const { bytesToBigInt } = require('./base');
 *   Browser: CthulhuCore.base.bytesToBigInt(...)   (loaded via <script>)
 */
(function () {
  const g = (typeof globalThis !== 'undefined') ? globalThis : self;
  const ns = g.CthulhuCore || (g.CthulhuCore = {});

  const base = {
    /** Uint8Array (MSB-first) → BigInt. Empty input → 0n. */
    bytesToBigInt(bytes) {
      let n = 0n;
      for (let i = 0; i < bytes.length; i++) {
        n = n * 256n + BigInt(bytes[i]);
      }
      return n;
    },

    /** BigInt → minimal Uint8Array (MSB-first). 0n → empty array. */
    bigIntToBytes(n) {
      if (n < 0n) throw new RangeError('bigIntToBytes: negative value');
      if (n === 0n) return new Uint8Array(0);
      const parts = [];
      while (n > 0n) {
        parts.unshift(Number(n & 0xffn));
        n >>= 8n;
      }
      return new Uint8Array(parts);
    },

    /** Integer digit array (MSB-first) → BigInt. */
    digitsToBigInt(digits, baseRadix) {
      let n = 0n;
      for (let i = 0; i < digits.length; i++) {
        n = n * BigInt(baseRadix) + BigInt(digits[i]);
      }
      return n;
    },

    /** BigInt → minimal digit array (MSB-first). 0n → [0] (never empty). */
    bigIntToDigits(n, baseRadix) {
      if (n < 0n) throw new RangeError('bigIntToDigits: negative value');
      if (baseRadix <= 1) throw new RangeError('bigIntToDigits: radix must be > 1');
      if (n === 0n) return [0];
      const digits = [];
      const r = BigInt(baseRadix);
      while (n > 0n) {
        digits.unshift(Number(n % r));
        n /= r;
      }
      return digits;
    },

    /**
     * Encode `value` as exactly W base-`baseRadix` digits (left-padded with
     * zeros). Used for the fixed-width length header of the cipher stream.
     * Throws if the value does not fit in W digits.
     */
    padDigits(value, baseRadix, W) {
      const digits = base.bigIntToDigits(BigInt(value), baseRadix);
      if (digits.length > W) {
        throw new RangeError(`padDigits: value ${value} does not fit in ${W} digits (radix ${baseRadix})`);
      }
      while (digits.length < W) digits.unshift(0);
      return digits;
    },

    /**
     * Pad a minimal byte array to exactly L bytes by left-filling with zero
     * bytes. This is how leading zero bytes lost by BigInt conversion are
     * restored once the original byte count L is known.
     */
    rightJustifyBytes(bytes, L) {
      if (bytes.length > L) {
        throw new RangeError(`rightJustifyBytes: ${bytes.length} bytes exceeds target ${L}`);
      }
      if (bytes.length === L) return bytes;
      const out = new Uint8Array(L);
      out.set(bytes, L - bytes.length);
      return out;
    },

    /** Largest value representable in W radix-`baseRadix` digits. */
    maxDigitsValue(baseRadix, W) {
      return BigInt(baseRadix) ** BigInt(W) - 1n;
    }
  };

  ns.base = base;
  if (typeof module === 'object' && module.exports) module.exports = base;
})();