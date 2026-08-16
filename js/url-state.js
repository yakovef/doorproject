/**
 * State <-> URL, and the short design code.
 *
 * PLAN.md §8.2. Two representations of the same thing:
 *   - a readable query string, for links
 *   - a 6-character code (DM-8EH48X), for customers who telephone instead of
 *     messaging. It is an ENCODING, not a hash — a hash cannot be decoded
 *     without a server, which would make reading it aloud useless.
 */

import { COLOURS, DETAILS, FINISHES, GRILLES, HANDINGS, HANDLES, SIZES, WINDOWS } from './catalog.js';

/* 4: the handle at index 3 changed meaning (the fictional half-moon D-handle
   became "lever + horizontal grab bar", which is what the installations
   actually show). Bumping rather than reusing means an older code is refused
   with a notice instead of quietly decoding into a different door. */
export const VERSION = 4;

export const DEFAULTS = {
  colour:  'ral-7016',
  window:  'rect',
  grille:  'none',
  handle:  'bar-long',
  detail:  'plain',
  finish:  'steel',
  size:    'standard',
  handing: 'right-in',
  view:    'out',        // camera, not a product choice
};

// ── Query string ──────────────────────────────────────────────────

export function toQuery(state) {
  // Frozen key order, so identical designs always produce identical URLs.
  const p = new URLSearchParams();
  p.set('v', String(VERSION));
  p.set('c', state.colour);
  p.set('w', state.window);
  p.set('g', state.grille);
  p.set('n', state.handle);
  p.set('d', state.detail);
  p.set('f', state.finish);
  p.set('s', state.size);
  p.set('h', state.handing);
  if (state.view === 'in') p.set('i', '1');    // only when not the default
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

  const code = p.get('code');
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
  take('window', 'w', WINDOWS);
  take('grille', 'g', GRILLES);
  take('handle', 'n', HANDLES);
  take('detail', 'd', DETAILS);
  take('finish', 'f', FINISHES);
  take('handing', 'h', HANDINGS);
  if (p.get('i') === '1') state.view = 'in';

  const rawSize = p.get('s');
  if (rawSize != null) {
    if (SIZES[rawSize]) state.size = rawSize;
    else notice = 'option-unknown';
  }

  return { state, notice };
}

// ── Short code ────────────────────────────────────────────────────
// 30 bits, laid out with room to grow:
//   version 3 | colour 6 | size 4 | handing 2 | window 5
//   | grille 2 | handle 4 | detail 2 | finish 2
// -> 6 Crockford base32 characters, still short enough to read aloud.
//
// The handle field took the spare bit when the range grew to the real Rav
// Bariach products. Four bits is sixteen slots against fourteen used, so the
// code length is unchanged and there is still room for two more.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: no I L O U

const BITS = { version: 3, colour: 6, size: 4, handing: 2, window: 5,
               grille: 2, handle: 4, detail: 2, finish: 2 };
const TOTAL_BITS = Object.values(BITS).reduce((a, b) => a + b, 0); // 25 -> 5 chars

export function encodeCode(state) {
  const sizeKeys = Object.keys(SIZES);
  const parts = [
    [VERSION, BITS.version],
    [Math.max(0, COLOURS.findIndex(c => c.id === state.colour)), BITS.colour],
    [Math.max(0, sizeKeys.indexOf(state.size)), BITS.size],
    [Math.max(0, HANDINGS.findIndex(h => h.id === state.handing)), BITS.handing],
    [Math.max(0, WINDOWS.findIndex(w => w.id === state.window)), BITS.window],
    [Math.max(0, GRILLES.findIndex(g => g.id === state.grille)), BITS.grille],
    [Math.max(0, HANDLES.findIndex(n => n.id === state.handle)), BITS.handle],
    [Math.max(0, DETAILS.findIndex(d => d.id === state.detail)), BITS.detail],
    [Math.max(0, FINISHES.findIndex(f => f.id === state.finish)), BITS.finish],
  ];

  let bits = 0;
  for (const [value, width] of parts) bits = ((bits << width) >>> 0) | (value & ((1 << width) - 1));

  let out = '';
  for (let i = TOTAL_BITS - 5; i >= 0; i -= 5) out += ALPHABET[(bits >>> i) & 31];
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
    bits = ((bits << 5) >>> 0) | v;
  }

  const read = width => {
    const shift = TOTAL_BITS - width - consumed;
    const v = (bits >>> shift) & ((1 << width) - 1);
    consumed += width;
    return v;
  };
  let consumed = 0;

  const version = read(BITS.version);
  if (version !== VERSION) return null;

  const colour  = COLOURS[read(BITS.colour)];
  const size    = Object.keys(SIZES)[read(BITS.size)];
  const handing = HANDINGS[read(BITS.handing)];
  const window  = WINDOWS[read(BITS.window)];
  const grille  = GRILLES[read(BITS.grille)];
  const handle  = HANDLES[read(BITS.handle)];
  const detail  = DETAILS[read(BITS.detail)];
  const finish  = FINISHES[read(BITS.finish)];
  if (!colour || !size || !handing || !window || !grille || !handle || !detail || !finish) return null;

  return {
    colour: colour.id, size, handing: handing.id, window: window.id,
    grille: grille.id, handle: handle.id, detail: detail.id,
    finish: finish.id, view: 'out',
  };
}
