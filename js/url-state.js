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
/* 11: THE FOUR PAD BITS BECAME A CHECK NIBBLE. No field moved and no list
   changed — but `decodeCode` now REFUSES a code whose check does not match,
   and a version-10 code carries zeros there, so every one of them would fail.
   Refusing them by version gives the customer the notice instead of a silent
   rejection they cannot interpret.
   Taken deliberately and taken NOW: 38.4% of single-character typos used to
   decode to a different valid buildable door, on the one artefact built to be
   read down a telephone, and it is 1.03% now — 37x fewer. The bump is free
   today because the site is noindex, undeployed, and not one code has ever
   been given to a customer. It would never be free again. See `checkNibble`.
   ⚠ The GRIP POSITION was considered for this bump and deliberately left out.
   It is a picture of what the customer had in mind rather than a
   specification, it is settled on site, and since Stage 1.4 the MESSAGE says
   in words that the handle was moved and points at the link for the
   millimetres. Carrying it in the code as well would have grown the code a
   character to duplicate what the order already says. */
export const VERSION = 11;

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
     telephone as a specification. The link still carries it, so the door
     Peretz taps through to is the door they were looking at, and the stage
     says underneath that the final position is set on site.
     ⚠ It stayed out of the code even when VERSION 11 made a bump free. The
     old reason given here — "it would cost a bump and every code written so
     far" — stopped being the reason the moment a bump was happening anyway.
     The reason now is simply that it does not belong there: since Stage 1.4
     the MESSAGE says in words that the handle was moved and points here for
     the millimetres, so a character added to a telephone code would duplicate
     what the order already says. */
  if (state.grip) {
    const g = state.grip;
    p.set('gp', `${Math.round(g.x)},${Math.round(g.y)},${g.rot === 90 ? 90 : 0}`);
  }
  return '?' + p.toString();
}

/**
 * Returns { state, notice, said }. `notice` is set when a parameter was present
 * but unrecognised — the customer is TOLD, never silently given a different
 * door (PLAN.md §8.2: silent data loss on a shared link is the worst failure
 * here). `said` is the repair's own sentences, one per change, for the page to
 * print instead of a generic line; see `settle`.
 */
export function fromQuery(search) {
  const p = new URLSearchParams(search);
  const state = { ...DEFAULTS };
  let notice = null;

  /* ⚠ A PARAMETER NAME WE DO NOT KNOW IS ALSO SILENT DATA LOSS. Every check
     below asks whether a VALUE is one we recognise; none of them asked whether
     the KEY was. `?colour=rb-9016d&size=wide` — the spelled-out names a person
     would guess — set no notice and opened the default anthracite standard
     door, and then `toQuery` dropped both keys on the first `replaceState`, so
     300 ms later the address bar held no evidence that anything had been
     asked for. PLAN.md §8.2 asks for the opposite in as many words.

     `f`, `a` and `z` are listed rather than merely ignored. They ARE ignored
     deliberately — see the note where they used to be read — but "a parameter
     we retired" and "a parameter that was never ours" are different facts, and
     until they were two lists the exemption covered both. */
  const KNOWN   = new Set(['v', 'c', 'w', 'g', 'n', 'k', 'd', 's', 'h', 'gp', 'code', 'bare']);
  /* `f` finish, `a` add-ons, `z` — and `i`, the inside view, withdrawn earlier
     still. Withdrawing an option is OUR change and not the customer's mistake,
     so a link carrying one opens as itself. */
  const RETIRED = new Set(['f', 'a', 'z', 'i']);
  for (const key of p.keys()) {
    if (!KNOWN.has(key) && !RETIRED.has(key)) notice = notice || 'option-unknown';
  }

  /* PLAN.md §3.2 wrote this entry point as `?d=DM-…`, and `d` is the detail
     axis — so the one URL a person would type from a code read down the
     telephone landed on `take('detail', …)`, produced the DEFAULT door, and
     said "some of the options in this link are unavailable — showing the
     closest", which is false twice over: nothing in the link was an option,
     and what came up was the default rather than anything close. Every code
     starts `DM-`, and no detail id does, so the two cannot be confused. */
  const code = p.get('code') || (/^DM-/i.test(p.get('d') || '') ? p.get('d') : null);
  if (code) {
    const decoded = decodeCode(code);
    if (decoded) return settle(decoded, null);
    notice = 'code-unknown';
  }

  /* Ids first, ALIASES second — `byId` resolves in that order and explains
     why: a superseded id must reach its replacement rather than falling
     through to whichever entry happens to list it. One pass gave the alias
     priority over a live id of the same name, so the two resolvers would
     disagree the day any list ever reuses a name. No list does today; this
     is the reader that faces stale links, so it should not be the one that
     has to be right by luck. */
  const take = (key, param, list, idOf = o => o.id) => {
    const raw = p.get(param);
    if (raw == null) return;
    const hit = list.find(o => idOf(o) === raw)
             || list.find(o => (o.aliases || []).includes(raw));
    if (hit) state[key] = idOf(hit);
    else notice = 'option-unknown';
  };

  take('colour', 'c', COLOURS);
  take('window', 'w', WINDOWS);
  take('grille', 'g', GRILLES);
  /* Held across the next line so the migration below can undo the notice IT
     caused without touching one that was already standing. */
  const beforeHandle = notice;
  take('handle', 'n', HANDLES);
  const handleRaisedIt = notice !== beforeHandle;
  take('lockset', 'k', LOCKSETS);

  /* A link written before the grip and the lockset were separate fields names
     the lockset under `n`. Move it across rather than refusing it: those links
     are in people's WhatsApp history and Peretz opens them months later. */
  const rawN = p.get('n');
  if (rawN && !p.get('k')) {
    const hit = LOCKSETS.find(o => o.id === rawN)
             || LOCKSETS.find(o => (o.aliases || []).includes(rawN));
    /* ⚠ THIS USED TO CLEAR THE NOTICE OUTRIGHT, and it runs after `take` has
       already looked at `c`, `w` and `g` — so a link whose COLOUR was
       unrecognised came out silent as long as it also carried an old `n=`.
       `?c=ral-does-not-exist` said "some options are unavailable";
       `?c=ral-does-not-exist&n=plate` said nothing and quietly served
       anthracite. That is precisely what `settle` twelve lines down is written
       to prevent, in its words: an existing notice WINS, because the customer
       is looking at a different door and has to be told that first.
       Only THIS migration's own notice is cleared — the one `take('handle')`
       raised a moment ago for a value that turned out to be a lockset. */
    if (hit) {
      state.lockset = hit.id;
      state.handle = 'none';
      if (handleRaisedIt) notice = beforeHandle;
    }
  }
  take('detail', 'd', DETAILS);
  take('handing', 'h', HANDINGS);

  const rawSize = p.get('s');
  if (rawSize != null) {
    /* ⚠ `Object.hasOwn`, NOT `SIZES[rawSize]`. `SIZES` is a plain object
       literal, so `constructor`, `__proto__`, `toString`, `valueOf` and every
       other name on `Object.prototype` came back truthy and was accepted as a
       size band. `?s=constructor` produced no notice, a `state.size` that no
       lookup could resolve, `priceAgorot` → **NaN**, a spec row reading
       "מידה: undefined", and `NaN ₪` in the price card, in the phone dock and
       in the WhatsApp message — while `encodeCode` handed back the code for a
       STANDARD door, because it packs with `Math.max(0, findIndex(...))` and
       an unknown id is index 0.

       Every other field reaches `encodeCode` already canonicalised by `take`,
       so `s=` was the only route into that silent zero. There are eighteen
       `SIZES[state.size] || SIZES.standard` guards downstream and an inherited
       key defeats all eighteen, because `Object` and `Object.prototype` are
       themselves truthy. They are not the bug — they are eighteen pieces of
       evidence that this line was expected to hold.

       `hasOwnProperty.call` rather than `Object.hasOwn`, which is ES2022:
       the bundle targets es2020 and nothing in it currently raises the browser
       floor above that. A one-line guard is not worth costing somebody their
       door. */
    if (Object.prototype.hasOwnProperty.call(SIZES, rawSize)) state.size = rawSize;
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
  const { state: fixed, changed, said } = repair(state);
  /* An existing notice WINS. `option-unknown` means a name in the link matched
     nothing we sell — the customer is looking at a different door and must be
     told that first; `combination-fixed` is the milder statement that a
     buildable door was assembled from what they asked for. Overwriting the
     first with the second buries the worse news under the better.

     `said` rides along, because the kind alone cannot say what happened.
     `repair` already writes one exact sentence per change — that fix was made
     for the toast when a customer dropping to one panel was told we had
     removed their metal strips — and this, the second reader of the same
     repair, was still throwing them away and printing one generic line.
     It read "the combination in the link cannot be manufactured", which is
     false for the commonest repair there is: a stale `gp=` moves the HANDLE,
     and the handle's position is not part of the order at all. Measured on the
     default door, 1,344 of 1,353 positions repair the position and nothing
     else, and every one of them said the door could not be built. Peretz
     opening that link has to ask which door it is — the one question this site
     exists to make unnecessary. */
  return { state: fixed, said, notice: notice || (changed.length ? 'combination-fixed' : null) };
}

// ── Short code ────────────────────────────────────────────────────
// 36 bits -> 40 -> 8 Crockford base32 characters, short enough to read aloud.
//
// It was NINE characters for two rounds, and the ninth was carrying two axes
// that no longer exist: what the glass is, and which add-ons are on the door.
// Both were withdrawn at the owner's instruction, so their 2 and 5 bits came
// OUT of the layout rather than being left as reserved zeroes — a field nobody
// writes is a field somebody eventually reuses, and what protects an old code
// is the VERSION, never the padding.
//
// The layout is re-cut whole each time rather than having fields bolted on the
// end or hollowed out in place, because changing it at all is what costs a
// VERSION bump, and doing it once is cheaper than doing it twice. Several
// fields were absurdly wide — 128 colours for a list of seventeen — and that
// space has paid for every widening since, the grille's included.
//
// The VERSION FIELD ITSELF is 4 bits, widened from 3 when version 8 arrived
// and version 8 would not fit. That is not a detail: a decoder built for this
// layout reads four bits where an old code wrote three, so it reads an old
// code's version as 14 or 15, matches nothing, and refuses. That is the wanted
// behaviour,
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
/* ⚠ EXPORTED so a test can assert the lists still fit inside it.
   `encodeCode` packs each field with `BigInt(i) & ((1n << w) - 1n)`, and a
   mask does not throw — it WRAPS. A list that outgrows its field stores its
   new last entry as index 0: the customer picks the new option, reads the code
   down the telephone, and Peretz builds the FIRST one. Nothing reports a
   fault. That is the one way a catalogue APPEND — the operation this whole
   VERSION discipline exists to keep free — can be silently wrong.

   ⚠ AND THE FIELD TO WATCH IS `size`, NOT `detail`. This warning used to name
   `detail` as "the field nearest its ceiling" and print a table beside it.
   Measured, the order is:

     size 2 spare · handing 2 · version 4 · handle 6 · lockset 7 ·
     detail 8 · window 11 · grille 17 · colour 47

   `detail` is the THIRD ROOMIEST, with four times the headroom of the field
   the warning should have been about — and `SIZES`, at 6 of 8, is the one list
   ASK-PERETZ.md expects the owner to REPLACE WHOLESALE (§8, the size bands).
   A door shop naming nine bands is not exotic; the ninth would encode as index
   0 and Peretz would build a standard door from a code that reads perfectly.
   `handing` is level with it at 2 of 4: the two outward-opening hands fill it
   exactly, and a fifth wraps to `right-in`.

   No table is kept here any more. `npm test` measures the spare per field and
   prints it — three of the nine rows of the hand-kept one had gone stale, in
   a comment whose whole job is to make somebody think about the budget.
   If `size` needs widening, `detail`, `handle` and `lockset` can each give a
   bit back and the payload stays at 36. */
export const BITS = { version: 4, colour: 6, size: 3, handing: 2, window: 4,
                      grille: 5, handle: 4, lockset: 4, detail: 4 };
/* 36 bits, which does not divide by 5 — so the code carries 40 and the top
   four are always zero. Rounding UP is the only safe direction: truncating
   would drop the low bits of the last field. */
const TOTAL_BITS = Math.ceil(Object.values(BITS).reduce((a, b) => a + b, 0) / 5) * 5;
const PAYLOAD_BITS = Object.values(BITS).reduce((a, b) => a + b, 0);
/* ⚠ NO LONGER PADDING. These four bits carry the check nibble; the name is
   kept because the width is still "whatever rounds the payload up to a whole
   character", and if a field is ever widened this is what shrinks. */
const PAD_BITS = TOTAL_BITS - PAYLOAD_BITS;

/**
 * ── THE CHECK NIBBLE ─────────────────────────────────────────────────
 *
 * ⚠ WHY: 38.4% OF ONE-CHARACTER TYPOS USED TO DECODE TO A DIFFERENT, VALID,
 * BUILDABLE DOOR, WITH NO WARNING ANYWHERE. Measured over 400 random designs x
 * every single-character substitution in the eight-character body = 99,200
 * trials: 55.6% refused, 6.0% the same door, and **38,053 silent wrong doors**
 * — of which 21.9% priced identically, so the money did not betray them
 * either. Median price change ₪200, worst ₪1,930.
 *
 * This code exists SPECIFICALLY for the telephone (see the head of this file).
 * Better than one in three, on the one channel it was built for.
 *
 * ⚠ AND IT COSTS NOTHING. `TOTAL_BITS` rounds 36 up to 40, so four bits were
 * already reserved, already transmitted, and written as zeros nobody read. The
 * check goes there. The code is still eight characters.
 *
 * WHICH CHECK, chosen by measurement rather than by taste — the same 99,200
 * substitutions plus every adjacent transposition:
 *
 *     sum of nibbles      96.8% subs   96.4% transpositions
 *     position-weighted   91.1%        93.8%      <- worse; weights collide mod 16
 *     CRC-4 (x^4+x+1)     96.8%        96.6%
 *     CRC-4, seeded 0xF   96.8%        96.6%      <- this one
 *
 * The seed makes leading-zero payloads distinguishable; a CRC beats a plain sum
 * structurally on reordering, and measures no worse on anything.
 *
 * ⚠ THIS IS WHY `VERSION` WENT TO 11, AND WHY NOW. Reading the pad as a check
 * changes what `decodeCode` ACCEPTS, so every existing code must be refused
 * rather than silently re-read — that is exactly what the version nibble is
 * for. It is free today because the site is `noindex`, undeployed, and **not
 * one code has ever been given to a customer**. It would never be free again.
 */
const checkNibble = payload => {
  let r = 0xF;                                    // seeded, so leading zeros count
  for (let i = PAYLOAD_BITS - 1; i >= 0; i--) {
    const bit = Number((payload >> BigInt(i)) & 1n);
    r = ((r << 1) | bit) & 0x1F;
    if (r & 0x10) r ^= 0x13;                      // x^4 + x + 1
  }
  return r & 0xF;
};

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
  /* The four bits that used to be written as zeros. See `checkNibble`. */
  bits = (bits << BigInt(PAD_BITS)) | BigInt(checkNibble(bits));

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

  /* ⚠ THE CHECK FIRST, before anything is read out of the payload. A code that
     does not check is not a code with one wrong field — it is a code we cannot
     trust any field of, and reading it would be the silent wrong door this
     nibble exists to stop. Measured: this refuses 96.8% of single-character
     substitutions and 96.6% of adjacent transpositions that the version and
     range checks would otherwise have let through. */
  if (Number(bits & ((1n << BigInt(PAD_BITS)) - 1n))
      !== checkNibble(bits >> BigInt(PAD_BITS))) return null;

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
