/**
 * State <-> URL, and the short design code.
 *
 * PLAN.md §8.2. Two representations of the same thing:
 *   - a readable query string, for links
 *   - a 6-character code (DM-8EH48X), for customers who telephone instead of
 *     messaging. It is an ENCODING, not a hash — a hash cannot be decoded
 *     without a server, which would make reading it aloud useless.
 */

import { ADDONS, COLOURS, DETAILS, FINISHES, GLAZINGS, GRILLES, HANDINGS, HANDLES, LOCKSETS, SIZES, WINDOWS } from './catalog.js';
import { repair } from './rules.js';

/* 8: two new axes. `z` is the glazing (clear / obscured / reeded) and `a` is
   the add-ons, which is the first field that is not one-of-a-list — a door
   carries any number of them, so it is a comma list in the URL and a BITMASK
   in the code. Every existing field was also re-widened at the same time,
   because changing the layout is the expensive part and doing it once is
   cheaper than doing it twice: see BITS.
   7: the handle list split in two. A grip and a lockset are separate objects
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
export const VERSION = 8;

export const DEFAULTS = {
  colour:  'rb-0097d',
  window:  'rect',
  glazing: 'clear',
  grille:  'none',
  handle:  'idan',
  lockset: 'coral',
  detail:  'plain',
  finish:  'steel',
  size:    'standard',
  handing: 'right-in',
  /* EMPTY, and the reason is a rule discovered after this line was first
     written as ['peep']. A peephole is at eye level on the centre line, the
     default door is glazed, and its window is exactly there — so the default
     was a design the rules refuse. Every page load repaired itself, showed the
     customer a notice about a link they had not followed, and opened a
     category to explain a change nobody had made.
     It is also right on the evidence: all four glazed doors in the measured
     set record `peephole.present: false`. A door with a window does not need
     one, and the corpus agrees. On a solid door it is one tap away. */
  addons:  [],
};

// ── Query string ──────────────────────────────────────────────────

export function toQuery(state) {
  // Frozen key order, so identical designs always produce identical URLs.
  const p = new URLSearchParams();
  p.set('v', String(VERSION));
  p.set('c', state.colour);
  p.set('w', state.window);
  p.set('z', state.glazing);
  p.set('g', state.grille);
  p.set('n', state.handle);
  p.set('k', state.lockset);
  p.set('d', state.detail);
  p.set('f', state.finish);
  p.set('s', state.size);
  p.set('h', state.handing);
  /* Always written, even when empty, so that "no add-ons" is a statement in
     the link rather than an absence that reads as "unspecified" and gets the
     default peephole back. A door someone deliberately ordered without a
     peephole must survive being shared. */
  p.set('a', ADDONS.filter(o => (state.addons || []).includes(o.id)).map(o => o.id).join(','));
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
    if (decoded) return settle(decoded, null);
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
  take('glazing', 'z', GLAZINGS);
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

  /* Add-ons: a comma list, and the one field where an empty value is a real
     answer rather than a missing one. Order is normalised to the catalogue's
     so that the same door always produces the same link, and an unrecognised
     name sets the notice like every other option — never dropped in silence. */
  const rawAdd = p.get('a');
  if (rawAdd != null) {
    const want = rawAdd.split(',').map(s => s.trim()).filter(Boolean);
    const hits = [];
    for (const nameOrAlias of want) {
      const hit = ADDONS.find(o => o.id === nameOrAlias || (o.aliases || []).includes(nameOrAlias));
      if (hit) hits.push(hit.id); else notice = 'option-unknown';
    }
    state.addons = ADDONS.filter(o => hits.includes(o.id)).map(o => o.id);
  }

  return settle(state, notice);
}

/**
 * The last gate before a design becomes a door.
 *
 * A link can carry any combination — it was hand-edited, or written before a
 * rule existed, or the catalogue moved under it. Rendering it anyway produces
 * a collision, and quietly rendering something else produces the worst failure
 * this site has (PLAN.md §8.2). So it is repaired to the nearest buildable
 * door and the customer is TOLD, in a strip at the top of the page.
 */
function settle(state, notice) {
  const { state: fixed, changed } = repair(state);
  /* An existing notice WINS. `option-unknown` means a name in the link matched
     nothing we sell — the customer is looking at a different door and must be
     told that first; `combination-fixed` is the milder statement that a
     buildable door was assembled from what they asked for. Overwriting the
     first with the second buries the worse news under the better. */
  return { state: fixed, notice: notice || (changed.length ? 'combination-fixed' : null) };
}

// ── Short code ────────────────────────────────────────────────────
// 45 bits -> 9 Crockford base32 characters, still short enough to read aloud.
//
// Nine, up from eight, and the ninth character buys two whole axes: what the
// glass is, and which add-ons are on the door. Leaving the add-ons out of the
// code was considered and rejected — a customer who telephones would then read
// out a door with no peephole and no letterplate and be sent one anyway, which
// is precisely the silent-difference failure the code exists to prevent
// (PLAN.md §8.2). A character is cheaper than a wrong door.
//
// The whole layout was re-cut at the same time rather than bolting two fields
// on the end, because changing the layout is what costs a VERSION bump and
// doing it once is cheaper than doing it twice. Several fields were absurdly
// wide — 128 colours for a list of seventeen — and the space paid for the new
// ones.
//
// The VERSION FIELD ITSELF widened, 3 bits to 4, because version 8 does not
// fit in three. That is not a detail: a decoder built for this layout reads
// four bits where an old code wrote three, so it reads an old code's version
// as 14 or 15, matches nothing, and refuses. Which is the wanted behaviour,
// and the length check refuses it one line earlier anyway.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: no I L O U

/* Capacities against what is used today:
     version 16 / 8      colour  64 / 17     size     8 / 6
     handing  4 / 2      window  16 / 6      grille   16 / 7
     handle  16 / 10     lockset 16 / 10     detail   16 / 9
     finish   8 / 3      glazing  4 / 3      addons   5 / 5  (a MASK)
   Every one has room except `addons`, where five bits means five add-ons
   exactly and a sixth needs another bump. That is deliberate: a mask cannot
   be over-provisioned cheaply, and five is what the corpus shows.

   The reason to keep headroom at all: a field that overflows does not throw.
   An eighth grille in three bits would have been stored as grille 0 — the
   customer picks scrollwork, reads the code down the phone, and Peretz builds
   a door with no grille. Not an error, not a refusal, just a different door. */
const BITS = { version: 4, colour: 6, size: 3, handing: 2, window: 4, grille: 4,
               handle: 4, lockset: 4, detail: 4, finish: 3, glazing: 2, addons: 5 };
const TOTAL_BITS = Object.values(BITS).reduce((a, b) => a + b, 0); // 45 -> 9 chars

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
    [Math.max(0, GLAZINGS.findIndex(z => z.id === state.glazing)), BITS.glazing],
    /* A mask, not an index — the only field of its kind. `bit` comes from the
       catalogue rather than from array position, so reordering the add-on
       tiles for the UI cannot silently renumber what a code means. */
    [ADDONS.reduce((m, a) => m | ((state.addons || []).includes(a.id) ? 1 << a.bit : 0), 0), BITS.addons],
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
  const glazing = GLAZINGS[read(BITS.glazing)];
  const mask    = read(BITS.addons);
  if (!colour || !size || !handing || !window || !grille || !handle || !lockset
      || !detail || !finish || !glazing) return null;

  return {
    colour: colour.id, size, handing: handing.id, window: window.id,
    grille: grille.id, handle: handle.id, lockset: lockset.id, detail: detail.id,
    finish: finish.id, glazing: glazing.id,
    addons: ADDONS.filter(a => mask & (1 << a.bit)).map(a => a.id),
  };
}
