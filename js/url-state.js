/**
 * State <-> URL, and the short design code.
 *
 * PLAN.md §8.2. Two representations of the same thing:
 *   - a readable query string, for links
 *   - a short `DM-` code, for customers who telephone instead of messaging. It
 *     is an ENCODING, not a hash — a hash cannot be decoded without a server,
 *     which would make reading it aloud useless.
 *
 * ⚠ THIS SAID "a 6-character code (DM-8EH48X)" UNTIL 12.9.2026, THROUGH ELEVEN
 * VERSION BUMPS, AND THE EXAMPLE WAS INVENTED. Measured on the standard door
 * at VERSION 21 the body is **eleven** characters. That is the fault CLAUDE.md
 * §1 names about the VERSION number one paragraph over — *"a number written
 * into prose is a number that goes stale the first time somebody obeys the
 * rule around it"* — and it had gone stale in the first thing a reader of this
 * file sees. So the length is not restated here: `BITS` below is where it is
 * decided, `TOTAL_BITS` is where it is computed, and `tools/audit.mjs` derives
 * its own pattern from `encodeCode(DEFAULTS).length` rather than spelling one
 * out. Each `── NN ──` note below is history and correctly says what the
 * length was THEN; only this header was claiming a present tense.
 */

import { BELLS, COLOURS, DETAILS, GRILLES, HANDINGS, HANDLES, HANDLE_FINISHES,
         HANDLE_LEGACY, HANDLE_LENS, LOCKSETS,
         MASHKOFS, packStripes, PEEPHOLES, PIRZUL, SIZE_ALIAS, SIZES, SPECIAL_LOCKS,
         STRIPE_MAX, STRIPE_LEGACY, STRIPE_SLOTS, unpackStripes, WINDOWS } from './catalog.js';
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
/* 12: TWO LISTS WERE RE-CUT, SO EVERY INDEX AFTER THE CUT MEANS SOMETHING ELSE.
   WINDOWS lost `tallwin` and `broad`, and DETAILS lost both milled grooves and
   gained four panel and strip counts — all at the owner's son's request; the
   reasoning sits with each list in `catalog.js`. Ids alias, so every LINK ever
   written still opens a door. The short code cannot be rescued that way: it
   packs the INDEX, and index 3 in WINDOWS used to be חלון גבוה and is now off
   the end of the list. A version-11 code read under this layout is a different
   door, so it is refused with a notice instead.
   ⚠ Free today for the same reason 11 was, and it is worth restating because
   it will not be true for long: the site is noindex, undeployed, and not one
   code has ever been given to a customer. The moment one has, a bump costs
   somebody a piece of paper with a door on it. */
/* 13: THE FIELD WIDTHS MOVED. DETAILS has outgrown four bits — it went from
   fourteen entries to twenty when the two ogee panels and the four missing
   stripe compositions arrived — so `detail` is five bits now, and `window`
   pays for it by dropping from four to three. The payload is still 36 bits and
   the code is still eight characters, which matters: the alternative was to
   take the bit out of the four the CHECK NIBBLE occupies, and that check is
   why one-character typos stopped decoding into different doors.
   Nothing moved because a list was re-cut this time — every id above index 4
   simply sits at a different index under a different width, which is the same
   kind of break and gets the same treatment: a version-12 code is refused with
   a notice rather than read as another door.
   ⚠ Still free, and this is the third bump to say so. The site is noindex,
   undeployed, and not one code has been given to a customer. `window` has five
   spare values and `detail` twelve after this; the next list to watch is
   `size` at two, which ASK-PERETZ §8 expects Peretz to replace wholesale.

   ── 14 · the catalogue meets Peretz's real range, 26.8.2026 ───────────
   `speciallock` is a new field (כספת · קודן); seven options were withdrawn on
   his say-so (ברזל מחושל and its light twin, מדליוני פרח and its twin,
   זכוכית מחורצת, שירן, להב שטוח, אלמוג); and one size was appended. Every
   withdrawal shifts the indexes of everything after it in its list, which is
   exactly the break a version exists to refuse.

   ⚠ AND THE CODE IS STILL EIGHT CHARACTERS. Two over-wide fields paid for the
   new one — see `BITS` — so the payload is still 36 and the check nibble keeps
   its full four bits. A longer code would have been the easy answer and a
   worse one: the code's whole purpose is being read aloud on a telephone.

   ⚠ THE PLAN SAID TO BUMP ONCE AT THE END OF THE CATALOGUE WORK, AND THAT WAS
   WRONG. TRANSFORM.md §5.7 argued for a single bump across phases 2 to 6, on
   the grounds that five bumps issue five refusals for codes that never
   existed. True, and beside the point: a VERSION that stays still while the
   LAYOUT moves means an old code decodes into a different door with nothing
   flagging it, which is the precise failure this number exists to prevent.
   Bumps are free while nothing is deployed. Silence is not. */
/* ── 15 · the mashkof becomes a choice, 27.8.2026 ─────────────────────
   Asked for by name from outside. The frame was always drawn and never
   choosable; it is now four options and ₪500–₪1,000 of a ₪3,150 door.

   ⚠ AND THE CODE IS *STILL* EIGHT CHARACTERS, for the second version running.
   `mashkof` needs two bits and the seven withdrawals of version 14 handed back
   exactly two: `grille` is 14 entries and had 5 bits, `lockset` is 8 and had 4.
   Payload stays at 36, so `PAD_BITS` stays at 4 and the check nibble keeps its
   width.

   ⚠ THIS IS THE FIRST BUMP WITH NO SLACK LEFT. `lockset` is 8 of 8 and
   `grille` 14 of 16 — so the next product added to either needs a re-cut
   rather than a free append, and there is nowhere obvious left to take a bit
   from. `detail` has twelve spare values and `colour` fifteen; those are where
   the next bit comes from. The assertion that catches this is
   `list.length <= 2 ** BITS[f]`, which is why it is not optional.

   ⚠ AND THE FIRST DRAFT OF THIS BUMP GOT IT WRONG IN A WAY WORTH RECORDING.
   It left `grille` and `lockset` as they were, took the payload to 38, and the
   code stayed eight characters — which looked like a free win. It was not:
   `TOTAL_BITS` rounds the payload UP to a whole character, so 38 leaves
   `PAD_BITS` at **2**, and `checkNibble` returns four. Decoding failed outright
   rather than silently, which is the good version of this mistake — but had it
   returned a 2-bit check instead, the chance of a single-character typo
   surviving would have gone from 1-in-16 to 1-in-4 with nothing on screen to
   say so. The check nibble is never what gives way to make room. */
/* ── 16 · פרזול, 27.8.2026 ────────────────────────────────────────────
   The lock furniture's finish becomes a choice: ניקל · שחור · ברונזה · זהב,
   ₪0 to ₪900. Two bits, and there was no slack left after version 15 — so the
   code goes to NINE characters. Payload 38 rounds to 40, leaving the check
   nibble its full four bits; the alternative was taking a bit off the check,
   which is never what gives way. `DM-` and nine, read aloud in two groups.
   ⚠ `pz=`, never `f=`. The retired parameter belonged to the PULL HANDLE's
   finish and reusing it would make an old link mean something it never did. */
/* ── 17 · a pull bar is a length, 27.8.2026 ───────────────────────────
   Peretz prices a bar by how long it is — ₪500 under a metre, ₪150 for every
   20 cm past it — so a bar is a model AND a length, and the length reaches the
   code as a three-bit index into eight fixed values.

   ⚠ THE CODE IS TEN CHARACTERS AT THIS VERSION. Payload 42 plus the four-bit
   floor rounds to 50. It could be held at nine by cutting `handing` to one bit
   — it has exactly two entries — but that leaves the one field in the layout
   with NO headroom at all, and the version-16 overflow is a fresh reminder of
   what a field at its ceiling costs.
   ⚠ AND THIS NOTE USED TO PROMISE IT WOULD COME BACK TO NINE, on the grounds
   that phase 6 takes `detail` from 5 bits to 3 when the fourteen stripe
   entries leave it. It does — and phase 6 also adds a five-bit `stripes`
   field, which the promise forgot. Net +3, not −2. The arithmetic is left
   visible because a plan's prediction being wrong is worth more on the record
   than tidied away, and because it is the same mistake in miniature as the
   check-nibble one: counting what a change gives back without counting what it
   takes. */
/* ── 18 · the stripes become a count, 27.8.2026 ───────────────────────
   Fourteen fixed compositions leave `DETAILS` and are replaced by a direction,
   a number and a tight/spread toggle, packed as ONE ordinal — see
   `packStripes`. Peretz prices per stripe, so a pattern list could not express
   what he sells; and the test for which compositions survive ("more than two
   distinct stripe lengths") is recorded in research/works/INVENTORY.md §5a.
   ⚠ A LINK OR CODE CARRYING A RETIRED STRIPE ID STILL OPENS A REAL DOOR, and
   it needs a migration rather than an alias: `strips9` was an id in one list
   and is now a (direction, count) pair in three fields, which the alias
   mechanism — id to id, inside one list — cannot express. See `STRIPE_LEGACY`. */
/* ⚠ 19: TWO SIZES, ONE GRILLE AND ONE FACE WERE WITHDRAWN ON 27.8.2026, and
   three of the four are INDEXED lists. `narrow` and `sidelight` left `SIZES`,
   `mesh` left `GRILLES`, `panelTop` left `DETAILS` — so every index after each
   of them moved, and a v18 code decoded against v19 lists would open a
   different door at a different price in perfect silence. That is what this
   number is for.
   The `?...=` query form is not indexed and keeps working: the withdrawn ids
   resolve through `aliases` (grille, face) and `SIZE_ALIAS` (size). */
/* ⚠ 20: THE פעמון AND THE עינית ARE TWO NEW FIELDS, 30.8.2026. Peretz asked
   for both by name. Two new one-bit fields is a BIT-LAYOUT change, which is
   the one thing an alias can never rescue: a v19 code read against a v20
   layout would shift every field after the insertion point and open a
   different door at a different price, in silence. So every code written
   before today is refused with a notice instead — which is what this number
   exists to do, and the reason the work order calls the bump a ritual rather
   than a chore.
   ⚠ AND THE CODE IS ELEVEN CHARACTERS NOW, NOT TEN. The payload goes 46 -> 48
   and `TOTAL_BITS` reserves the check nibble BEFORE rounding, so it lands on
   55 rather than shaving the check. That is the correct thing to give way: a
   customer reads a code down the telephone once, and a wrong door is forever.
   The `?...=` query form is not indexed and is unaffected — a link written
   yesterday opens today with no bell and no peephole, which is the door it
   described. */
/* ⚠ 21: THE SIZE LIST IS SIX ROWS IN TWO FAMILIES, 30.8.2026. `wide`, `tall`
   and `xl` left it and `extra1`, `extra2`, `halfextra1` and `halfextra2`
   arrived — the owner's instruction, and the shape Peretz actually quotes:
   three bands on a single door and the same three on a דו כנפי. `encodeCode`
   packs the INDEX of `SIZES`, so every index after `standard` means something
   else now and a v20 code read under this layout would be a different door at
   a different price, in silence. Refused with a notice instead.
   The `?s=` form is not indexed and every one of the three withdrawn ids
   resolves through `SIZE_ALIAS` to the band it was already in, at the price it
   already had. */
/* ⚠ 22: ONE BUMP FOR A WHOLE ROUND OF THE CATALOGUE, 14.9.2026, and it is one
   deliberately. Four separate changes in this round each earn a bump on their
   own, and a version number is not a changelog — it is a fence, and a code
   either falls inside it or does not. Batched:
     · `panel` and `panelo` LEFT `DETAILS` — every index after them moved;
     · `panel3o` ARRIVED at the end of `DETAILS` — free on its own, since
       appending renumbers nothing, and carried along regardless;
     · `lever-taper` ARRIVED at the end of `LOCKSETS` — NOT free: the list was
       eight entries in a three-bit field, exactly full, so the ninth needs
       `BITS.lockset: 4` and that is a BIT-LAYOUT change, the one thing no
       alias can rescue. A v21 code read under this layout would shift every
       field after the lockset and open a different door at a different price,
       in silence;
     · `WINDOWS.rect` gained its own panel, which moves no index at all and is
       named here only so the list of what changed is the whole list.
   The payload goes 48 -> 49 and `TOTAL_BITS` reserves the check nibble BEFORE
   rounding, so it lands on 55 exactly as it did at 48: the code stays ELEVEN
   characters and the typo check keeps its full four bits.
   The `?...=` query form is not indexed. Every withdrawn id resolves through
   `aliases` — `panel` and `panelo` onto the pairs — so a link written
   yesterday opens a door rather than a notice. */
/* ⚠ 23: PERETZ'S SECOND REVIEW, 20.9.2026, AND AGAIN ONE BUMP FOR THE WHOLE
   ROUND. Five separate changes each earn it and a version is a fence, not a
   changelog. Batched:
     · `HANDLES` was re-cut from nine entries to five — אלה, שחר, רון and
       מוט שחור LEFT — so every index after `idan` moved;
     · `handleFinish` is a NEW two-bit field (ניקל · שחור · זהב), the pull
       handle's finish coming back on Peretz's own word under a new parameter
       `hf=`, never the retired `f=`;
     · `PEEPHOLES` gained a third entry — appended, so `peep` keeps its index —
       and `BITS.peephole` went 1 → 2, which is a layout change on its own;
     · `MASHKOFS` went from four entries to eight (the inner kant) and
       `BITS.mashkof` 2 → 3. The four old ids keep their index and meaning;
     · `DETAILS` lost `panel2o` and `panel3o` mid-list, so `classic` moved.
   `HANDLE_LENS` was also re-cut (600 out, 700 and 900 in), which moves the
   `handleLen` indices too. Payload 49 → 53; `TOTAL_BITS` reserves the check
   nibble before rounding and lands on 60, so the code is one character longer
   and the typo check keeps its full four bits.
   The `?...=` query form is not indexed. Every withdrawn id resolves through
   `aliases`, and two of them — `ella` and `barblack` — through `HANDLE_LEGACY`
   as well, because what made them products was a finish and the finish is a
   field now: `n=ella` opens the round bar in gold, silently. */
export const VERSION = 23;

/**
 * THE DOOR YOU ARRIVE ON, and it is a BARE ONE.
 *
 * ⚠ THIS CHANGED, AND IT CHANGED ON PURPOSE. It used to arrive as a finished
 * door — a rectangular window, an Idan pull bar, a cylinder — which is a good
 * showroom photograph and the wrong first move for a configurator. Asked for
 * from outside: *"i want that when you open up the app for the first time, you
 * just see a door with nothing, no handle even no keyhole, and then you add
 * things to that."*
 *
 * What that buys, beyond taste. Every option group now starts at its own
 * "none", so every mark on the leaf is one the customer put there and can see
 * themselves putting there; and `nowLabel` in app.js — the navigator's summary
 * of each section — starts out describing a plain door rather than describing
 * choices nobody made. The old default also quietly meant that a customer who
 * changed nothing sent Peretz an order for a bar and a window they had never
 * looked at.
 *
 * ⚠ AND IT HAS TO STAY BUILDABLE. There is an assertion that `repair(DEFAULTS)`
 * changes nothing, and it has caught a bad default twice — once when the
 * lockset was a lever the corpus refuses beside a bar, and once when a window
 * left the panel nowhere to go. A bare door passes it trivially today, which
 * means the assertion is doing less work than it used to; that is a reason to
 * keep it, not to relax it.
 *
 * ⚠ IT STARTS WITH THE ROTEM NOW, AND THAT IS PERETZ REVISING HIS OWN
 * INSTRUCTION. This block has been rewritten twice by the same person.
 *
 * Round one said `lockset: 'none'` — a leaf with no lever, no knob and no
 * keyway. ASK-PERETZ §13 asked whether he would quote a door that way and the
 * answer was immediate: *"make the door start with just a keyhole. there can't
 * be a door without a keyhole."*
 *
 * Round two is 30.8.2026: *"at the start put the rotem handle instead of just
 * the keyhole."* Same direction, one step further — a bare keyway is not a
 * door anybody buys either, and `plate` (רותם, the lever on the long
 * backplate) is what he actually fits. It is ₪0, one of the levers his "all of
 * them in the price" covers, so the opening figure is untouched by it.
 *
 * ⚠ THE PRINCIPLE UNDERNEATH DID NOT CHANGE, and it is worth restating so the
 * next round does not read this as licence. The opening door is still bare of
 * everything a customer ADDS — no window, no face design, no pull handle, no
 * ironwork, no extra lock. What it carries is what every door Peretz builds
 * carries whether or not anybody chooses it. The list of those things grew by
 * one because he says it did.
 */
export const DEFAULTS = {
  /* ⚠ 7126D, NOT THE ANTHRACITE, AND THE REASON IS THE OPENING PRICE.
     Peretz priced colour on 30.8.2026: 9016T, 9001T and 7126D are in the
     price, every other colour is +₪200. The old default `rb-0097d` (אנתרציט)
     is one of the fourteen, so the page would have opened on a door carrying a
     ₪200 option nobody chose — and printed ₪3,395 where he says a standard
     door is ₪3,195. Both halves of that are wrong: the block below is built on
     "every mark on the leaf is one the customer put there", and the opening
     figure is the one number he checks first.
     Of his three, 7126D is the one that keeps the picture: #453F3F against the
     anthracite's #4B4952 is **dE 7.3** in CIELAB, where the cream is 53.9 and
     the white 63.8. A dark neutral door stays a dark neutral door. It is also
     the only one of the three he wrote with the same `D` suffix our chart
     uses, so it is the least ambiguous of them (see COLOUR in prices.js).
     `rb-0097d` keeps every alias pointed at it; nothing about the wire format
     moves, because a default is not a wire format. */
  colour:  'rb-7126d',
  window:  'none',
  grille:  'none',
  handle:  'none',
  lockset: 'plate',
  /* ⚠ EVERY NEW FIELD NEEDS A DEFAULT HERE THE DAY IT IS INVENTED. A state
     missing a key encodes as `undefined`, which `BigInt()` throws on — or
     worse, `Math.max(0, indexOf(undefined))` masks it to 0 and it quietly
     becomes the first entry in the list. */
  speciallock: 'nospecial',
  /* ⚠ THE DOOR OPENS WITH NEITHER, INCLUDING THE ONE THAT IS FREE. The עינית
     costs nothing (assumption A7 says it is standard), so putting it on the
     opening door would cost the customer nothing either — and it would still
     be wrong. This block's whole rule is that every mark on the leaf is one
     the customer put there and can see themselves putting there, and a fitting
     that appears without being chosen is a fitting nobody can un-choose
     without first noticing it. The Rotem is on the door because Peretz said
     every door has one; he has not said that about the עינית, he said "add
     it". */
  bell: 'nobell',
  peephole: 'nopeep',
  mashkof: 'mk-std',
  pirzul:  'pz-nickel',
  /* ⚠ THE PULL HANDLE'S FINISH, 20.9.2026 — nickel until the customer picks,
     like the פרזול. It is a field whether or not a bar is on the door,
     because the פעמון follows it too; with neither on the door it prices at
     nothing and paints nothing, which is what `isUntouched` needs of it. */
  handleFinish: 'hf-nickel',
  /* ⚠ 0 = "as the model comes". Every bar has a length measured off the
     photographs and thirty recreations are checked against them; a global
     default would override all of them silently. The length is opt-in, and a
     door nobody has touched draws exactly what it always drew. */
  handleLen: 0,
  stripeDir: 'none',
  stripeCount: 0,
  stripeTight: false,
  detail:  'plain',
  size:    'standard',
  handing: 'right-in',
};

/**
 * Has this customer chosen anything at all?
 *
 * ⚠ TWO WHATSAPP CONTROLS ARE LIVE ON ARRIVAL, ON A DOOR NOBODY HAS TOUCHED,
 * and they say "send the door". A confused first-timer can fire off the
 * default as though it were a considered order — and from Peretz's side that
 * is indistinguishable from a real one, which is `PLAN.md` §0's failure mode
 * arriving from the other direction. `UX-FINDINGS` §5.
 *
 * ⚠ THE SEND IS NOT REMOVED, AND MUST NOT BE. It was taken away once and put
 * back on purpose; `npm run audit` asserts a visible send on every step at
 * every viewport, and deleting one fails that correctly. What changes is the
 * LABEL and the MESSAGE — the same channel, honestly named.
 *
 * ⚠ DERIVED FROM `DEFAULTS`, NEVER FROM A SECOND LIST OF FIELDS. The day a
 * tenth choice is added, a hand-kept list here would go on calling a door
 * untouched that somebody had just configured — §5.10 with a long fuse. This
 * walks the object that IS the definition of "untouched".
 */
export const isUntouched = state =>
  Object.keys(DEFAULTS).every(k => state[k] === DEFAULTS[k]);

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
  p.set('x', state.speciallock);
  p.set('m', state.mashkof);
  /* ⚠ `pz`, NEVER `f`. A finish axis existed once and `f=` is retired forever
     (CLAUDE.md §1) — that one was the PULL HANDLE's finish, withdrawn because
     the owner said his customers do not choose it. This is the LOCK
     FURNITURE's, priced by Peretz in three steps, and it governs a different
     set of objects. Reusing the parameter would make an old link mean
     something it never meant. */
  p.set('pz', state.pirzul);
  /* ⚠ `hf`, NEVER `f`. The pull handle's finish came back on 20.9.2026 on
     Peretz's own word — *"its like pirzul but for the pull handle"* — and it
     is the axis `f=` carried before it was withdrawn on 27.8. `f=` stays
     retired: a link in somebody's history carrying `f=black` was written when
     that choice cost ₪220 for a decision nobody made, and reading it as this
     one would make an old link mean something it never meant. */
  p.set('hf', state.handleFinish);
  /* ⚠ `bl` AND `ey`, NEVER `a`. There was a multi-select of five accessories
     once — peephole, letterplate, knocker, closer, nameplate — packed into a
     bitmask under `a=`, withdrawn on the owner's word, and `a=` is retired
     FOREVER (CLAUDE.md §1). Somebody's WhatsApp history still holds
     `?a=peep,mail`; it must open the door it always opened rather than being
     re-read as something new, so `fromQuery` goes on ignoring it in silence
     and these two are their own parameters. */
  p.set('bl', state.bell);
  p.set('ey', state.peephole);
  p.set('hl', String(state.handleLen));
  /* ⚠ ONE PARAMETER FOR THREE PROPERTIES, the same ordinal the code packs.
     Three separate parameters could carry `sd=h&sc=0` or `sd=none&sc=7` — a
     link that means nothing and that every reader downstream would have to
     guard against. One value cannot hold a contradiction. */
  p.set('sp', String(packStripes(state)));
  p.set('d', state.detail);
  p.set('s', state.size);
  p.set('h', state.handing);
    /* ⚠ `gp=` IS RETIRED — 18.9.2026. It carried the handle's position, and
     nothing positions a handle any more: the drag, the rotate button and the
     home button are gone at the owner's instruction. It is NOT written, it is
     NOT read, and it must never be reused — `f`, `a`, `z` and `i` are the
     same shape of promise.
     ⚠ NO `VERSION` BUMP, and the reason is worth keeping: the position was
     never in the short code. It rode in the link alone, deliberately, so no
     code ever written means anything different today. Withdrawing a parameter
     that was never packed costs nothing; withdrawing one that was would have
     cost every code Peretz has been read down the telephone. */
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
  /* ⚠ `sheet` BELONGS HERE AND WAS MISSED THE DAY IT WAS ADDED. `bare` is on
     this list for exactly the same reason: both are OUR rendering switches
     rather than the customer's choices. An unlisted key raises
     `option-unknown`, so every order-sheet URL opened with a red strip saying
     a choice could not be read — above a document in which every choice had
     been read perfectly. A new switch joins this list the same day it is
     invented, like everything added to the bare-mode hide list.

     ⚠ `lang` IS THE THIRD TIME, and the paragraph above predicted it. It was
     added in the same hour the languages were built and missed here, so every
     `?lang=en` load opened with a red strip reading "some options in that link
     are unavailable — showing the closest match" over a door in which nothing
     was unavailable and nothing had been changed. Found by opening the page
     and looking at it; no assertion had an opinion, because from the outside a
     notice is just a notice.
     It is OURS and not the customer's choice, like `bare` and `sheet` — a
     language is a fact about the reader, which is also why it is not in the
     short code (see `js/copy.js`). */
  const KNOWN   = new Set(['v', 'c', 'w', 'g', 'n', 'k', 'x', 'm', 'pz', 'hf', 'hl', 'sp',
                           'd', 's', 'h', 'bl', 'ey',
                           'code', 'bare', 'sheet', 'lang']);
  /* `f` finish, `a` add-ons, `z` — and `i`, the inside view, withdrawn earlier
     still. Withdrawing an option is OUR change and not the customer's mistake,
     so a link carrying one opens as itself.
     ⚠ `gp` JOINED THEM ON 18.9.2026 — the handle's position, withdrawn with
     the drag. It MOVED from `KNOWN` to here rather than simply being deleted,
     and the difference is the whole point: in `KNOWN` it would have been a
     parameter we still read, and deleted from both it would raise
     `option-unknown` on every link a customer has already sent. Here it is
     what it is — a name we own, still reserved so nothing else can take it,
     and silent. */
  const RETIRED = new Set(['f', 'a', 'z', 'i', 'gp']);
  for (const key of p.keys()) {
    if (!KNOWN.has(key) && !RETIRED.has(key)) notice = notice || 'option-unknown';
  }

  /* ⚠ `carries` — DID THIS ADDRESS DESCRIBE A DOOR AT ALL? A fact about the
     URL, and it is here because the page has been answering it with a
     different question: `js/app.js` decided "this is a shared link" by
     comparing the decoded door against `DEFAULTS`, so the ONE door that
     equals the default — the standard ₪3,195 leaf, the commonest thing
     Peretz sells — arrived at step 01 with a size picker instead of at the
     summary, on a link somebody had deliberately sent him. Measured 11.9.2026:
     `?d=DM-N300080000A` landed on `fit`; the same link with a window on it
     landed on `sum`. The door the link carries cannot answer "did somebody
     send this", and an address can.

     Everything is the customer's door except OUR OWN rendering switches. That
     is the list to keep current, and this stylesheet-shaped mistake has been
     made three times already in `KNOWN` above (`sheet`, then `bare`, then
     `lang`) — so it is stated as an exemption rather than as an allow-list: a
     new switch invented tomorrow and forgotten here makes a link open at the
     summary, which is wrong but harmless, where forgetting it in `KNOWN`
     raises a false notice. `i` is the withdrawn inside view, which was a
     switch too; `f`, `a` and `z` were axes of the DOOR and so still count as
     one, because a link carrying them is still a door somebody chose. */
  const SWITCH = new Set(['bare', 'sheet', 'lang', 'i']);
  const carries = [...p.keys()].some(k => !SWITCH.has(k));

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
    if (decoded) return { ...settle(decoded, null), carries };
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
    /* ⚠ `||`, NEVER A BARE ASSIGNMENT, AND THE REASON IS `code-unknown`.
       Two of the five places that raise `option-unknown` were guarded and
       three were not, and one of the unguarded ones is reached on EVERY
       refused code: `?d=` holds the code, the branch above sets
       `code-unknown`, and then `take('detail', 'd', DETAILS)` looks at that
       same `d`, misses (no detail id starts `DM-`), and overwrote it. So a
       code Peretz mistyped off the telephone came up saying *"some of the
       options in the link are unavailable — showing the nearest one"*, which
       is the sentence the comment above this function calls **false twice
       over**, and `code-unknown` — the one that says *"the code was not
       recognised, this is a default door"* — was unreachable from any input.
       Measured 12.9: `?d=<bad>` returned `option-unknown` for a one-character
       change, a transposition and pure nonsense alike.
       The ordering this restores is the one `showNotice` already documents:
       the WORSE news wins, and a whole door nobody recognised is worse than
       one option nobody recognised. */
    else notice = notice || 'option-unknown';
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
  /* ⚠ A WITHDRAWN BAR WHOSE IDENTITY WAS A FINISH — the third migration in
     this file, 20.9.2026. `take('handle', …)` has already landed `n=ella` and
     `n=barblack` on `idan` through its aliases; what an alias cannot carry is
     that אלה was that bar in BRASS and מוט שחור was it in BLACK, and the
     finish is a field of its own now. So the finish is set here, off
     `HANDLE_LEGACY`, and NO notice: withdrawing a product is our change and
     not this customer's mistake, and the door that opens is the door they
     sent. An explicit `hf=` on the same link wins, because it was written by
     a page that already knew the axis. */
  const legacyHandle = HANDLE_LEGACY[rawN];
  if (legacyHandle && !p.get('hf')) Object.assign(state, legacyHandle);
  /* ⚠ A RETIRED STRIPE ID IS A MIGRATION, NOT AN ALIAS, and this is the second
     one in this file (the first is `n=` for the lockset list). `strips9` was
     one id in `DETAILS`; it is now a direction, a count and a toggle across
     three state fields, and `aliases` maps id to id INSIDE one list — it
     cannot express that. Without this, every link and code written before
     today that carried a striped door would land on `DETAILS[0]` and open a
     plain one, silently, which is precisely what `fromQuery` exists never to
     do. Run BEFORE `take('detail', …)`, so the retired id is consumed rather
     than reported as unknown. */
  const legacy = STRIPE_LEGACY[p.get('d')];
  if (legacy) { Object.assign(state, legacy); state.detail = 'plain'; }
  else take('detail', 'd', DETAILS);
  take('handing', 'h', HANDINGS);
  take('speciallock', 'x', SPECIAL_LOCKS);
  take('mashkof', 'm', MASHKOFS);
  take('pirzul', 'pz', PIRZUL);
  take('handleFinish', 'hf', HANDLE_FINISHES);
  take('bell', 'bl', BELLS);
  take('peephole', 'ey', PEEPHOLES);
  /* ⚠ A NUMBER, SO `take` CANNOT DO IT — `take` resolves an id against a list
     and reports an unknown one. A length is neither: it is one of eight
     values, and anything else is a link we cannot read. Refused with the same
     notice rather than clamped silently, because a customer whose 140 cm bar
     quietly became 100 cm has been given a different door without being told —
     which is the whole reason `fromQuery` never substitutes in silence. */
  const rawStripes = p.get('sp');
  if (rawStripes != null) {
    const v = Number(rawStripes);
    if (Number.isInteger(v) && v >= 0 && v < STRIPE_SLOTS) Object.assign(state, unpackStripes(v));
    else notice = notice || 'option-unknown';
  }

  const rawLen = p.get('hl');
  if (rawLen != null) {
    const v = Number(rawLen);
    if (HANDLE_LENS.includes(v)) state.handleLen = v;
    else notice = notice || 'option-unknown';
  }

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
    /* ⚠ `SIZE_ALIAS` FIRST. `SIZES` is a plain object, so it has no `aliases`
       array and `byId` never sees it — a withdrawn size would otherwise fall
       through to `option-unknown` and open the default door under a red strip,
       on links that are already in the wild. `narrow` and `sidelight` were
       withdrawn on 27.8.2026; see the note over `SIZES`.
       A resolved alias is OUR withdrawal, not the customer's mistake, so it
       raises no notice — the same reasoning as `RETIRED` above. */
    const asSize = SIZE_ALIAS[rawSize] || rawSize;
    if (Object.prototype.hasOwnProperty.call(SIZES, asSize)) state.size = asSize;
    /* `||` for the reason given inside `take` — the worse news wins, and a
       refused CODE is worse news than a refused size. */
    else notice = notice || 'option-unknown';
  }

  /* `f`, `a` and `gp` — the finish, the add-ons and the handle's position —
     are read by nobody now, and deliberately do not set the notice. A link
     carrying them was written when the site offered them; the door it names is
     still buildable and still that customer's door, so it opens as itself
     rather than being flagged as damaged. Withdrawing an option is our change,
     not their mistake.
     ⚠ `gp` JOINED THEM ON 18.9.2026 and stays in `KNOWN` for exactly that
     reason: a parameter that is ignored ON PURPOSE has to be told apart from
     one nobody has heard of, or the customer gets a red strip about a door
     that is perfectly correct. */

  return { ...settle(state, notice), carries };
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
     It read "the combination in the link cannot be manufactured", which was
     false for the commonest repair there then was: a stale `gp=` moved the
     HANDLE, and the handle's position was not part of the order at all.
     Measured on the default door at the time, 1,344 of 1,353 positions
     repaired the position and nothing else, and every one of them said the
     door could not be built. Peretz opening that link had to ask which door it
     is — the one question this site exists to make unnecessary.
     ⚠ THAT REPAIR NO LONGER EXISTS: `gp=` was retired on 18.9.2026 and the
     handle has one position. The measurement is kept because the ARGUMENT it
     produced is what still governs — `said` rides along because the notice's
     KIND cannot say what happened — and because a reader meeting `gp` in this
     paragraph should find out here that it is gone rather than go looking. */
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

/* ⚠ THE CAPACITY TABLE THAT USED TO BE HERE IS DELETED, 14.9.2026, and this
   is the THIRD hand-kept copy of the same figures this file has had to
   correct. It printed nine "capacity / used" pairs, every one of them typed,
   and by the time anybody read it again the lists had moved four times
   underneath it: it claimed `lockset 16 / 10` for a field that was three bits
   holding eight and completely full. A budget table that is wrong about which
   field is full is worse than no table, because its whole job is to be
   consulted before an append.
   `npm test` measures the spare per field off `BITS` and the lists themselves
   and prints it. Read that. What belongs here is only the REASON: a field that
   overflows does not throw. An eighth grille in three bits is stored as grille
   0 — the customer picks scrollwork, reads the code down the phone, and Peretz
   builds a door with no grille. Not an error, not a refusal, just a different
   door.

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

   ⚠ AND IT HAS NOW HAPPENED FOR REAL, 14.9.2026. This warning has named a
   different "field nearest its ceiling" in each of its last three revisions —
   first `detail`, then `size` — and the field that actually filled up was
   `lockset`: eight entries in three bits, exactly full, and Peretz asked for a
   ninth lever. Nothing reported it. It was found by reading `BITS` beside the
   list before appending, which is the habit this note exists to instil, and it
   was paid for by widening the field rather than by tightening another (see
   the note on `BITS`).
   ⚠ SO THE RULE IS NOT "WATCH THIS FIELD", IT IS "MEASURE BEFORE APPENDING".
   No table is kept here. `npm test` measures the spare per field and prints
   it, because every hand-kept copy of those figures this file has carried went
   stale — three of nine rows in one, and the one deleted above named the full
   field as the roomiest. `SIZES` is still the list ASK-PERETZ.md expects the
   owner to REPLACE WHOLESALE (§8, the size bands), and `handing` still holds
   the two outward-opening hands in a field that fits exactly four, so a fifth
   would wrap to `right-in`. Neither of those is a measurement; both are facts
   about what the owner may yet ask for. */
/* ⚠ `detail` AND `window` ONCE MOVED TOGETHER, and the episode is worth
   keeping even though neither width survives. DETAILS reached twenty entries —
   over its ceiling, which would have stored the twentieth as the FIRST and
   built a plain door from a code that reads perfectly — so it was widened, and
   WINDOWS paid for it out of the slack it had carried since being cut to two
   shapes and none. Both lists have since been re-cut again; the widths are in
   `BITS` below and nowhere else, and the sizes each field can hold are
   measured and printed by `npm test` rather than written here. Two numbers in
   this paragraph used to name the payload and the code length and both had
   been wrong for an unknown number of rounds — see the note four blocks down,
   which is why nothing in this file states either as prose any more. */
/* ⚠ RE-CUT FOR `speciallock`, AND THE CODE IS STILL EIGHT CHARACTERS.
   A new field needs bits and the obvious answer is a longer code. It is not
   needed here: two fields were carrying more width than their lists have ever
   used, and tightening them pays for the new one exactly.

     colour   6 -> 5    17 entries, and 5 bits holds 32
     window   3 -> 2     3 entries, and it has been 3 since the list was cut

   Payload stays at 36, so `PAD_BITS` stays at 4 and the CRC nibble keeps its
   full width. ⚠ THAT IS THE POINT OF DOING IT THIS WAY. Letting the payload
   fall to 34 would round the total to 35 and leave the check ONE bit — turning
   a 1-in-16 chance of a typo slipping through into 1-in-2, silently, as a side
   effect of tidying. The check nibble is what makes a code safe to read down a
   telephone (REDESIGN.md §1.5: 38.4% of single-character typos used to decode
   to a different valid door); it is never the thing that gives way. */
/* ⚠ `bell` AND `peephole` ARE ONE BIT EACH, ADDED 30.8.2026, AND THE PAYLOAD
   IS 48. Two two-entry lists need one bit apiece and there is nothing to
   tighten this time: measured, every other field is at its minimum width bar
   `handing`, which holds two of four on purpose (the two outward-opening hands
   fill it exactly). So the code grows, which is what `TOTAL_BITS` is built to
   let it do.

   ⚠ AND THE COMMENTS ABOVE SAID "PAYLOAD 36" AND "EIGHT CHARACTERS" FOR AN
   UNKNOWN NUMBER OF ROUNDS. Measured on the committed tree before this change:
   the payload was **46** and the code was **TEN** characters. Two numbers
   written into prose about a thing that had moved four times underneath them,
   which is §6's standing complaint about this repository — and worse here than
   most, because the paragraphs they sit in are the ones somebody reads when
   deciding whether a new field will fit. Neither figure is restated as a
   constant here: `PAYLOAD_BITS` and `CODE_LEN` are both derived, and the test
   file computes the code's length rather than typing it. */
/* ⚠ `lockset` IS FOUR BITS, 14.9.2026, AND IT WAS THE FIRST FIELD IN THIS
   LAYOUT TO ACTUALLY FILL UP. Three bits hold eight and `LOCKSETS` held
   exactly eight, so the ninth — the curved lever Peretz asked for — would have
   encoded as index 0 and built a Coral from a code that reads perfectly. That
   is the failure the warning above describes for `SIZES` and it arrived here
   first. Nothing is tightened to pay for it: the payload goes 48 -> 49 and
   `TOTAL_BITS` absorbs it inside the same 55, because the check nibble is
   reserved before the rounding. The code does not get longer. */
/* ⚠ THREE FIELDS MOVED ON 20.9.2026 AND ONE ARRIVED. `handleFinish` is new
   (three entries, two bits); `peephole` is two bits for its third entry;
   `mashkof` is three bits for its eight. Nothing is tightened to pay for
   them — `handle` stays four bits over five entries because Peretz has five
   more RB products he has not named yet (ASK-PERETZ §1f), and a field at its
   ceiling is what the 14.9 lockset overflow was about. Payload 53. */
export const BITS = { version: 5, colour: 5, size: 3, handing: 2, window: 2,
                      grille: 4, handle: 4, lockset: 4, detail: 3,
                      speciallock: 2, mashkof: 3, pirzul: 2, handleLen: 4,
                      stripes: 5, bell: 1, peephole: 2, handleFinish: 2 };
/* The payload does not divide by 5, so the code carries the next multiple up
   and the top bits are always zero. Rounding UP is the only safe direction:
   truncating would drop the low bits of the last field. Both numbers are
   derived below — see the note on `PAYLOAD_BITS` and `CODE_LEN`, and §6 on
   what writing them into prose has cost this file before. */
const PAYLOAD_BITS = Object.values(BITS).reduce((a, b) => a + b, 0);

/**
 * ⚠ THE CHECK IS RESERVED BEFORE THE ROUNDING, NOT AFTER IT — and this line is
 * the fix for a trap that caught two consecutive version bumps.
 *
 * It used to be `ceil(payload / 5) * 5`, with the check nibble taking whatever
 * was left over. That reads as thrift and behaves as a hazard: the leftover is
 * `-payload mod 5`, so it is 4 bits at payload 36 and **2** at payload 38. Add
 * one two-bit field to a comfortable layout and the typo check silently halves
 * its own strength, with nothing in the arithmetic to say so.
 *
 * It happened twice. Version 15 took the payload to 38 and decoding failed
 * outright, which is the lucky version — `checkNibble` returns four bits and
 * the stored field was two, so they could never match. Version 16 walked into
 * the identical wall one field later. Both times the temptation was to shave a
 * bit off the check to make the sum come out.
 *
 * So the check is a FLOOR, not a remainder: reserve `CHECK_MIN` first, then
 * round the whole thing up to a character boundary. The code gets longer when
 * it must, which is the correct thing to give way — a customer reads a code
 * down a telephone once, and a wrong door is forever. `REDESIGN.md` §1.5
 * measured the stakes: with no check at all, 38.4% of single-character typos
 * decoded to a different valid door.
 */
/* ⚠ AND THE VERSION FIELD CAN OVERFLOW TOO, WHICH NOTHING WAS CHECKING.
   `version` was four bits, and version 16 does not fit in four bits: it
   encoded as 0, decode read 0, compared it against 16 and refused every code
   the app produced. Every code. It failed loudly, which is luck rather than
   design — a `VERSION` that wrapped onto a number this app had once USED would
   have decoded an old layout as a new one.

   The assertion that catches a list outgrowing its field is
   `list.length <= 2 ** BITS[f]`, and it never covered this one because the
   version is not a list. It is five bits now (31 versions), and `npm test`
   asserts VERSION fits — the same guard, on the one field that had none. */
const CHECK_MIN = 4;
const TOTAL_BITS = Math.ceil((PAYLOAD_BITS + CHECK_MIN) / 5) * 5;
/* Whatever is left after the payload — at least `CHECK_MIN`, often more. The
   CRC written into it is four bits wide, so any spare high bits are always
   zero and a corruption that sets one is caught for free. */
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
    [Math.max(0, SPECIAL_LOCKS.findIndex(x => x.id === state.speciallock)),
     BITS.speciallock],
    [Math.max(0, MASHKOFS.findIndex(m => m.id === state.mashkof)), BITS.mashkof],
    [Math.max(0, PIRZUL.findIndex(z => z.id === state.pirzul)), BITS.pirzul],
    /* The INDEX, not the millimetres: 2000 mm would need eleven bits and the
       eight lengths need three. This is also why the lengths are a fixed list
       rather than a free number — see `HANDLE_LENS`. */
    [Math.max(0, HANDLE_LENS.indexOf(state.handleLen)), BITS.handleLen],
    [packStripes(state), BITS.stripes],
    [Math.max(0, BELLS.findIndex(x => x.id === state.bell)), BITS.bell],
    [Math.max(0, PEEPHOLES.findIndex(x => x.id === state.peephole)), BITS.peephole],
    [Math.max(0, HANDLE_FINISHES.findIndex(x => x.id === state.handleFinish)), BITS.handleFinish],
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
  const special = SPECIAL_LOCKS[read(BITS.speciallock)];
  const mashkof = MASHKOFS[read(BITS.mashkof)];
  const pirzul  = PIRZUL[read(BITS.pirzul)];
  const hLen    = HANDLE_LENS[read(BITS.handleLen)];
  const sp      = read(BITS.stripes);
  const bell    = BELLS[read(BITS.bell)];
  const peep    = PEEPHOLES[read(BITS.peephole)];
  const hf      = HANDLE_FINISHES[read(BITS.handleFinish)];
  /* ⚠ `hLen === undefined`, NOT `!hLen`. Zero is a VALID value — it is the
     "as the model comes" default and the commonest length in the range — and
     `!0` is true, so a truthiness guard refused every code for an untouched
     door. Every other field here is an object, where falsy really does mean
     "not found"; this one is a number and needed its own test. */
  if (!colour || !size || !handing || !window || !grille || !handle || !lockset
      || !detail || !special || !mashkof || !pirzul || hLen === undefined
      || !bell || !peep || !hf) return null;

  return {
    colour: colour.id, size, handing: handing.id, window: window.id,
    grille: grille.id, handle: handle.id, lockset: lockset.id, detail: detail.id,
    speciallock: special.id, mashkof: mashkof.id, pirzul: pirzul.id,
    bell: bell.id, peephole: peep.id, handleFinish: hf.id,
    handleLen: hLen, ...unpackStripes(sp),
  };
}
