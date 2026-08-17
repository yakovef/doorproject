/**
 * State <-> URL, and the short design code.
 *
 * PLAN.md §8.2. Two representations of the same thing:
 *   - a readable query string, for links
 *   - a 6-character code (DM-8EH48X), for customers who telephone instead of
 *     messaging. It is an ENCODING, not a hash — a hash cannot be decoded
 *     without a server, which would make reading it aloud useless.
 */

import { COLOURS, DETAILS, FINISHES, GRILLES, HANDINGS, HANDLES, LOCKSETS, SIZES, WINDOWS } from './catalog.js';

/* 7: the handle list split in two. A grip and a lockset are separate objects
   fitted to the same door, so they are separate fields — `n` is the grip and
   the new `k` is the lock furniture. Every id keeps its meaning and a link
   written before the split still opens the right door (fromQuery moves a
   lockset found under `n` across to `k`), but the code stores INDICES and the
   field layout itself changed, so an older code is refused with a notice.
   6: the whole colour list was replaced by the manufacturer's own chart, so
   every colour index moved. Aliases keep shared LINKS working; they cannot
   help a code, which stores a number.
   5: the code's fields were widened (see BITS) and the catalogue grew, so
   every index shifted. Aliases cannot rescue a code, because a code stores a
   NUMBER and a number carries no name to alias — hence the bump, so an older
   code is refused with a notice rather than decoded into a different door.
   4: the handle at index 3 changed meaning (the fictional half-moon D-handle
   became "lever + horizontal grab bar", which is what the installations
   actually show). Bumping rather than reusing means an older code is refused
   with a notice instead of quietly decoding into a different door. */
export const VERSION = 7;

export const DEFAULTS = {
  colour:  'rb-0097d',
  window:  'rect',
  grille:  'none',
  handle:  'idan',
  lockset: 'coral',
  detail:  'plain',
  finish:  'steel',
  size:    'standard',
  handing: 'right-in',
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
  p.set('k', state.lockset);
  p.set('d', state.detail);
  p.set('f', state.finish);
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
  take('lockset', 'k', LOCKSETS);

  /* A link written before the grip and the lockset were separate fields names
     the lockset under `n`. Move it across rather than refusing it: those links
     are in people's WhatsApp history and Peretz opens them months later. */
  const rawN = p.get('n');
  if (rawN && !p.get('k')) {
    const hit = LOCKSETS.find(o => o.id === rawN || (o.aliases || []).includes(rawN));
    if (hit) { state.lockset = hit.id; state.handle = 'none'; notice = null; }
  }
  take('detail', 'd', DETAILS);
  take('finish', 'f', FINISHES);
  take('handing', 'h', HANDINGS);

  const rawSize = p.get('s');
  if (rawSize != null) {
    if (SIZES[rawSize]) state.size = rawSize;
    else notice = 'option-unknown';
  }

  return { state, notice };
}

// ── Short code ────────────────────────────────────────────────────
// 40 bits, laid out with room to grow:
//   version 3 | colour 7 | size 4 | handing 2 | window 5
//   | grille 3 | handle 5 | lockset 4 | detail 3 | finish 4
// -> 8 Crockford base32 characters, still short enough to read aloud.
//
// 40 bits, up from 35, because the handle field became two: a grip and a
// lockset are separate objects on the same door. The eighth character is the
// price of saying so, and it also means every pre-split code fails the length
// check and is refused outright rather than decoded into a different door.
//
// The handle field took the spare bit when the range grew to the real Rav
// Bariach products. Four bits is sixteen slots against fourteen used, so the
// code length is unchanged and there is still room for two more.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: no I L O U

/* Widened before any of these fields filled up, which is the only moment it
   is free. `grille` and `detail` were both at 4 of 4 and `finish` at 3 of 4:
   a fifth grille would have overflowed its two bits and been stored as
   grille 0, silently — the customer picks scrollwork, reads the code down the
   phone, and Peretz builds a door with no grille at all. Not an error, not a
   refusal, just a different door. PLAN.md §8.2 names that as the worst thing
   this site can do.
   Capacities now: 128 colours, 16 sizes, 4 handings, 32 windows, 8 grilles,
   32 grips, 16 locksets, 8 details, 16 finishes. */
const BITS = { version: 3, colour: 7, size: 4, handing: 2, window: 5,
               grille: 3, handle: 5, lockset: 4, detail: 3, finish: 4 };
const TOTAL_BITS = Object.values(BITS).reduce((a, b) => a + b, 0); // 40 -> 8 chars

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
    [Math.max(0, LOCKSETS.findIndex(k => k.id === state.lockset)), BITS.lockset],
    [Math.max(0, DETAILS.findIndex(d => d.id === state.detail)), BITS.detail],
    [Math.max(0, FINISHES.findIndex(f => f.id === state.finish)), BITS.finish],
  ];

  /* BigInt, not <<. JavaScript's bitwise operators truncate to 32 bits, and
     the field layout is 35 wide — the old 30-bit version fitted only by luck.
     Shifting past 32 wraps silently, which would corrupt the very codes this
     widening exists to protect. */
  let bits = 0n;
  for (const [value, width] of parts) {
    const w = BigInt(width);
    bits = (bits << w) | (BigInt(value) & ((1n << w) - 1n));
  }

  let out = '';
  for (let i = TOTAL_BITS - 5; i >= 0; i -= 5) out += ALPHABET[Number((bits >> BigInt(i)) & 31n)];
  return 'DM-' + out;
}

export function decodeCode(code) {
  const clean = String(code).toUpperCase().replace(/^DM-?/, '').replace(/[^0-9A-Z]/g, '')
    // Crockford: these are read aloud as the digits they resemble.
    .replace(/[IL]/g, '1').replace(/O/g, '0').replace(/U/g, 'V');
  if (clean.length !== TOTAL_BITS / 5) return null;

  let bits = 0n;
  for (const ch of clean) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) return null;
    bits = (bits << 5n) | BigInt(v);
  }

  const read = width => {
    const shift = BigInt(TOTAL_BITS - width - consumed);
    const v = Number((bits >> shift) & ((1n << BigInt(width)) - 1n));
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
  const lockset = LOCKSETS[read(BITS.lockset)];
  const detail  = DETAILS[read(BITS.detail)];
  const finish  = FINISHES[read(BITS.finish)];
  if (!colour || !size || !handing || !window || !grille || !handle || !lockset
      || !detail || !finish) return null;

  return {
    colour: colour.id, size, handing: handing.id, window: window.id,
    grille: grille.id, handle: handle.id, lockset: lockset.id, detail: detail.id,
    finish: finish.id,
  };
}
