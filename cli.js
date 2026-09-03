#!/usr/bin/env node
'use strict';

/*
 * cli.js — Carcosa command-line interface.
 *
 * Reads UTF-8 text (or any bytes, via --file) from stdin or a file, encodes it
 * into an eldritch ciphertext or decodes one back. The cipher core is shared
 * with the web UI (core/index.js); this is just a thin pipe wrapper.
 *
 *   echo "The Shadow over Innsmouth" | node cli.js encode --mode rlyehian --password arcane
 *   node cli.js decode --mode rlyehian --password arcane < out.txt
 *   node cli.js encode --mode gods --file secret.bin > ritual.txt
 */

const fs = require('node:fs');
const { encodeBytes, decode, MODES } = require('./core/index');

const USAGE = `Usage:
  node cli.js <encode|decode> [options]

Commands:
  encode    encrypt bytes/text into ciphertext
  decode    restore ciphertext back to bytes

Options:
  -m, --mode <name>     rlyehian | deepone | gods   (default: rlyehian)
  -s, --style <str>     prose | verse               (default: prose)
                        prose = full pseudo-language article
                        verse = original chant-style output
  -p, --password <str>  keystream obfuscation password (default: none)
  -f, --file <path>     read input from a file (default: stdin)
  -h, --help            show this help

Examples:
  echo "The Shadow over Innsmouth" | node cli.js encode -m rlyehian -p arcane
  node cli.js decode -m rlyehian -p arcane < out.txt
  node cli.js encode -m gods --style verse --file secret.bin > ritual.txt
`;

function parseArgs(argv) {
  const opts = { action: null, mode: 'rlyehian', style: 'prose', password: '', file: null, help: false, error: false };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '-h':
      case '--help': opts.help = true; break;
      case '-m':
      case '--mode': opts.mode = argv[++i]; break;
      case '-s':
      case '--style': opts.style = argv[++i]; break;
      case '-p':
      case '--password': opts.password = argv[++i]; break;
      case '-f':
      case '--file': opts.file = argv[++i]; break;
      default:
        if (a.startsWith('-')) {
          opts.error = true;
          opts.help = true;
        } else {
          positional.push(a);
        }
    }
  }
  if (positional[0] === 'encode') opts.action = 'encode';
  else if (positional[0] === 'decode') opts.action = 'decode';
  else if (positional[0]) {
    opts.error = true;
    opts.help = true;
  }
  if (!opts.action && !opts.help) {
    opts.help = true; // bare invocation → show usage, exit 0
  }
  if (opts.action && !MODES[opts.mode]) {
    opts.error = true;
    opts.help = true;
  }
  if (opts.action && (opts.style !== 'prose' && opts.style !== 'verse')) {
    opts.error = true;
    opts.help = true;
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.error) {
    console.error('Could not proceed — see usage below.\n');
    process.stdout.write(USAGE);
    process.exitCode = 2;
    return;
  }
  if (opts.help) { process.stdout.write(USAGE); return; }

  let input;
  try {
    input = opts.file ? fs.readFileSync(opts.file) : fs.readFileSync(0);
  } catch (err) {
    console.error(`read failed: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const cipherOpts = { mode: opts.mode, style: opts.style, password: opts.password };
  try {
    if (opts.action === 'encode') {
      process.stdout.write(encodeBytes(input, cipherOpts) + '\n');
    } else {
      const text = input.toString('utf8');
      process.stdout.write(Buffer.from(decode(text, cipherOpts)));
    }
  } catch (err) {
    console.error(`failed: ${err.message}`);
    if (opts.action === 'encode') {
      console.error('Hint: byte input beyond the mode limit throws; text input must be UTF-8.');
    }
    process.exitCode = 1;
  }
}

main();