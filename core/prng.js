'use strict';

/*
 * core/prng.js — toy-grade keystream: positional FNV-1a.
 *
 * keystream byte i = FNV1a32(passwordBytes ∥ 4-byte big-endian i) & 0xff
 *
 * Why positional: the counter is mixed into the hash input, so every stream
 * position depends on both the password and its own index — no repeated
 * ciphertext prefixes beyond what determinism implies.
 *
 * Why Math.imul: FNV-1a multiplies by 16777619. A plain `h * 16777619` can
 * reach ~2^57, beyond float64's exact 2^53. Math.imul is an exact 32-bit
 * multiply, identical on every JS engine, so Node and browsers agree.
 *
 * SECURITY: this is a toy obfuscation, NOT a cipher. It has no salt (same
 * password + same plaintext ⇒ same ciphertext) and is not hardened against
 * cryptanalysis. Documented in the README; do not use for real secrets.
 */
(function () {
  const g = (typeof globalThis !== 'undefined') ? globalThis : self;
  const ns = g.CthulhuCore || (g.CthulhuCore = {});

  const prng = {
    /** FNV-1a 32-bit hash of a byte array. Every step ends in >>> 0. */
    fnv1a32(bytes) {
      let h = 0x811c9dc5;
      for (let i = 0; i < bytes.length; i++) {
        h ^= bytes[i];
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h >>> 0;
    },

    /**
     * XOR bytes with the positional keystream derived from the password.
     * An empty password is a no-op (returns the input unchanged).
     * Deterministic across Node and browsers. Pure function of (bytes, pwd).
     */
    xorBytes(bytes, passwordBytes) {
      if (passwordBytes.length === 0) return bytes;
      const out = new Uint8Array(bytes.length);
      const keyInput = new Uint8Array(passwordBytes.length + 4);
      keyInput.set(passwordBytes, 0);
      const hi = passwordBytes.length;
      for (let i = 0; i < bytes.length; i++) {
        keyInput[hi] = (i >>> 24) & 0xff;
        keyInput[hi + 1] = (i >>> 16) & 0xff;
        keyInput[hi + 2] = (i >>> 8) & 0xff;
        keyInput[hi + 3] = i & 0xff;
        out[i] = bytes[i] ^ (prng.fnv1a32(keyInput) & 0xff);
      }
      return out;
    }
  };

  ns.prng = prng;
  if (typeof module === 'object' && module.exports) module.exports = prng;
})();