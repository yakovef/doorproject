/**
 * State <-> URL, and the short design code.
 *
 * PLAN.md §8.2. Two representations of the same thing:
 *   - a readable query string, for links
 *   - a 4-character code (DM-7K4M), for customers who telephone instead of
 *     messaging. It is an ENCODING, not a hash — a hash cannot be decoded
 *     without a server, which would make reading it aloud useless.
 */

import { COLOURS, HANDINGS, SIZES } from './catalog.js';

export const VERSION = 1;

export const DEFAULTS = {
  colour:  'ral-7016',
  size:    'standard',
  handing: 'right-in',
};

// ── Query string ──────────────────────────────────────────────────

export function toQuery(state) {
  // Frozen key order, so identical designs always produce identical URLs.
  const p = new URLSearchParams();
  p.set('v', String(VERSION));
  p.set('c', state.colour);
  p.set('s', state.size);
  p.set('h', state.handing);
  return '?' + p.toString();
}

/**
 * Returns { state, notice }. `notice` is set when a parameter was present but
 * unrecognised — the customer is TOLD, never silently given a different door
 * (PLAN.md §8.2: silent data loss on a shared link is the worst failure here).
 */
export function fromQuery(search) {
  const p = new URLSearchParams(search);
  const state = { ...DEFAULTS };
  let notice = null;

  const code = p.get('d');
  if (code) {
    const decoded = decodeCode(code);
    if (decoded) return { state: decoded, notice: null };
    notice = 'code-unknown';
  }

  const take = (key, param, list, idOf = o => o.id) => {
    const raw = p.get(param);
    if (raw == null) return;
    const hit = list.find(o => idOf(o) === raw || (o.aliases || []).includes(raw));
    if (hit) state[key] = idOf(hit);
    else notice = 'option-unknown';
  };

  take('colour', 'c', COLOURS);
  take('handing', 'h', HANDINGS);

  const rawSize = p.get('s');
  if (rawSize != null) {
    if (SIZES[rawSize]) state.size = rawSize;
    else notice = 'option-unknown';
  }

  return { state, notice };
}

// ── Short code ────────────────────────────────────────────────────
// 20 bits, laid out with room to grow:
//   version 3 | colour 5 | size 3 | handing 2 | window 5 (reserved) | spare 2
// -> 4 Crockford base32 characters. Adding window types later does not
//    change the code length.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: no I L O U

const BITS = { version: 3, colour: 5, size: 3, handing: 2, window: 5, spare: 2 };
const TOTAL_BITS = Object.values(BITS).reduce((a, b) => a + b, 0); // 20

export function encodeCode(state) {
  const sizeKeys = Object.keys(SIZES);
  const parts = [
    [VERSION, BITS.version],
    [Math.max(0, COLOURS.findIndex(c => c.id === state.colour)), BITS.colour],
    [Math.max(0, sizeKeys.indexOf(state.size)), BITS.size],
    [Math.max(0, HANDINGS.findIndex(h => h.id === state.handing)), BITS.handing],
    [0, BITS.window],
    [0, BITS.spare],
  ];

  let bits = 0;
  for (const [value, width] of parts) bits = (bits << width) | (value & ((1 << width) - 1));

  let out = '';
  for (let i = TOTAL_BITS - 5; i >= 0; i -= 5) out += ALPHABET[(bits >> i) & 31];
  return 'DM-' + out;
}

export function decodeCode(code) {
  const clean = String(code).toUpperCase().replace(/^DM-?/, '').replace(/[^0-9A-Z]/g, '')
    // Crockford: these are read aloud as the digits they resemble.
    .replace(/[IL]/g, '1').replace(/O/g, '0').replace(/U/g, 'V');
  if (clean.length !== TOTAL_BITS / 5) return null;

  let bits = 0;
  for (const ch of clean) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) return null;
    bits = (bits << 5) | v;
  }

  const read = width => {
    const shift = TOTAL_BITS - width - consumed;
    const v = (bits >> shift) & ((1 << width) - 1);
    consumed += width;
    return v;
  };
  let consumed = 0;

  const version = read(BITS.version);
  if (version !== VERSION) return null;

  const colour  = COLOURS[read(BITS.colour)];
  const size    = Object.keys(SIZES)[read(BITS.size)];
  const handing = HANDINGS[read(BITS.handing)];
  if (!colour || !size || !handing) return null;

  return { colour: colour.id, size, handing: handing.id };
}
