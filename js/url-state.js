/**
 * State <-> URL, and the short design code.
 *
 * PLAN.md §8.2. Two representations of the same thing:
 *   - a readable query string, for links
 *   - a 6-character code (DM-8EH48X), for customers who telephone instead of
 *     messaging. It is an ENCODING, not a hash — a hash cannot be decoded
 *     without a server, which would make reading it aloud useless.
 */

import { COLOURS, DETAILS, GRILLES, HANDINGS, HANDLES, LOCKSETS, SIZES, WINDOWS } from './catalog.js';
import { repair } from './rules.js';

/* 9: two fields REMOVED. The add-ons and the handle finish are withdrawn at
   the owner's instruction, so `f` and `a` are gone from the link and their
   bits are gone from the code — which shortens it from nine characters to
   eight and, more to the point, renumbers every field after them. A version-8
   code decoded under this layout would be a different door, so it is refused
   with a notice instead. The two PARAMETER NAMES stay retired for good: `f`
   and `a` must never be reused for anything else, because a link in somebody's
   WhatsApp history still carries them and the parser must go on ignoring them
   rather than reading them as something new.
   8: two new axes. `z` is the glazing (clear / obscured / reeded) and `a` is
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
/* 10: THREE things moved at once, and any one of them alone would have needed
   this. The glass stopped being its own axis — `z` is retired and its two bits
   are gone. The window list lost `duo` and `square`, which no door in 128
   photographs has, so every window index after them shifted. And the grille
   list went from eight entries to fifteen, because the glass patterns moved
   into it. A version-9 code read under this layout is a different door, so it
   is refused with a notice.
   `z` joins `f` and `a` in retirement: never reuse the letter. */
export const VERSION = 10;

export const DEFAULTS = {
  colour:  'rb-0097d',
  window:  'rect',
  grille:  'none',
  handle:  'idan',
  /* CYLINDER, not the lever it was. The default door carries a pull bar, and
     of the ten installed doors that carry one, eight have exactly this beside
     it and not one has a lever — so the old default was a door the rules now
     refuse, and the DEFAULTS-is-buildable assertion caught it the moment the
     rule landed. Second time that assertion has earned its keep in two
     commits, which is a fair argument for writing tests about the boring
     starting state and not only about the interesting edges. */
  lockset: 'cylinder',
  detail:  'plain',
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
  p.set('s', state.size);
  p.set('h', state.handing);
  /* `gp` — where the customer stood the grip, in millimetres: inboard from the
     closing edge, down from the leaf's top, then 0 or 90 for which way up.
     Written ONLY when they moved it, so every door nobody dragged produces
     exactly the URL it always did.
     It is in the link and NOT in the code, at the owner's son's instruction:
     the position is a picture of what the customer had in mind, not an
     instruction his father builds to, and the code is the thing read down a
     telephone as a specification. Putting it in the code would have cost a
     VERSION bump and every code written so far. The link still carries it, so
     the door Peretz taps through to is the door they were looking at, and the
     stage says underneath that the final position is set on site. */
  if (state.grip) {
    const g = state.grip;
    p.set('gp', `${Math.round(g.x)},${Math.round(g.y)},${g.rot === 90 ? 90 : 0}`);
  }
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
  take('handing', 'h', HANDINGS);

  const rawSize = p.get('s');
  if (rawSize != null) {
    if (SIZES[rawSize]) state.size = rawSize;
    else notice = 'option-unknown';
  }

  const rawGrip = p.get('gp');
  if (rawGrip != null) {
    const [gx, gy, gr] = rawGrip.split(',').map(Number);
    /* A position that is not three numbers is a link somebody edited by hand.
       It does not earn `option-unknown` — nothing was misnamed and the door is
       still theirs — so the grip simply goes home, which is where it would
       have been if they had never dragged it. */
    if ([gx, gy].every(Number.isFinite)) {
      state.grip = { x: gx, y: gy, rot: gr === 90 ? 90 : 0 };
    }
  }

  /* `f` and `a` — the finish and the add-ons — are read by nobody now, and
     deliberately do not set the notice. A link carrying them was written when
     the site offered them; the door it names is still buildable and still that
     customer's door, so it opens as itself rather than being flagged as
     damaged. Withdrawing an option is our change, not their mistake. */

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
     version 16 / 10     colour  64 / 17     size     8 / 6
     handing  4 / 2      window  16 / 5      grille   32 / 15
     handle  16 / 10     lockset 16 / 10     detail   16 / 9
   Every one has room, which is the point of keeping any: a field that
   overflows does not throw. An eighth grille in three bits would have been
   stored as grille 0 — the customer picks scrollwork, reads the code down the
   phone, and Peretz builds a door with no grille. Not an error, not a refusal,
   just a different door.

   ⚠ THE GRILLE FIELD IS FIVE BITS NOW. It was four, and the list has just gone
   from eight entries to fifteen — one more and four bits would have silently
   stored the fifteenth as the first. Widened while the layout was being re-cut
   anyway, which is the cheap moment to do it.

   The glazing's 2 bits came out with the axis, as the finish's 3 and the
   add-ons' 5-bit MASK did before them. Gone from the layout entirely rather
   than left as dead zeroes: a reserved field nobody writes is a field somebody
   eventually reuses, and the VERSION is what protects the old codes, not the
   padding. */
const BITS = { version: 4, colour: 6, size: 3, handing: 2, window: 4, grille: 5,
               handle: 4, lockset: 4, detail: 4 };
/* 36 bits, which does not divide by 5 — so the code carries 40 and the top
   four are always zero. Rounding UP is the only safe direction: truncating
   would drop the low bits of the last field. */
const TOTAL_BITS = Math.ceil(Object.values(BITS).reduce((a, b) => a + b, 0) / 5) * 5;
const PAD_BITS = TOTAL_BITS - Object.values(BITS).reduce((a, b) => a + b, 0);

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
    [0, PAD_BITS],                       // to the next whole character
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
  if (!colour || !size || !handing || !window || !grille || !handle || !lockset
      || !detail) return null;

  return {
    colour: colour.id, size, handing: handing.id, window: window.id,
    grille: grille.id, handle: handle.id, lockset: lockset.id, detail: detail.id,
  };
}
