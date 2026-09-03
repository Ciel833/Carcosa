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