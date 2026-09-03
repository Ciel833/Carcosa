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