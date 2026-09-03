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