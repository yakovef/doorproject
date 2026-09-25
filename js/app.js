/**
 * Wiring, and the cabinet.
 *
 * ── the cabinet, now two deep ────────────────────────────────────────
 * The choices panel used to render every option in every group on first
 * paint: eleven headings, sixty-odd tiles, before the customer had decided
 * anything. It read as a parts catalogue, and on a phone it put the WhatsApp
 * button — the entire purpose of the site (PLAN.md §0) — eight screens down.
 *
 * One level of folding fixed the tiles and left the headings: nine categories
 * is still a list to read before anything can be chosen, and the two most
 * obscure of them were things the business does not actually sell. Those are
 * withdrawn, and what remains folds again.
 *
 * So the page now opens on FOUR questions — how it looks, its glass, its
 * handles, its measurements — and each opens onto its own categories, and each
 * of those onto its options. One open at a time at BOTH levels, which is what
 * keeps the panel to a screen however deep the customer goes.
 *
 * ── one table ────────────────────────────────────────────────────────
 * Every group is a row in GROUPS and every group belongs to exactly one
 * SECTION; everything downstream — building, selecting, gating, summarising —
 * walks those two lists. Withdrawing the add-ons and the finish this round was
 * two deleted rows here and nothing else in this file. What used to happen
 * instead is visible in the git history: a group meant edits in index.html,
 * buildTiles, paint, markSelected and a bespoke gate function, and the gate
 * that lived only here was invisible to shared links.
 */

import {
  BELLS, byId, colourCode, COLOURS, DETAIL_SUBS, DETAILS,
  GRILLES, handleLength, handleLensFor, HANDINGS, HANDLES, HANDLE_FINISHES, LOCKSETS, MASHKOFS,
  mashkofFor, MASHKOF_PARTS, MASHKOF_WIDER_A, BUILD_A,
  PEEPHOLES, PIRZUL, PLACEHOLDER, SIZES, SPECIAL_LOCKS, STRIPE_MAX, WINDOWS,
} from './catalog.js';
import { breakdownRows, deltaLabel, formatAgorot, priceAgorot, priceLabel, priceParts, tileAgorot }
  from './price.js';
import {
  describe, detailGlyph, grilleGlyph, handleGlyph, locksetGlyph,
  bellGlyph, handleFinishGlyph, copyOf, mashkofGlyph, peepholeGlyph, pirzulGlyph, render, sizeGlyph,
  specialLockGlyph, stripesGlyph,
  windowGlyph,
} from './renderer.js';
import { conflicts, repair } from './rules.js';
/* The navigator's circles and the summary's row marks. They live in their own
   file because a `const` in here can only be read by the browser, and two
   pictures that share a shape can only be found by rasterising them — see the
   header of `js/icons.js`, and the pairwise check in `tools/audit.mjs`. */
import { sectionIcon, specIcon } from './icons.js';
import { handingWords, specRows, summaryLine } from './spec.js';
import { canSharePicture, copyMessage, drawingCaveat, fallbackWhatsappUrl,
         gripAddendum, PHONE_DISPLAY, PHONE_TEL, priceCaveat,
         priceIncludes, sendDoor, whatsappUrl } from './share.js';
import { counted, L, LANGS, lang, pickLang, setLang, T, withLang } from './copy.js';
import { DEFAULTS, encodeCode, fromQuery, isUntouched, toQuery } from './url-state.js';
import { WORKS } from './works.js';

const $ = sel => document.querySelector(sel);

let state = { ...DEFAULTS };

/**
 * The categories, in the order a customer decides them.
 *
 * `kind` picks the tile shape. `delta` defaults to the option's own; size
 * overrides it because a size carries a base price rather than a surcharge.
 * `in` names the section this category folds under — see SECTIONS below.
 *
 * Two rows are gone from this list and are worth naming, because their ids
 * remain a wire format: `addons` (peephole, letterplate, ring knocker, door
 * closer, nameplate) and `finish` (brushed nickel, matte black, brass). Both
 * were withdrawn at the owner's instruction — they are not things his
 * customers order — and everything that made them work went with them.
 */
/* ⚠ EVERY `title` AND `hint` BELOW IS A COPY KEY, NOT A SENTENCE — and so is
   every `title`/`sub`/`lede` in `SECTIONS`. This array is a module-level
   constant: written as `T('g.colour')` its values would be resolved ONCE, at
   import, before `setLang` has read the customer's language, and the whole
   interface would be frozen in whichever language the bundle happened to load
   in. Nothing would throw. The page would look right. `js/rules.js` carries
   the same note over `SAID`, because it is the same trap and this file walked
   into it twice. The readers call `T()` at render time — `markSteps`,
   `buildSection`, `buildGroup`. */
const GROUPS = [
  /* `label` and `meta` used to sit here and nothing read either of them; `meta`
     also spelled the chart code "RAL", which it is not — see `colourCode`. */
  /* ⚠ THE CHART IS SPLIT BY WHAT IT COSTS, AND THE SPLIT IS DERIVED.
     Asked for from outside, 30.8.2026: *"in the color category, there are some
     colors that are in the price and some that are +200, i want for the user
     to be able to know which colors cost extra money and which are practically
     free."* Seventeen identical circles said nothing about money until the
     total moved underneath them, which is the worst moment to find out.

     Two headed groups rather than a badge on each chip: a badge on fourteen of
     seventeen swatches is noise, and the three that matter are the ones a
     customer is looking for. It also survives colour blindness, which a tint
     or a border on the chip itself would not — this screen IS a colour
     comparison, so nothing may be said in colour here.

     ⚠ AND IT PARTITIONS ON `o.delta`, NEVER ON A HAND-KEPT LIST OF IDS. The
     three free ones are Peretz's (9016T, 9001T, 7126D) and he will change
     them; a second list here would be the §5 bug with a fortnight's fuse on
     it. The heading prints the surcharge it actually found, so if the ₪200
     ever moves the label moves with it. */
  { key: 'colour', title: 'g.colour', in: 'colour', kind: 'swatch', list: () => COLOURS,
    hint: 'g.colour.h',
    split: list => {
      const free = list.filter(o => !o.delta);
      const paid = list.filter(o => o.delta);
      /* One surcharge today. If two ever coexist the heading would have to
         name a range rather than a figure, so it says so instead of quietly
         printing the cheapest. */
      const deltas = [...new Set(paid.map(o => o.delta))];
      const plus = deltas.length === 1
        ? T('g.colour.plus', formatAgorot(deltas[0]))
        : T('g.colour.plusMany');
      return [[T('g.colour.free'), free], [plus, paid]];
    } },

  /* ⚠ EVERY FACE IN THIS LIST IS OFFERED ON EVERY DOOR SINCE 14.9.2026, and
     the machinery that made that untrue is gone with the faces it hid.
     `glazedOnly` marked the two lone panels — offered only on a glazed leaf,
     because *"the only instance when on a door is only one panel is when there
     is a window and a panel at the bottom"* — and `listed` was the predicate
     that applied it. Peretz has now withdrawn both faces outright, and the
     panel under a square light belongs to the WINDOW rather than to this list.
     With nothing left to hide there is no predicate, and `markGroup` shows
     every option in every group.

     ⚠ THE EPISODE IS WORTH KEEPING BECAUSE THE BUG WAS IN WHEN IT RAN, NOT IN
     WHAT IT SAID — 8.9.2026. It began as a `list()` FILTER, and `list()` is
     read when `buildPanel` builds the tiles: at boot, and on a language
     switch. So it was evaluated against the state the page BOOTED in and never
     again. The default door is solid, so both singles were filtered out at
     boot and stayed out; a customer who then chose חלון מרובע had a panel
     forced onto them with no tile to show it, and the gallery's d048, d051 and
     d087 loaded with a face the list omitted. Both left the step that asks
     what is on the front of the door showing a list with nothing selected and
     the customer's own answer absent.
     It became a live predicate, asked on every paint, and that was right. The
     lesson survives the deletion: a rule about WHAT IS SHOWN belongs where the
     painting happens, because the thing it depends on can change after the
     tiles are built. If a listing rule is ever wanted again it goes in
     `markGroup` and not in `list()` — the hook there is deleted with this
     one, because a hook nothing uses is a branch nothing tests. */
  { key: 'detail', title: 'g.detail', in: 'face', kind: 'tile',
    list: () => DETAILS,
    glyph: detailGlyph, subs: DETAIL_SUBS, hint: 'g.detail.h' },

  { key: 'window', title: 'g.window', in: 'glass', kind: 'tile', list: () => WINDOWS,
    glyph: windowGlyph, hint: 'g.window.h' },

  { key: 'grille', title: 'g.grille', in: 'glass', kind: 'sq', list: () => GRILLES,
    glyph: grilleGlyph, hint: 'g.grille.h' },

  { key: 'handle', title: 'g.handle', in: 'grip', kind: 'hw', list: () => HANDLES,
    glyph: handleGlyph, hint: 'g.handle.h' },

  /* ⚠ THE PULL HANDLE'S FINISH, 20.9.2026, ON THE OWNER'S OWN WORD — *"its
     like pirzul but for the pull handle"* — and it is the axis withdrawn on
     27.8 coming back under a new id and a new parameter (`hf=`, never `f=`;
     see `HANDLE_FINISHES`). It paints the bar and the bow, and since the same
     day the פעמון, which is why the bell's group follows this one on the
     same step rather than staying with the פרזול. Nickel, black +100, gold
     +200, charged on each thing it recolours. */
  { key: 'handleFinish', title: 'g.handleFinish', in: 'grip', kind: 'hw',
    list: () => HANDLE_FINISHES, glyph: handleFinishGlyph, hint: 'g.handleFinish.h' },

  /* ⚠ THE פעמון STANDS WITH THE PULL HANDLES SINCE 20.9.2026 — Peretz: *"put
     the bell with the pull handles and the pirzul for it changes its price by
     100 or 200."* It was on the פרזול step from 30.8 with the עינית, for the
     reason written over that group; what moved it is that its metal and its
     surcharge follow the HANDLE finish now, so the customer who has just
     chosen a gold bar sees the ring go gold beside it. The עינית stays on
     `pz`: the פרזול is what recolours it. */
  { key: 'bell', title: 'g.bell', in: 'grip', kind: 'hw', list: () => BELLS,
    glyph: bellGlyph, hint: 'g.bell.h' },

  { key: 'lockset', title: 'g.lockset', in: 'lock', kind: 'hw', list: () => LOCKSETS,
    glyph: locksetGlyph, hint: 'g.lockset.h' },

  /* ⚠ A NEW AXIS, AND ITS OWN GROUP RATHER THAN TWO MORE LOCKSET TILES.
     A lockset is the furniture on the outside face and there is exactly one of
     it; a כספת or a קודן is a lock fitted BESIDE it, so a door can carry a
     lever, a smart lock and a keypad at once and Peretz prices all three
     independently. Putting them in `LOCKSETS` would have made three products
     mutually exclusive that are not. */
  { key: 'speciallock', title: 'g.speciallock', in: 'lock', kind: 'hw',
    list: () => SPECIAL_LOCKS, glyph: specialLockGlyph,
    hint: 'g.speciallock.h' },

  /* ⚠ THE FINISH OF THE LOCK FURNITURE, AND NOT OF THE PULL HANDLE. Peretz was
     explicit that פרזול recolours the ידית, the צירים, the עינית and the
     סגר ביטחון and NOT the pull handle — which is also the bug he reported in
     the same sentence. A pull bar's finish is a fact about that product (Ella
     is brass); this is a choice, and it is ₪0 to ₪900.
     ⚠ This comment also said "or the stripes", and he reversed that on 30.8:
     *"pirzul doesnt affect the additional lock, but it does affect the
     stripes."* The list as it now stands — six things it reaches, two it does
     not, and one it reaches in two finishes of four — is stated for a
     customer in `exp.pz.a` and for us in `js/spec.js`. */
  { key: 'pirzul', title: 'g.pirzul', in: 'pz', kind: 'hw', list: () => PIRZUL,
    glyph: pirzulGlyph, hint: 'g.pirzul.h' },

  /* ⚠ THE עינית, 30.8.2026, ON THE פרזול STEP. Peretz asked for it by name.
     It is neither a lock nor a grip, so it does not belong on `lock` or
     `grip` — and it is not worth a tenth step of its own, because a step with
     one yes/no question in it is a page turn for a checkbox. `pz` is the step
     that already asks "and what else is on the door", and the פרזול is what
     recolours it. (The פעמון stood beside it here until 20.9.2026; it follows
     the pull handle's finish now and stands on `grip` — see above.) */
  { key: 'peephole', title: 'g.peephole', in: 'pz', kind: 'hw', list: () => PEEPHOLES,
    glyph: peepholeGlyph, hint: 'g.peephole.h' },

  { key: 'size', title: 'g.size', in: 'fit', kind: 'tile', list: () => Object.values(SIZES),
    /* `delta: z => z.base - SIZES.standard.base` used to live here, and it was
       the reason the narrow door read "כלול" and then took ₪100 off: it is a
       difference from a FIXED baseline, clamped at zero by the label. Prices
       come from `tilePrice` now, which reads this size's own entry out of
       `priceParts` — so the size tiles show what each door costs rather than
       what it costs relative to a door nobody is looking at, and no group
       needs its own idea of what a price is. */
    glyph: sizeGlyph,
    hint: 'g.size.h' },

  /* ⚠ THE FRAME, ASKED FOR BY NAME FROM OUTSIDE. It was always drawn and never
     choosable, and it is ₪500 to ₪1,000 of a ₪3,150 door — too much money to
     leave as a fact about the picture. It sits in `fit` beside the size and the
     opening direction because all three are facts about the HOLE IN THE WALL
     rather than about the door, which is the one thing a fitter asks first. */
  /* ⚠ NOT TILES SINCE 20.9.2026 — `kind: 'mashkof'` is the one group with a
     builder of its own (`buildMashkof`): a section diagram and three rows of
     two, because Peretz sells the frame as three PARTS, any combination, and
     eight tiles for eight combinations would have asked the customer to find
     their frame in a list instead of ticking the parts they want. The list is
     still `MASHKOFS`, so the state, the URL, the code, the price and the order
     see one id exactly as before; only the control changed shape.
     ⚠ THE FIGURE IN THE HINT IS PASSED IN, NOT WRITTEN INTO THE STRING. A
     shekel figure may be written in `prices.js` and nowhere else (CLAUDE.md
     §1), and Part A of this round put "₪250" into two copy strings in three
     languages, which is six places for one number to go stale. */
  { key: 'mashkof', title: 'g.mashkof', in: 'mk', kind: 'mashkof', list: () => MASHKOFS,
    hint: 'g.mashkof.h', hintArgs: () => [formatAgorot(MASHKOF_WIDER_A)] },

  { key: 'handing', title: 'g.handing', in: 'fit', kind: 'pill', list: () => HANDINGS,
    hint: 'g.handing.h' },
];

/**
 * The four questions the page opens on.
 *
 * Not a tidier arrangement of the same nine headings — a shorter list of
 * BIGGER questions, each one something a customer already has an opinion about
 * before they arrive. "What colour, and does it have panels" is one thought.
 * "Does it have glass, and what kind" is another. Nobody arrives with an
 * opinion about the glass as distinct from the grille — which is why there is
 * one list for what is in the window now, and not two.
 *
 * Four is also as far as this can usefully fold: a section holding one
 * category is a click that reveals a click, which is worse than the list it
 * replaced.
 */
/* ⚠ STRUCTURE IS THE FIRST QUESTION NOW, AND IT USED TO BE THE LAST.
   `מבנה הדלת` — the size list and which way it opens — sat in section 04,
   behind the colour, the window and the hardware. It is the thing a customer
   has an opinion about before they arrive ("we need a wide one, with a side
   light") and the thing that changes the drawing most; asking for the paint
   first and the shape of the door last is backwards. From the second mockup,
   read in `MOCKUP2.md` §3.1 and decided in `REALISM2.md` §3.

   What this costs: NOTHING in the wire format. Section keys — `fit`, `look`,
   `glass`, `hw` — appear in the DOM as `data-step`/`data-section` and nowhere
   in `js/url-state.js`, so no `VERSION` bump, no alias, and every link and
   every `DM-` code ever written still decodes to the same door. The option
   ids and their indices are untouched; this list is not one of them.

   The `01`–`04` follow for free, because they are a CSS counter on
   `.panel--choose` rather than a digit stored here. This reorder is precisely
   the event a stored digit would have gone stale on.

   ⚠ `size` STAYS ONE GROUP. The mockup splits "structure" (side light, leaf
   and a half, double, single) from "dimensions"; ours is one list, one set of
   bits in the code, and its six tiles carry both facts at once. And the size
   BANDS stay empty — `ASK-PERETZ.md` §8: overlapping bands make a customer
   choose wrong and feel certain about it. */
/**
 * ⚠ THE HARDWARE COMES BEFORE THE FACE, AND THAT IS PERETZ, 30.8.2026:
 * *"handles before the panels."*
 *
 * The three hardware steps — grip, lock, pirzul, which together are the old
 * cabinet's one ידיות ומנעול section — moved above `face`. Nothing else moved:
 * `face` and `glass` stay adjacent because a panel and a window compete for
 * the same half of the leaf and `repair` trades between them, and splitting
 * that pair would put a rule's two halves either side of three unrelated
 * questions.
 *
 * ⚠ THE ORDER OF THIS ARRAY IS THE ORDER OF THE FLOW, AND IT IS NOT A WIRE
 * FORMAT. These keys appear in the DOM as `data-step` and nowhere in
 * `js/url-state.js`, so no code, no link and no saved design moves — the same
 * reason מבנה הדלת could become section 01 for free. The `01`–`08` follow by
 * themselves because they are a CSS counter, which is exactly why they are
 * one: there is no number here to keep in step.
 *
 * ⚠ IT USED TO REVERSE WHICH WAY ONE REPAIR RAN, AND THAT REPAIR IS GONE.
 * A three-panel face carried its own pull, so the face and a grip could not
 * both be had, and the ORDER of the two steps decided which of them a customer
 * usually lost. Peretz withdrew the rule on 14.9.2026 — *"the handle should
 * only appear if i choose it in the pull handle section"* — so every face goes
 * with every grip and the ordering has no such consequence left.
 * The observation the paragraph made is still the reason to think about order
 * at all: where two steps can take each other's answer away, the LATER one
 * wins for most customers, whatever `repair`'s `intent` tie-break says, simply
 * because that is the one they reach second.
 */
/* ⚠ משקוף MOVED FROM SECOND TO LAST, 30.8.2026, AND NOTHING ELSE MOVED.
   Reported from outside, looking at the shipped flow: it is the most technical
   decision in the whole guide — four cross-sections whose difference is a wall
   thickness a homeowner has not measured — and it was arriving at step two,
   before the customer had made a single choice they enjoyed. A flow that opens
   with its hardest question is a flow people leave.

   ⚠ AND PERETZ'S OWN ORDERING RULE IS THE CONSTRAINT THAT SHAPED THE REST.
   30.8: *"handles before the panels."* So `grip` and `lock` stay ahead of
   `face`, which they already were, and that reorder was only `mk` travelling
   to the end. What is left reads as: the door's shape, its colour, what locks
   it, what you hold, the metal's finish, the face, the glass — and then the
   frame it all hangs in, which is the one thing we measure at the customer's
   wall anyway. (The lock and the grip swapped on 14.9, on a second sentence
   from him; see the note on `SECTIONS`.)

   ⚠ THE KEYS DO NOT CHANGE, AND THAT IS WHY THIS IS CHEAP. They appear in the
   DOM as `data-step` and NOWHERE in the URL or the short code, so no link
   already sent goes stale and no VERSION moves. The `01`-`08` digits are a CSS
   counter over position, which is exactly why they are a counter — this
   reorder is the event a stored digit would have gone stale on. */
const SECTIONS = [
  { key: 'fit',    title: 'step.fit.t',    sub: 'step.fit.s',    lede: 'step.fit.l', exp: 'exp.fit' },
  { key: 'colour', title: 'step.colour.t', sub: 'step.colour.s', lede: 'step.colour.l', exp: 'exp.colour',
    expArgs: () => [T('colour.measured')] },
  /* ⚠ THE LOCK COMES BEFORE THE GRIP, 14.9.2026 — Peretz: *"the lockset
     section should come before the pull handle section."* They were the other
     way round and had been since the two were split.
     His own earlier rule, *"handles before the panels"* (30.8), is untouched:
     both of these still stand ahead of `face`, which is what that sentence was
     about. This is an order WITHIN the pair.
     ⚠ AND IT IS THE THIRD TIME THIS LIST HAS MOVED FOR ONE SENTENCE FROM HIM
     — `mk` from second to last, `pz` after the two fittings, and now this. The
     keys do not change, so no link goes stale and no `VERSION` moves; the
     `01`-`08` a customer sees is a CSS counter over position, which is exactly
     why it is a counter. What does have to move with it is `WANT_ORDER` in
     `tools/audit.mjs`, which asserts the WHOLE sequence off the rendered
     navigator rather than a pair-wise rule — so a half-finished reorder fails
     there rather than shipping. */
  /* ⚠ AND THE פרזול COMES STRAIGHT AFTER THE LEVER, 25.9.2026, ON THE OWNER'S
     SON'S WORD: *"the pirzul page needs to be straight after the lever
     page."* It stood after the grip, where 30.8 put it when the three
     hardware steps moved ahead of `face` as one block.
     ⚠ FOURTH MOVE OF THIS LIST AND THE FIRST WITH A REASON THE PAGE ITSELF
     STATES: the פרזול is the FINISH of the lock furniture chosen one step
     earlier — `exp.pz.a` names the lever and its keyhole first among what it
     recolours — so a customer who has just picked a Coral lever is asked what
     metal it is in while the lever is still the thing they are looking at.
     Asked after the pull handle, the answer applied to something two screens
     back. The grip keeps its own finish (`hf=`) on its own step, which is why
     the two can be separated at all without splitting one question in half.
     Peretz's *"handles before the panels"* (30.8) is untouched — `lock`, `pz`
     and `grip` all still stand ahead of `face` — and so is his *"the lockset
     section should come before the pull handle section"* (14.9): `lock` is
     still ahead of `grip`, with the finish of what `lock` chose between them.
     What has to move with it is `WANT_ORDER` in `tools/audit.mjs`, which
     asserts the WHOLE sequence off the rendered navigator, so a half-finished
     reorder fails there rather than shipping. */
  { key: 'lock',   title: 'step.lock.t',   sub: 'step.lock.s',   lede: 'step.lock.l', exp: 'exp.lock' },
  { key: 'pz',     title: 'step.pz.t',     sub: 'step.pz.s',     lede: 'step.pz.l', exp: 'exp.pz' },
  { key: 'grip',   title: 'step.grip.t',   sub: 'step.grip.s',   lede: 'step.grip.l', exp: 'exp.grip' },
  { key: 'face',   title: 'step.face.t',   sub: 'step.face.s',   lede: 'step.face.l', exp: 'exp.face' },
  { key: 'glass',  title: 'step.glass.t',  sub: 'step.glass.s',  lede: 'step.glass.l', exp: 'exp.glass' },
  { key: 'mk',     title: 'step.mk.t',     sub: 'step.mk.s',     lede: 'step.mk.l', exp: 'exp.mk',
    expArgs: () => [formatAgorot(MASHKOF_WIDER_A), formatAgorot(BUILD_A.mashkof)] },
];

/**
 * ⚠ THE SUMMARY IS A STEP TOO, and it is the ninth.
 *
 * `PLAN.md` §3.3 asks for "one clean card that survives being screenshotted
 * and forwarded", because a large share of Israeli customers will screenshot
 * rather than tap. Making it the last stop of the flow rather than a permanent
 * column beside it is what gives it a whole screen to be that card in.
 *
 * It is not in `SECTIONS` because it holds no `GROUPS` and asks no question;
 * everything else in this file that walks the list would have to special-case
 * it. The navigator appends it by hand for the same reason.
 */
const SUMMARY = { key: 'sum', title: 'step.sum.t', sub: 'step.sum.s', lede: 'step.sum.l',
                  exp: 'exp.sum' };

const groupsIn = key => GROUPS.filter(g => g.in === key);
const sectionOf = key => (GROUPS.find(g => g.key === key) || {}).in;

/**
 * The STEP that owns a spec row, so a row in the summary can be tapped to go
 * back and change it.
 *
 * ⚠ TWO SPEC KEYS ARE NOT GROUP KEYS and that is not an oversight in either
 * file. `specRows` describes a DOOR, and a door has line work and a count of
 * glazed openings; neither is a control with a `GROUPS` entry. `stripes` is a
 * direction and a number edited by `buildStripes` on the face step, and
 * `glazing` is a derived row that appears only when a door has two lights and
 * is edited by choosing a window. So they are mapped by hand — two entries,
 * written where they can be seen, rather than a `?? 'fit'` fallback that would
 * send a customer to the wrong step in silence when a row is added later.
 * A key with no step is not guessed: the row simply is not a button.
 */
const SPEC_STEP = { stripes: 'face', glazing: 'glass' };
const stepFor = key => sectionOf(key) || SPEC_STEP[key] || null;

// ── language ──────────────────────────────────────────────────────

/**
 * Translate the markup that `index.html` ships with.
 *
 * ⚠ THE HEBREW STAYS IN THE MARKUP AND `PLAN.md` §6 SAID IT SHOULD NOT
 * ("no string is ever written in markup"). That rule exists so no string has
 * only one language, and `data-t` satisfies it — every one of these elements
 * names its key, and `npm test` walks them and fails on a key `UI` does not
 * have. What the rule cannot ask for is an EMPTY page when the bundle does
 * not load, and this page has a tested, shipped no-JS path: the down-strip,
 * `FALLBACK_TEXT`, and a whole degraded stylesheet built for exactly that
 * case. A customer whose JavaScript failed gets a Hebrew page that works
 * rather than a frame of blank spans.
 *
 * So: Hebrew in the markup is the FALLBACK, the key beside it is the truth,
 * and this function reconciles them the moment the bundle runs.
 *
 *   data-t="key"                → the element's text
 *   data-ta="aria-label=key"    → an attribute; comma-separated for several
 */
function translateStatic(root = document) {
  for (const el of root.querySelectorAll('[data-t]')) el.textContent = T(el.dataset.t);
  for (const el of root.querySelectorAll('[data-ta]')) {
    for (const pair of el.dataset.ta.split(',')) {
      const [attr, key] = pair.split('=');
      if (attr && key) el.setAttribute(attr.trim(), T(key.trim()));
    }
  }
  /* `<title data-t>` is handled by the loop above — it is an element with
     text — but the tab only updates from `document.title`, so say it twice on
     purpose. */
  document.title = T('doc.title');

  /* ⚠ AND THE TWO SENTENCES THAT COME FROM `js/share.js`, not from markup.
     They have no `data-t` to be found by the loop above, because they are
     written by script so that the page and the WhatsApp message cannot state
     one promise in two wordings. That made them the last Hebrew left on an
     English page: `init` wrote them once at boot and a language switch never
     came back. Written HERE rather than in `init`, so the one function whose
     job is "make the chrome match the language" does all of it. */
  const caveat = root.querySelector?.('#draw-caveat');
  if (caveat) caveat.textContent = drawingCaveat();
}

/**
 * The three buttons, each naming its language in its own script.
 *
 * ⚠ CHANGING LANGUAGE REBUILDS THE PANEL AND REPAINTS — it does not reload.
 * A reload would work and would be worse: it throws away the door. Every
 * string on this page is produced by a function that reads `T()`/`L()` at
 * call time (that is the whole reason `GROUPS`, `SECTIONS` and `SAID` hold
 * keys rather than sentences), so a rebuild is enough and the customer keeps
 * the door they were halfway through building.
 */
function buildLangs() {
  const host = $('#langs');
  if (!host) return;
  host.replaceChildren(...LANGS.map(l => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang' + (l.id === lang() ? ' is-on' : '');
    b.lang = l.id;
    b.textContent = l.name;
    b.setAttribute('aria-pressed', String(l.id === lang()));
    b.addEventListener('click', () => {
      if (l.id === lang()) return;
      setLang(l.id);
      const live = liveStep;
      translateStatic();
      buildLangs();
      buildPanel();
      goStep(live);
      paint();
    });
    return b;
  }));
}

// ── boot ──────────────────────────────────────────────────────────

function init() {
  /* ⚠ FIRST, BEFORE ANYTHING READS A STRING. `fromQuery` repairs an
     unbuildable link and produces a sentence saying what it did; `buildPanel`
     writes every heading. Both call `T()`. Resolving the language after them
     would show the first customer of every session one Hebrew toast on an
     English page — and it would be intermittent, because it only happens on
     links that need repairing. */
  setLang(pickLang(window.location.search));
  translateStatic();
  buildLangs();

  const { state: parsed, notice, said, carries } = fromQuery(window.location.search);
  state = parsed;

  buildPanel();
  if (PLACEHOLDER) $('#placeholder-note').hidden = false;
  if (notice) showNotice(notice, said);

  $('#copy-btn').addEventListener('click', onCopy);
  $('#undo-btn').addEventListener('click', undo);
  $('#redo-btn').addEventListener('click', redo);
  $('#save-btn').addEventListener('click', saveCurrent);

  /* The price opens its own breakdown. `hidden` and `aria-expanded` move
     together — two statements of one fact, kept in one line so they cannot
     disagree, which is the failure mode every disclosure on this page has. */
  $('#price-toggle').addEventListener('click', () => {
    const box = $('#breakdown'), btn = $('#price-toggle');
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    box.hidden = open;
  });
  $('#works-close').addEventListener('click', closeWorks);
  $('#clash-ok').addEventListener('click', closeClash);

  /* ⚠ THE QUOTE BAR'S WAY ON IS WIRED ONCE, HERE, AND NOT IN `buildPanel`.
     Every other `.sect__next` is built with its step and gets its listener in
     the same breath; this one lives in `index.html`, outside `#choices`, and
     survives the language picker emptying the panel — so a listener attached
     inside `buildPanel` would be added again on every rebuild and the button
     would advance two steps after one language switch, four after two. Once,
     at boot, on an element nothing rebuilds. */
  const barNext = document.querySelector('.quote__next');
  if (barNext) barNext.addEventListener('click', () => stepBy(1));

  /* ── THE PICTURE GOES WITH THE ORDER ──────────────────────────────
     Both send buttons keep their `wa.me` href and keep it correct — that is
     what works with no JavaScript, on a desktop, over `file://`, and in every
     browser without Web Share Level 2. Where a browser CAN carry a file, the
     handler takes over and sends the drawing with the same text.
     ⚠ `href` untouched, deliberately. The label-and-href pact (see
     `.wa__on` in app.css) is that the button never promises more than the
     address behind it delivers; hollowing the href out to make room for a
     handler would break that for every route the handler does not cover. */
  document.querySelectorAll('[data-wa]').forEach(el => {
    /* ⚠ NOT WRAPPED IN `guard`. That helper is a synchronous try/catch, and a
       rejected promise walks straight past one — so an async handler inside it
       LOOKS protected and is not. The whole body is its own try/catch instead,
       and every failure lands on the same line: follow the href, which is a
       complete order and has been since before any of this existed. */
    el.addEventListener('click', async ev => {
      if (!canSharePicture()) return;              // let the link do its job
      /* ⚠ A MODIFIED CLICK IS NOT A TAP. `preventDefault` on every click took
         ctrl/cmd-click, shift-click and middle-click away from both send
         buttons — the three ways a person opens a link in a new tab or window,
         and the only way to keep the design on screen while checking the
         message. `ev.button` is 0 for a left click; `auxclick` carries the
         middle one and never reaches here at all. */
      if (ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      /* ⚠ AND ONE SEND AT A TIME. Rasterising the door takes long enough for a
         second tap to land while the share sheet is opening — and the second
         tap ran the whole handler again, so a customer who double-tapped got
         the sheet, and then had the page navigated to wa.me out from under it.
         The flag is on the element rather than in a closure so both buttons
         and every listener see the same one. */
      if (el.dataset.sending === '1') return;
      el.dataset.sending = '1';
      let how = 'unavailable';
      try { how = await sendDoor(state, engaged); } catch { /* fall through to the link */ }
      finally { el.dataset.sending = '0'; }
      if (how === 'sent' || how === 'dismissed') return;
      /* The share could not happen, so the order still has to. `location`
         rather than `window.open`: the raster took us out of the click's
         transient activation, and a popup opened from outside one is blocked
         — silently, which on this button means the customer taps and nothing
         at all happens. */
      window.location.href = el.href;
    });
  });
  $('#saved-btn').addEventListener('click', () => {
    const box = $('#saved'), btn = $('#saved-btn');
    const show = box.hidden;
    box.hidden = !show;
    btn.setAttribute('aria-expanded', String(show));
  });
  paintSaved();

  /* The crop depends on the stage's shape, so it has to be recomputed
     whenever that changes — a rotated phone, a dragged window, one of the
     notice strips appearing, or a category opening and pushing the stage. */
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(fitStage).observe($('#stage'));
  } else {
    window.addEventListener('resize', fitStage);
  }

  /* ── THE PANEL SAYS WHEN THERE IS MORE OF IT ─────────────────────────
     ⚠ ABOVE 1100 THE PAGE DOES NOT SCROLL AND THE PANEL DOES, and nothing on
     screen said so. `.layout` is `overflow: hidden` up there — one screen,
     two columns, each scrolling inside itself — so the window has no
     scrollbar, and on a platform with overlay scrollbars the column has no
     visible one either. Measured driving the flow forward at 1440x900: the
     lock step hides **599 px** below the fold, the glass step 543, the grip
     step 393. Three of eight steps hide more than half a screen of the thing
     the step is FOR, and the only hint is that the list happens to end in a
     cut-off row.

     The cue is the device this project already chose for exactly this
     question — the 18 px `mask` fade on the navigator, added when the row of
     circles was reported as *"cut at the edge with no sign there is more of
     it"*. Same idiom, one screen down.

     ⚠ AND IT IS CONDITIONAL, WHICH THE RAIL'S IS NOT. The rail overflows at
     every width this app has, so its fade is permanent and honest. A step
     panel does not: `colour` and `mk` fit at 1440 with room to spare, and a
     permanent fade there would promise content that is not below it. So the
     attribute is set from the panel's own numbers.

     ⚠ AND IT IS READ IN A rAF, NOT IN THE SCROLL HANDLER. `scrollHeight` and
     `clientHeight` force layout, and doing that on every scroll event of a
     list of sixty swatches is the shape of jank this project measures with
     `npm run latency`. One frame, coalesced. */
  const panelEl = $('.panel--choose');
  if (panelEl) {
    let queued = false;
    const readMore = () => {
      queued = false;
      const more = panelEl.scrollHeight - panelEl.clientHeight - panelEl.scrollTop;
      /* 8 px of slack: sub-pixel layout leaves a pixel or two of "overflow"
         on a panel that is visibly complete, and a fade under a finished list
         is the same lie as no fade under an unfinished one. */
      if (more > 8) panelEl.setAttribute('data-more', '');
      else panelEl.removeAttribute('data-more');
    };
    markMore = () => {
      if (queued) return;
      queued = true;
      (window.requestAnimationFrame || setTimeout)(readMore);
    };
    panelEl.addEventListener('scroll', markMore, { passive: true });
    window.addEventListener('resize', markMore);
    markMore();
  }

  /* The dock's `IntersectionObserver` was here — it hid a fixed price-and-send
     bar once the real card came into view. Both are gone: the price is on the
     wall and the card is inside the summary step, so there is nothing to
     duplicate and nothing to stand down. */

  paint();

  /* Built once, after the first paint, and only when it is going to be seen.
     The sheet is a document rather than an interface: nothing on it responds
     to anything, so rebuilding it on every change would be work for a page
     nobody is clicking. */
  if (document.documentElement.classList.contains('is-sheet')) {
    /* ⚠ REMOVED, NOT HIDDEN. `.is-sheet .layout { display: none }` already
       makes the configurator invisible and inert on the printed page, but
       `display: none` leaves the element — and everything inside it —
       sitting in the DOM. `.layout` carries the page's OTHER heading,
       `<h1 class="stage__h1" id="stage-h">`, so a shared sheet URL had two
       `<h1>` elements: one hidden, one printed. A document meant to be
       navigated by its headings cannot have a hidden one competing with the
       real one, and `npm run audit` counts `document.querySelectorAll('h1')`
       without asking whether either is visible — rightly, since a hidden
       heading is still there for anything that reads markup rather than
       paint (a screen reader with CSS disabled, a "save as" copy). Nothing
       past this point reads `.layout` in sheet mode: `paint()` above already
       built it once and nothing rebuilds it, since the sheet does not
       respond to clicks.

       ⚠ THAT LAST SENTENCE WAS FALSE AND COST TWO UNCAUGHT ERRORS ON EVERY
       SHEET LOAD. `goStep`, which `init` calls after this, and the
       `ResizeObserver` registered above it both reach `fitStage`, which read
       `$('#stage').querySelector` — and the stage is inside `.layout`.
       `fitStage` returns early on a missing stage now, and the audit's sheet
       route watches for `pageerror`, which is what would have caught it. */
    $('.layout')?.remove();
    buildSheet();
    /* ⚠ AND THE NOTICE FOLLOWS IT ONTO THE PAGE. The sheet hides `.strip`, so
       a link the rules had to repair — a retired colour, an impossible
       combination — printed a door nobody chose with nothing saying so. Read
       off the strip rather than re-derived, so there is one sentence. */
    const strip = $('#notice'), slot = $('#sheet-notice');
    if (slot && strip && !strip.hidden && strip.textContent.trim()) {
      slot.textContent = strip.textContent.trim();
      slot.hidden = false;
    }
  }

  /* A shared link is a door somebody chose deliberately. Open the first
     category it disagrees with the default about — and the section that
     category lives in, or the customer would arrive at a page that has opened
     something they cannot see. */
  /* ⚠ TWO ARRIVALS, because the two devices are answering different
     questions. A desktop has room for all four sections and looks wrong
     without them — measured, 614 px of empty card. A phone has room for one,
     and opening the section a shared link differs in is the useful one to
     pick: somebody following a link is looking at a door somebody else built,
     and the thing they most want to change is the thing that was changed. */
  /* ⚠ A SHARED LINK OPENS AT THE SUMMARY, NOT AT STEP 01. Somebody following a
     link is not designing a door, they are LOOKING at one — Peretz most of
     all. The flow is behind the summary's own "ערכו את הדלת" button.
     A bare load starts at step 01, which is where a customer starts. */
  /* ⚠ AND NOT AT ALL ON THE SHEET, WHICH IS THE ROOT OF THE TWO UNCAUGHT
     ERRORS THAT ROUTE HAS BEEN THROWING. The sheet removed `.layout` a few
     lines above — deliberately, so the printed page has one `<h1>` — and
     `goStep` then walked into a flow that is no longer in the document:
     `fitStage` read `$('#stage').querySelector`, `paint` set
     `$('#stage').innerHTML`.
     The guard belongs HERE rather than as a null check in each of them. A
     sheet is a DOCUMENT: it has no steps, nothing on it responds to anything,
     and "which step is the customer on" is not a question it has. Guarding the
     callers one at a time would answer that question with `null` four times
     over and leave the fifth for whoever adds it. */
  /* ⚠ AND "SHARED" IS A FACT ABOUT THE ADDRESS, NOT ABOUT THE DOOR. This read
     `GROUPS.some(g => state[g.key] !== DEFAULTS[g.key])` — is this door
     different from the one the page opens with — which answers the intended
     question on every door but ONE, and that one is the door Peretz sells
     most. Measured 11.9.2026 on the real page: `?d=DM-N300080000A`, the code
     for the standard ₪3,195 leaf, landed on `fit` with a size picker, while
     the same door with a window on it landed on `sum`. A customer who walks
     all eight steps, keeps the standard door and sends it had Peretz open
     their link on the design flow rather than on the door and the price.
     `fromQuery` answers the honest question now: did this URL carry any of
     the customer's choices at all, as against nothing but our own switches.
     ⚠ It is the SAME SHAPE as the fault fixed on 10.9 one layer up — the send
     label asking `isUntouched` when it meant "has anybody engaged". A proxy
     that is right at arrival and wrong afterwards, and a proxy that is right
     on every door but the default, are the same mistake wearing two hats.
     ⚠ THE MESSAGE'S OPENER IS NOT CHANGED WITH IT, and that is deliberate:
     10.9 decided that a link carrying the default door should still open
     "I had a question", because Peretz opening his own link really is looking
     at the door the site opens with, and the conservative sentence is the one
     that cannot make a false claim about a customer. Where he LANDS and what
     the message CLAIMS are two questions. */
  if (!document.documentElement.classList.contains('is-sheet')) {
    goStep(carries ? SUMMARY.key : SECTIONS[0].key, false);
  }

  /* ⚠ M1: THE DOOR ASSEMBLES, ONCE. `is-arriving` is on `<html>` for one
     animation's length and then removed, so nothing else in the session
     re-triggers it — a door that reassembles itself every time somebody picks
     a colour would be a fault, not a flourish.
     Removed on a timer rather than on `animationend`, because the animation
     does not run at all under `prefers-reduced-motion` or in bare mode, and an
     `animationend` that never fires would leave the class on for ever. */
  document.documentElement.classList.add('is-arriving');
  setTimeout(() => document.documentElement.classList.remove('is-arriving'), 1000);

  /* ⚠ THE ROOM IS ASKED FOR LAST, AND THE PAGE IS ALREADY FINISHED WITHOUT IT.
     Everything above has run: the drawing is up, the price is right, both send
     buttons work. `armRoom` only ever swaps a background in, and only if the
     file arrives — so the slow case and the failed case are the same case, and
     it is the page as it shipped before there was a photograph. */
  armRoom();

  /* ⚠ THE 1100 px CROSSING RESHAPES ONE ELEMENT, AND ONLY SINCE 31.8.
     The old listener existed because the accordion arrived in one shape on a
     phone (all shut) and another on a desktop (all open), and crossing the
     breakpoint left it in the other device's shape — measured in both
     directions, and reachable by dragging a window or turning an iPad. That
     went with the fold: a flow has one shape, one step live at every width.

     What is back is not that. `placeSend` puts the summary's send in the
     sticky foot above 1100 and in the card below it, because the foot is only
     pinned at one of those widths — the whole argument is over that function.
     It moves ONE element and reshapes nothing, and without the listener a
     customer who drags a window across 1100 keeps the other width's placement
     until they change step. Guarded, because `matchMedia` is the same API the
     rest of this file already tests for. */
  if (typeof window.matchMedia === 'function') {
    window.matchMedia('(min-width: 1100px)').addEventListener('change', placeSend);
  }
}

// ── the panel ─────────────────────────────────────────────────────

/* ── THE GALLERY OF DOORS HE ACTUALLY BUILT ───────────────────────────
 *
 * Thirty real installations from `js/works.js`, each drawn by the same
 * `render(state)` the stage uses, so tapping one is continuous with the page
 * it drops you into rather than a jump from a picture to a diagram.
 *
 * ⚠ THE DOORS ARE DRAWN AS THEY SCROLL INTO VIEW AND UNDRAWN AS THEY LEAVE.
 * This is the whole engineering content of the feature. One door is 379
 * elements on the default and 860 on a sidelight; thirty at once is upwards of
 * 10,113 elements built inside a click handler, on a phone — the same
 * cost the outside review measured as 315 ms for ONE door at 6x CPU throttle.
 * An `IntersectionObserver` with a screen of margin keeps six to ten alive at
 * a time, and the count stops depending on how many doors Peretz has built.
 *
 * Clearing on exit matters as much as drawing on entry: without it the grid
 * accumulates every door the customer has scrolled past, which is the same
 * fault arriving a few seconds later.
 *
 * Guarded: with no `IntersectionObserver` every tile is drawn once, up front —
 * slow on an old browser, still correct. Same shape as the dock's guard.
 */
/* Re-read whether the choices panel has more below the fold. Assigned in
   `init` once the panel exists; a no-op before that and in `?bare=1`, where
   there is no panel at all. Called from `goStep` too, because a step change
   replaces the whole contents and the old answer is about the old step. */
let markMore = () => {};

let worksObserver = null;

function buildWorks() {
  const grid = $('#works-grid');
  if (!grid || grid.childElementCount) return;

  const draw = tile => {
    if (tile.dataset.drawn === '1') return;
    const i = Number(tile.dataset.i);
    /* ⚠ `copyOf`, NOT `render` STRAIGHT IN. Every door `render()` emits carries
       the same fifty-eight ids, and an SVG `url(#leafFill)` resolves to the
       FIRST element with that id IN THE DOCUMENT — so a grid of doors paints
       every tile with the FIRST tile's gradients: thirty colours, one colour
       on screen. Shipped that way and found by review. See `copyOf` in
       js/renderer.js. */
    tile.querySelector('.work__art').innerHTML =
      copyOf(render({ ...DEFAULTS, ...WORKS[i].state }), `w${i}`);
    tile.dataset.drawn = '1';
  };
  const undraw = tile => {
    if (tile.dataset.drawn !== '1') return;
    tile.querySelector('.work__art').replaceChildren();
    tile.dataset.drawn = '0';
  };

  for (const [i, w] of WORKS.entries()) {
    const st = { ...DEFAULTS, ...w.state };
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'work';
    b.dataset.i = String(i);
    /* The NAME is what the door IS, not what we filed it under. `d003` is an
       index into a research folder and means nothing to a customer; the
       drawing's own description is the sentence this page already trusts to
       say what a door is to somebody who cannot see it. */
    b.setAttribute('aria-label', describe(st));
    b.innerHTML = '<span class="work__art" aria-hidden="true"></span>'
      + '<span class="work__meta">'
      + `<span class="work__name">${L(byId(COLOURS, st.colour))}</span>`
      + `<span class="work__price">${formatAgorot(priceAgorot(st))}</span>`
      + '</span>';
    /* ⚠ THE PRICE IS COMPUTED, NOT CARRIED. `js/works.js` deliberately holds no
       money: the page has exactly one statement of what a door costs and it is
       `priceAgorot` on the state being shown. A figure stored beside each door
       would be a second one, and it would be quoting a past job at a new
       customer besides. */
    b.addEventListener('click', () => {
      /* Through `set`, like every other choice on the page, so the URL, the
         price, the code, the order and the announcement all follow.
         ⚠ This carried `grip: null` until 18.9.2026, to stop a previous door's
         dragged position riding onto one of Peretz's. There is no position to
         inherit now — `gripAt` computes it from the state — so the clause went
         with the field rather than being left as a no-op somebody would later
         wonder about. */
      set({ ...DEFAULTS, ...w.state });
      closeWorks();
      toast(T('saved.loaded'));
    });
    grid.appendChild(b);
  }

  if (typeof IntersectionObserver === 'function') {
    worksObserver = new IntersectionObserver(entries => {
      for (const e of entries) (e.isIntersecting ? draw : undraw)(e.target);
      /* ⚠ THE SCROLLER, NOT THE DIALOG. `root` was `#works`, and `#works` does
         not scroll — `.works__grid` inside it carries the `max-block-size` and
         the `overflow-y: auto`. An observer whose root is not the element that
         actually scrolls measures against a box that never moves, so the
         400 px of pre-draw margin bought nothing: tiles arrived undrawn and
         were filled in only once they were already on screen, which is the
         one moment the work is visible as a stutter. */
    }, { root: $('#works-grid'), rootMargin: '400px 0px' });
    grid.querySelectorAll('.work').forEach(t => worksObserver.observe(t));
  } else {
    grid.querySelectorAll('.work').forEach(draw);
  }
}

function openWorks() {
  buildWorks();
  const d = $('#works');
  /* `showModal` rather than `show`: it traps focus, closes on Escape and makes
     the rest of the page inert, none of which is worth hand-writing. Guarded
     because `<dialog>` is the one element here an old browser might not have,
     and a gallery that will not open must not take the configurator with it —
     `init()` is wrapped, but a throw inside a click handler is not. */
  if (typeof d.showModal === 'function') d.showModal();
  else d.setAttribute('open', '');
}

function closeWorks() {
  const d = $('#works');
  if (typeof d.close === 'function') d.close();
  else d.removeAttribute('open');
}

/* The lever-against-bar dialog — `choose` above. Same `showModal` guard as
   the gallery's, for the same reason: it traps focus, closes on Escape and
   makes the page inert, and an old browser without it must not take the
   configurator down inside a click handler. Nothing here touches `state`:
   the door a customer sees behind the backdrop is the door they keep. */
function openClash() {
  const d = $('#clash');
  if (!d) return;
  if (typeof d.showModal === 'function') d.showModal();
  else d.setAttribute('open', '');
}

function closeClash() {
  const d = $('#clash');
  if (!d) return;
  if (typeof d.close === 'function') d.close();
  else d.removeAttribute('open');
}

/* ── THE ORDER AS A DOCUMENT ──────────────────────────────────────────
 *
 * `?sheet=1` renders the same state as an A4 order sheet. Everything on it
 * comes from a function that already existed and is already the single
 * statement of its fact: `render` for the drawing, `specRows` for the options,
 * `priceAgorot` for the money, `encodeCode` for the code. Nothing here knows
 * anything about a door that the configurator does not.
 *
 * ⚠ THE HANDING IS SPELLED OUT, and that row is the reason this page is worth
 * printing at all. `ASK-PERETZ.md` §1 was open for months because ימין means
 * two different things depending on which side of the door you are standing
 * on, and until 23.8.2026 this site had the convention BACKWARDS — every order
 * it produced named the mirror of the door on the customer's screen. A sheet
 * that says only `שמאל, פנימה` reproduces exactly that ambiguity in print. So
 * it says which side the hinge is on, which side the cylinder is on, and that
 * both are read from OUTSIDE — the three facts that together cannot be
 * misread. Derived from `HANDINGS[].hinge`, so it cannot disagree with the
 * drawing beside it.
 */
function buildSheet() {
  const host = $('#sheet');
  if (!host) return;

  const sz = SIZES[state.size] || SIZES.standard;

  /* ⚠ THE SHEET IS THE ONE DOCUMENT WITH TWO READERS, AND IT CARRIES BOTH
     LANGUAGES. Everything else on this page follows the customer and the
     WhatsApp message is always Hebrew (see `specLines`), because each has one
     audience. This has two, and the arguments pull opposite ways:

       — the CUSTOMER proof-reads it. `css/app.css` says so where it caps the
         drawing on a phone: "a sheet that cannot be proof-read on the device
         it was sent to is a sheet nobody checks before ordering from it".
       — PERETZ ORDERS FROM IT. `PLAN.md` §0: without a clarifying question.
         A sheet reading "Кованая решётка · Полуторная" is a phone call.

     Picking one reader loses the other, so it prints the customer's language
     and, under each value, the Hebrew. Two calls of one pure function rather
     than a second row-builder — `specRows` is the only statement of what is
     in a door and it stays that way. Skipped entirely when the customer is
     already reading Hebrew, so the ordinary sheet is unchanged. */
  const he = lang() === 'he' ? null : withLang('he', () => specRows(state));
  const rows = specRows(state).map((r, i) =>
    `<div class="sheet__row"><span class="sheet__k">${r.label}</span>`
    + `<span class="sheet__v">${r.value}`
    + (he ? `<small class="sheet__he" dir="rtl">${he[i].label}: ${he[i].value}</small>` : '')
    + '</span>'
    + (r.hex ? `<span class="sheet__chip" style="--chip:${r.hex}"></span>` : '')
    + '</div>').join('');

  /* ⚠ THE GRIP NOTE, which this sheet shipped without. `gripAddendum` is what
     tells Peretz that a pull bar has to be drilled ACROSS the leaf rather than
     upright. It reached him in the WhatsApp and was not on the sheet he would
     take to the workshop — the same door, two readers, disagreeing. Same
     function, so they cannot drift.
     ⚠ It was TWO notes until 18.9.2026; the second said the customer had moved
     the handle on purpose, and there is no longer a way for them to. The
     function still returns a list, so this loop is unchanged and a second note
     can come back without touching the sheet. */
  const grip = gripAddendum(state);

  host.innerHTML = `
    <header class="sheet__top">
      <div>
        ${/* ⚠ THE SHEET NEEDS ITS OWN HEADING. `.is-sheet` hides `.layout`,
              which is where the page's only <h1> lives, so the printed
              document had no heading at all — and a screen reader opening a
              shared sheet URL got a page with nothing to navigate by. */''}
        <h1 class="sheet__brand">${T('brand.name')}</h1>
        <div class="sheet__sub">${T('brand.city')} · ${PHONE_DISPLAY}</div>
      </div>
      ${/* ⚠ `direction: ltr` BELONGS ON THE CODE, NOT ON THE ROW. It was on
            the whole element, so the Hebrew label came out after the digits:
            the sheet printed `DM-P4040481 :קוד`. The code itself is Latin and
            must stay LTR; the label around it is Hebrew and must not. */''}
      <div class="sheet__code">${T('send.code')} <b dir="ltr">${encodeCode(state)}</b></div>
    </header>

    <div class="sheet__body">
      <figure class="sheet__art">
        ${/* Namespaced: the hidden stage still holds a door whose ids are
              first in the document. See `copyOf` in js/renderer.js. */''}
        ${copyOf(render(state), 'sheet')}
        <figcaption class="sheet__dims">
          ${/* ⚠ NO DERIVED TOTAL. This printed `sz.w + sz.side` as "the
                ordered width" — a second width arithmetic, and one that
                disagrees with the drawing beside it: the renderer lays a
                sidelight out as ONE opening holding two leaves separated by a
                22 mm mullion and rebated 50 each side, which comes to 1,322,
                not the 1,350 this line printed. Nobody has confirmed which
                number Peretz orders by, so the sheet stops inventing one and
                prints what the catalogue actually holds. ASK-PERETZ.md §12. */''}
          ${sz.w} × ${sz.h} ${T('unit.mm')} · ${L(sz)}${sz.side ? ` · ${T('sheet.sidelight', sz.side)}` : ''}
          <small>${T('sheet.dims')}</small>
        </figcaption>
      </figure>

      <div class="sheet__spec">
        ${rows}
        <div class="sheet__row sheet__row--wide">
          <span class="sheet__k">${T('sheet.handing')}</span>
          <span class="sheet__v">${handingWords(state)}${he
            ? `<small class="sheet__he" dir="rtl">${withLang('he', () => handingWords(state))}</small>`
            : ''}</span>
        </div>
        ${/* The grip notes are Peretz's instructions — drill across the leaf,
              the customer moved it on purpose — so the Hebrew is the one that
              matters and the customer's language is the gloss. Same shape as
              the rows above, computed the same way. */''}
        ${(() => {
          const gripHe = he ? withLang('he', () => gripAddendum(state)) : null;
          return grip.map((g, i) => '<div class="sheet__row sheet__row--wide">'
            + `<span class="sheet__k">${T('sheet.grip')}</span>`
            + `<span class="sheet__v">${g}`
            + (gripHe ? `<small class="sheet__he" dir="rtl">${gripHe[i]}</small>` : '')
            + '</span></div>').join('');
        })()}
        <div class="sheet__row sheet__row--wide">
          <span class="sheet__k">${T('price.est')}</span>
          <span class="sheet__v"><b>${formatAgorot(priceAgorot(state))}</b>
            <small>${priceIncludes()}</small>${he
              ? `<small class="sheet__he" dir="rtl">${withLang('he', priceIncludes)}</small>` : ''}</span>
        </div>
      </div>
    </div>

    <footer class="sheet__foot">
      ${priceCaveat()}${he ? `<span class="sheet__he" dir="rtl">${withLang('he', priceCaveat)}</span>` : ''}
      ${/* ⚠ THE SHEET HID THE TWO STRIPS THAT SAY THE PRICE IS INVENTED AND
            THE DOOR WAS SUBSTITUTED. `.is-sheet` hides `.strip`, so a sheet
            built from a placeholder catalogue printed a confident number with
            no warning, and a link the rules had to repair printed a door
            nobody chose with no notice. Both belong on a document somebody
            orders from more than they belong on the screen. */''}
      ${PLACEHOLDER ? `<b class="sheet__warn">${T('sheet.dev')}</b>` : ''}
      <span class="sheet__note" id="sheet-notice" hidden></span>
    </footer>`;
}

function buildPanel() {
  const wrap = $('#choices');

  /* ⚠ EMPTY IT FIRST. This function APPENDED, which was harmless for as long
     as it ran exactly once — and then the language picker started calling it
     again. Reported from outside as two separate faults that are one bug:
     *"when i change the language it doesnt change the language on all the
     text"* and *"at the bottom of the screen the categories get repeated, and
     the 30 doors button too."*

     A second, correctly-translated panel was being built UNDERNEATH the first.
     Everything the customer could see was the stale copy — so the tile names
     stayed Hebrew while their prices turned English, because `repriceOptions`
     rewrites `.tile__meta` on the live DOM and the names were never rebuilt.
     Two symptoms, one missing line.

     ⚠ AND THE SEND CARD IS RESCUED BEFORE THE CLEAR. `goStep` MOVES
     `.panel--send` into the summary step, which is a child of this element —
     so emptying the panel would delete markup that `index.html` owns and
     nothing rebuilds. It goes back to the layout and `goStep` re-adopts it on
     the next call. */
  const send = document.querySelector('.panel--send');
  /* ⚠ AND THE SEND BUTTON BEFORE THE CARD, BECAUSE IT IS NO LONGER IN IT.
     `goStep` moves `#wa-btn` out of the card and into the summary's
     `.sect__foot` — a child of THIS element — so rescuing only the card would
     leave the button behind to be deleted, and `index.html` owns it. Order
     matters: the button goes home to the card, then the card goes home to the
     layout. Falsified by dropping this line: switch language on the summary
     and the green send never comes back. */
  const wa = document.getElementById('wa-btn');
  if (send && wa && wa.parentElement !== send.querySelector('.send')) {
    send.querySelector('.send__alt')?.before(wa);
  }
  if (send && wrap.contains(send)) $('.layout').appendChild(send);
  wrap.replaceChildren();

  /* The first offer the panel makes, above the navigator: somewhere to start
     that is not a list of sixty options. */
  const opener = document.createElement('button');
  opener.type = 'button';
  opener.className = 'works-open';
  opener.id = 'works-btn';
  opener.innerHTML = `<span class="works-open__t">${T('works.open')}</span>`
    + `<span class="works-open__n">${T('works.count', WORKS.length)}</span>`;
  opener.addEventListener('click', openWorks);
  wrap.appendChild(opener);

  /* ── THE NAVIGATOR ───────────────────────────────────────────────
     The mockup draws a four-step progress indicator, and this is not one,
     deliberately.
     ⚠ A PROGRESS BAR HERE WOULD BE A LIE, and the lie is structural rather
     than a matter of wording: `nowLabel` falls back to `list[0]`, so every
     category always has a value and `sectionLabel` can never return empty.
     Measured on first paint, before the customer has touched anything, all
     four sections already read complete — `אפור אנתרציט · חלק`,
     `חלון מלבני · ללא סורג`, `עידן · צילינדר בלבד`, `סטנדרטית · ימין, פנימה`.
     That fallback is deliberate and right: "no pull handle" is a decision the
     door carries, not a blank. So any indicator derived from `state` reads 4/4
     on arrival, which is worse than no indicator.
     What it IS: a table of contents. It names the four sections, marks the
     ones that are open, and jumps. On a phone, where one section is open at a
     time, that is real navigation; on a desktop it is a map of a card too tall
     to take in at once. It carries NO VALUES — those are in the spec table
     beside the price, and a second copy of them here is the duplication this
     codebase keeps paying for. */
  /* ── THE NAVIGATOR ─────────────────────────────────────────────────
     ⚠ STILL A TABLE OF CONTENTS AND NOT A PROGRESS BAR, and the reason is
     unchanged by the flow: `nowLabel` falls back to `list[0]`, so every step
     carries a value on first paint and anything derived from `state` reads
     "complete" before the customer has touched anything. What is new is that
     it also marks WHERE YOU ARE, which is a fact about the page rather than
     about the door and is therefore safe to show. Nine circles, the ninth
     being the summary; tap any of them at any time. */
  const nav = document.createElement('nav');
  nav.className = 'steps';
  nav.setAttribute('aria-label', T('nav.steps'));
  for (const sec of [...SECTIONS, SUMMARY]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'steps__step';
    b.dataset.step = sec.key;
    /* ⚠ THE CIRCLE IS THE WHOLE BUTTON NOW — no number under it, no title
       beside it. Both were measured out rather than dropped for tidiness:

       · The NUMBER was `.steps__n::before`, a CSS counter, and it is the same
         fact as the `NN ⁄ 08` the live step already prints above its own
         heading. Two statements of where you are, and the one under the
         circles cost 24 px of a 390 px phone's most expensive strip.
       · The TITLE only ever showed above 1100 px, where nine of them do not
         fit a 310 px column: measured `scrollWidth` 429 against a 310 px box,
         so what a desktop customer actually saw was nine truncated words. The
         name is on the button and the live step's `<h2>` says it in full.

       What is left is nine 44 px icon circles that mean "which question", and
       the row is legible at every width for the first time. */
    b.innerHTML = `<span class="steps__c" aria-hidden="true">${sectionIcon(sec.key)}</span>`;
    /* ⚠ THE NAME, EXPLICITLY, AND NOW IT IS THE ONLY ONE. There is no text
       inside this button at all, so without this line it measures
       `{role: "button", name: ""}` at every width rather than only below
       1100 px. */
    b.setAttribute('aria-label', T(sec.title));
    /* ⚠ AND THE SAME NAME AGAIN AS A `title`, WHICH IS THE ONLY LABEL THIS
       ROW CAN AFFORD. `UX-FINDINGS.md` §3 measured the asymmetry and stated
       it better than a comment can: every circle carries a correct
       `aria-label`, so **a screen reader is better informed about this page
       than a sighted customer**. Its one untried remedy was to wrap the rail
       to two labelled rows, and that was built as a spike on 5.9 and
       measured out — the numbers are in CLAUDE.md §0b, and the short version
       is that it costs 82 px at every viewport in the one axis the panel is
       already short of, on top of §4's own finding.
       `title` is what is left: the name on hover, no layout at all. It is
       half an answer — there is no hover on a phone — and the half it
       answers is the desktop, which is where the review found the fault and
       where the rail's nine names have never been readable.
       ⚠ It does NOT double up in the accessibility tree: `aria-label` wins
       the accessible-name computation outright, so `title` is only ever the
       tooltip. The two are set from the same `T(sec.title)` on purpose, and
       `npm test` asserts they are equal so a future rename cannot leave a
       tooltip saying one thing and a screen reader another. */
    b.title = T(sec.title);
    b.addEventListener('click', () => { noteEngaged(); goStep(sec.key); });
    nav.appendChild(b);
  }
  wrap.appendChild(nav);

  /* ── THE STEPS ─────────────────────────────────────────────────────
     Every step is built once and hidden; `goStep` shows one. Building them all
     up front rather than on demand keeps `buildOptions`, the keyboard grid and
     `repriceOptions` working exactly as they did — they walk the DOM for
     `.field[data-group=...]`, and a field that does not exist yet is a field
     they silently skip. That was the whole risk of this change and it is
     bought off for the cost of some hidden markup.

     ⚠ AND THE GROUPS INSIDE A STEP DO NOT FOLD. They used to: the cabinet was
     sections opening onto categories opening onto options, because eleven
     headings on one screen read as a parts catalogue. A step holds one or two
     groups and nothing else, so a fold there is a click that reveals a click —
     which `js/app.js` already called "worse than the list it replaced" when it
     decided four sections was the floor. */
  for (const sec of SECTIONS) {
    const box = document.createElement('section');
    box.className = 'sect';
    box.dataset.section = sec.key;
    box.hidden = true;
    box.innerHTML = `
      <p class="sect__where"><span data-step-n></span></p>
      <h2 class="sect__title" id="sect-head-${sec.key}" tabindex="-1">${T(sec.title)}</h2>
      ${sec.lede ? `<p class="sect__lede">${T(sec.lede)}</p>` : ''}
      <div class="sect__body" id="sect-body-${sec.key}"></div>`;
    wrap.appendChild(box);

    const body = box.querySelector('.sect__body');
    for (const g of groupsIn(sec.key)) {
      const field = document.createElement('div');
      field.className = 'field';
      field.dataset.group = g.key;
      /* ⚠ NO `field__head` BUTTON ANY MORE. The title is a heading, because
         nothing folds — and a `<button>` that toggles nothing is a control
         that lies to a screen reader about being interactive. */
      /* ⚠ AND IT IS DROPPED WHERE IT REPEATS THE STEP'S OWN QUESTION, which
         in Hebrew is six steps of eight. This heading is a survivor of the
         CABINET: four sections each held several groups, so the group's name
         was the only name a group had. In a FLOW the step IS the question —
         `סיכום`/`פרזול`/`משקוף` are the `<h2>` — and the same word then
         appeared again 18 px below it in tracked small caps, saying nothing
         the line above had not. Measured: he and ru drop it on colour, grip,
         pz, face, glass and mk; EN drops three, because its step titles carry
         an article ("The frame" over a group called "Frame") — so the rule
         must be per-language and DERIVED, never a list of six keys that a
         copy edit would silently rot.
         The comparison is between the two strings a customer actually reads.
         `buildPanel` runs again on every language switch, so a step that
         stops repeating itself in English keeps its heading and one that
         starts repeating itself loses it, with nobody coming back here.
         ⚠ The GROUP IS STILL NAMED: `buildOptions` puts `T(g.title)` on the
         radiogroup's `aria-label`, so a screen reader still hears which
         question it has entered — it simply hears it once instead of three
         times (h2, h3, radiogroup). And the convention this follows is the
         one `buildOptions` already uses a level down, in its own words:
         *"options with no `sub` come first and carry no heading."* A step's
         first group belongs to the step; the ones after it are the ones that
         need naming, which is why `פעמון` and `עינית` keep theirs. */
      const named = T(g.title) !== T(sec.title);
      field.innerHTML = `
        ${named ? `<h3 class="field__title" id="head-${g.key}">${T(g.title)}</h3>` : ''}
        <div class="field__body" id="body-${g.key}">
          <div class="field__opts"></div>
          ${g.hint ? `<p class="field__hint">${T(g.hint, ...(g.hintArgs ? g.hintArgs() : []))}</p>` : ''}
          <p class="field__note" data-note hidden></p>
        </div>`;
      body.appendChild(field);
      buildOptions(g, field.querySelector('.field__opts'));
    }

    /* ⚠ THE DISCLOSURE — §10.4's sixth part, and the one the flow is FOR.
       A fold heading in the old cabinet had room for a name and nothing else,
       so this app never explained anything to anybody. A step has a whole
       screen and can afford a paragraph — closed, so it costs a customer who
       knows what a משקוף is exactly nothing, and open, so it rescues one who
       does not.

       ⚠ NOT ONE NEW CLAIM ON PERETZ'S BEHALF. Every sentence in `exp.*.a`
       restates a figure he gave, a rule in `js/rules.js` or a dimension in
       `js/catalog.js` — see the note over those keys in `js/copy.js`. This is
       the friendliest surface on the site and therefore the easiest place to
       promise something nobody has agreed to.

       A real `<details>`, not a scripted div: it opens with no JavaScript, it
       is in the accessibility tree as a disclosure, and browser find-in-page
       reaches inside a closed one. */
    if (sec.exp) {
      const d = document.createElement('details');
      d.className = 'sect__exp';
      d.innerHTML = `<summary class="sect__q">${T(sec.exp + '.q')}</summary>`
                  + `<p class="sect__a">${T(sec.exp + '.a', ...(sec.expArgs ? sec.expArgs() : []))}</p>`;
      body.appendChild(d);
    }

    /* The foot: where you are in the money, and the way on.
       ⚠ AND A WAY STRAIGHT TO THE END, 14.9.2026. Asked for from outside: a
       customer who is happy with the door as it stands should not have to
       press הבא through the questions they do not care about.
       ⚠ IT IS NOT IN THE QUOTE BAR, AND THAT WAS MEASURED BEFORE IT WAS
       DECIDED. The bar carries the price, the send and the way on, and at
       320 px in RUSSIAN its content box is 300 px and those three use exactly
       300 — no spare at all, with the send button already flexing from 114 px
       down to 72 as the price grows. A fourth control there comes out of the
       primary action. So the skip lives here, where there is room, and the
       stylesheet hides it below 1100.
       ⚠ THE PHONE ALREADY HAS ONE. The navigator's ninth circle IS the
       summary — measured 44 x 44 at y=8 on a 320 px screen, fixed at the top
       of every screen a customer ever sees. Adding a second way to the same
       place, on the one layout with no room for it, is not a feature.
       `markSteps` hides it on the last two steps: on the summary there is
       nothing to skip to, and on the step before it `.sect__next` already
       reads לסיכום, so the two buttons would sit side by side saying the same
       thing. */
    const foot = document.createElement('div');
    foot.className = 'sect__foot';
    foot.innerHTML = `
      <button type="button" class="btn btn--ghost sect__back">${T('nav.back')}</button>
      <button type="button" class="btn btn--ghost sect__skip">${T('nav.skip')}</button>
      <button type="button" class="btn sect__next">${T('nav.next')}</button>`;
    foot.querySelector('.sect__back').addEventListener('click', () => stepBy(-1));
    foot.querySelector('.sect__skip').addEventListener('click', () => goStep(SUMMARY.key));
    foot.querySelector('.sect__next').addEventListener('click', () => stepBy(1));
    box.appendChild(foot);
  }

  /* ── THE QUOTE PAGE ────────────────────────────────────────────────
     ⚠ EVERYTHING ON IT ALREADY EXISTS. The spec table, the price, the caveat,
     the WhatsApp button, the code, the copy and save buttons and the works
     link are all in `.panel--send`, which is still in `index.html` and still
     the thing that gets filled. This step MOVES that card to the end of a road
     rather than rebuilding it — the alternative would be a second statement of
     what a door costs and what it is, in the one place that must never have
     two. */
  const sum = document.createElement('section');
  sum.className = 'sect sect--sum';
  sum.dataset.section = SUMMARY.key;
  sum.hidden = true;
  sum.innerHTML = `
    <p class="sect__where"><span data-step-n></span></p>
    <h2 class="sect__title" id="sect-head-sum" tabindex="-1">${T(SUMMARY.title)}</h2>
    <p class="sect__lede">${T(SUMMARY.lede)}</p>
    <div class="sect__body" id="sum-slot"></div>
    ${/* ⚠ THE NINTH EXPLAINER, AND THE ONE THAT EARNS ITS PLACE MOST. This
          step is where a customer stops and wonders what they are about to
          set off — and the honest answer is nothing irreversible: the message
          opens in THEIR WhatsApp, the measure is free and already in the
          price, and the figure can still move ~5% after it. Every one of
          those is already stated somewhere in this repository (PRICE_CAVEAT,
          `js/prices.js`'s `measure`, `js/share.js`'s message); none of them
          was ever said to the customer at the moment they matter.
          It sits INSIDE the body, above the foot, so the send buttons stay
          the last thing on the card. */''}
    <div class="sect__foot">
      <button type="button" class="btn btn--ghost sect__back">${T('nav.back')}</button>
    </div>`;
  /* ── THE HANDING CONFIRMATION IS GONE, 25.9.2026, AND WHAT IT PROTECTED IS
     ────────────────────────────────────────────────────────────────────
     The owner's son: *"in the final section, remove the thing that asks you if
     you are sure that the side of the door is right, it just takes up space."*
     It was a `.sum-hand` card at the TOP of the summary's body — a question, the
     `handingWords()` sentence, and a flip button — 122 px of the one screen
     `PLAN.md` §3.3 asks to be "one clean card that survives being screenshotted
     and forwarded", and it was measured as the block standing between the
     summary's heading and its spec table in §9's *"the summary cannot show its
     whole spec at 1280x720"*.

     ⚠ THE ARGUMENT FOR IT WAS SOUND AND IS NOT THROWN AWAY, BECAUSE THE PAGE
     ANSWERS IT ANOTHER WAY NOW. `handing` really is the only default in this
     product that costs money to get wrong — the ימין/שמאל convention was
     backwards for weeks — and `js/url-state.js` must give it a value because
     the drawing has to draw something. What has changed since `UX-FINDINGS` §2
     put this card here is that **every spec row is a button back to the
     question that asked it** (14.9.2026): the summary's table carries a פתיחה
     row, in `handingWords`'s own vocabulary through `row.handing`, and tapping
     it goes to step 01 with the two pills under the customer's thumb. So the
     fact is still stated on the screen the customer is told to proof-read, in
     the order's own words, one tap from being changed — which is what the card
     did, without a card.
     And the SENTENCE itself is untouched where it matters: `handingWords()`
     still writes the WhatsApp order (`js/share.js`) and the A4 sheet, which are
     the two artefacts Peretz reads. The one thing that is gone is the second
     copy of it on the page, and `[data-handing-words]` has no reader left —
     `paint` no longer writes it, because a loop over an attribute nothing
     carries is the dead branch a later reader wires back up.

     ⚠ AND THE AUDIT'S THREE ASSERTIONS WENT WITH IT rather than being softened:
     the row exists, its control is whole on screen, and its sentence equals
     `handingWords()` to the character. The third is the one worth naming, and
     the check that replaces it is stronger in the one way that matters — the
     spec table's own handing row must still SAY what the order says, which is
     asserted for every row at once by `#spec` being built from `specRows`. */

  if (SUMMARY.exp) {
    const d = document.createElement('details');
    d.className = 'sect__exp';
    d.innerHTML = `<summary class="sect__q">${T(SUMMARY.exp + '.q')}</summary>`
                + `<p class="sect__a">${T(SUMMARY.exp + '.a')}</p>`;
    sum.querySelector('.sect__body').appendChild(d);
  }
  sum.querySelector('.sect__back').addEventListener('click', () => stepBy(-1));
  wrap.appendChild(sum);
}

/**
 * WHAT THIS OPTION COSTS, in agorot. Not what tapping it would do to the total.
 *
 * ⚠ THIS USED TO BE `tileSurcharge`, and it printed a DELTA:
 * `priceAgorot(after) - priceAgorot(state)`, the jump. Reported from outside:
 * *"the price of the thing needs to be written on the thing not the jump in
 * the price if i choose this option."*
 *
 * Three things were wrong with the jump, and only the third is obvious:
 *  - On the option you already have it printed "כלול". A ₪620 wrought-iron
 *    grille announced itself as included, on the very door you had bought it
 *    for.
 *  - It changed under you. Tap the sidelight and every grille tile silently
 *    doubled, because ironwork is sold per panel — correct arithmetic, and
 *    unreadable as a price list.
 *  - It is not a property of the option at all, so two customers looking at
 *    the same tile saw different numbers and neither was the price.
 *
 * The cost comes from `priceParts`, which is the same arithmetic `priceAgorot`
 * sums — see the note there for why it is not `o.delta`.
 *
 * Still asked through `repair`, and that still matters: a grille's cost
 * depends on how many panes the door ends up with, so the honest figure is the
 * one for the door you would actually get. The chosen key is forced back
 * afterwards, because a repair may bounce a blocked option straight back to
 * where it was and the tile would then quote the price of the option the
 * customer already has instead of the one under their finger.
 */
function tilePrice(g, o, state) {
  const after = { ...repair({ ...state, [g.key]: o.id }).state, [g.key]: o.id };
  /* ⚠ `tileAgorot`, not `priceParts(after)[g.key]`, and the difference is the
     size. A size no longer has a price of its own — it multiplies the door and
     the mashkof — so `priceParts` has no `size` key to read and this line
     would have printed `undefined` on all six size tiles. The translation from
     "which group is this" to "what number does it print" lives in `price.js`
     beside the arithmetic, because that is the file that owns money. */
  return tileAgorot(g.key, after);
}

/**
 * WHAT EACH LINE OF THE BREAKDOWN IS CALLED.
 *
 * Keyed by `breakdownRows`' key, which is the FIELD — six components plus the
 * priced groups plus the rounding, EIGHTEEN of them, not sixty-odd options.
 * That distinction is the same one `SPEC_ICONS` had to be corrected on: a
 * table keyed by the option would need an entry per product and would silently
 * draw nothing the day a new one arrived.
 *
 * ⚠ AND THE COUNT ABOVE SAID THIRTEEN UNTIL 10.9.2026, WHICH IS THE WHOLE
 * DEFECT IN ONE NUMBER. The פעמון and the עינית became priced fields on 30.8;
 * `priceParts` emits them, this table was not extended, and the renderer below
 * falls through to printing `r.key` — so a customer who bought the ₪300 ring
 * opened the column under the price and read a row called **`bell`**, in
 * Hebrew, English and Russian alike. §5's own family: a hand-kept map beside a
 * DERIVED list, and a fallback quiet enough that only a customer could find it.
 *
 * ⚠ THE FALLBACK STAYS AND IS NOT THE GUARD. A row with money and no name is
 * worse than a row with a programmer's name on it, and throwing here would
 * blank the page — §5.20's lesson about `?sheet=1` is exactly that. The guard
 * is in `npm test`, which sweeps every buildable door for every key
 * `breakdownRows` can emit and requires a label here AND a string in all three
 * languages, so this can never again be discovered by somebody spending ₪300.
 *
 * ⚠ `lock` AND `lockset` ARE DIFFERENT THINGS AND MUST NOT READ ALIKE. `lock`
 * is the multi-point mechanism inside every door Peretz sells, ₪200, part of
 * the standard build. `lockset` is the lever and escutcheon the customer picks.
 * Calling both of them "מנעול" in one column would make the breakdown look
 * like it charges twice for the same thing.
 */
const BREAKDOWN_KEY = {
  door: 'bd.door', cylinder: 'bd.cylinder', lock: 'bd.lock', mashkof: 'bd.mashkof',
  install: 'bd.install', measure: 'bd.measure', colour: 'bd.colour',
  detail: 'bd.detail', window: 'bd.window', grille: 'bd.grille',
  handle: 'bd.handle', lockset: 'bd.lockset', speciallock: 'bd.speciallock',
  pirzul: 'bd.pirzul', stripes: 'bd.stripes', round: 'bd.round',
  bell: 'bd.bell', peephole: 'bd.peephole',
};

/**
 * The breakdown, rendered. One row per entry of `breakdownRows`, and the total
 * repeated at the foot so the column can be checked without scrolling back up.
 *
 * ⚠ NO ARITHMETIC HERE. Every figure comes from `js/price.js`, including the
 * rounding row. The one thing this function is allowed to do with a number is
 * format it.
 */
function renderBreakdown(state) {
  const body = $('#breakdown-body');
  if (!body) return;
  const rows = breakdownRows(state);
  body.innerHTML = rows.map(r =>
      `<tr><th scope="row">${BREAKDOWN_KEY[r.key] ? T(BREAKDOWN_KEY[r.key]) : r.key}</th>`
    + `<td>${formatAgorot(r.agorot)}</td></tr>`).join('')
    + `<tr class="bd__total"><th scope="row">${T('price.total')}</th>`
    + `<td>${formatAgorot(priceAgorot(state))}</td></tr>`;
}

/** Repaint every option's price label against the door as it stands. */
function repriceOptions(state) {
  for (const g of GROUPS) {
    const host = document.querySelector(`.field[data-group="${g.key}"]`);
    if (!host) continue;
    for (const b of host.querySelectorAll('[data-id]')) {
      const o = g.list().find(x => x.id === b.dataset.id);
      if (!o) continue;
      const label = priceLabel(tilePrice(g, o, state));
      const meta = b.querySelector('.tile__meta');
      if (meta) { meta.textContent = label; continue; }
      /* Swatches hide their meta by CSS, so the accessible name is where a
         price would actually reach somebody. Every colour is ₪0 today;
         the day one is not, this is already right. */
      const sw = b.querySelector('.swatch__meta');
      if (sw) {
        sw.textContent = `${colourCode(o)} · ${label}`;
        b.title = `${L(o)} · ${colourCode(o)}${label === priceLabel(0) ? '' : ` · ${label}`}`;
        b.setAttribute('aria-label', `${L(o)}, ${colourCode(o)}`
                       + (label === priceLabel(0) ? '' : `, ${label}`));
      }
    }
  }
}

function buildOptions(g, host) {
  if (g.kind === 'mashkof') return buildMashkof(g, host);
  host.setAttribute('role', 'radiogroup');
  host.setAttribute('aria-label', T(g.title));
  host.className = 'field__opts '
    + { swatch: 'swatches', pill: 'pills', tile: 'tiles', sq: 'tiles tiles--sq', hw: 'tiles tiles--hw' }[g.kind];

  /* ⚠ THE SCREEN'S ORDER AND THE LIST'S ORDER ARE TWO DIFFERENT THINGS.
     `sub` groups a long list into halves — see DETAIL_SUBS in catalog.js — and
     it is applied HERE rather than by re-cutting the array, because the short
     code packs that array's INDEX and a reorder would refuse every code
     already written. Options with no `sub` come first and carry no heading.
     The headings are `aria-hidden`: this is one radiogroup with one answer,
     and inserting real headings into it would announce two groups where the
     customer makes one choice. Each tile already carries its own name. */
  /* `split` is the same idea as `subs` with the grouping DERIVED rather than
     declared — see the colour group, where the two headings are what the
     options cost and a hand-kept list would go stale the day Peretz changes
     which paints are included. */
  const groups = g.split
    ? g.split(g.list(), state).filter(([, items]) => items.length)
    : g.subs
    ? [[null, g.list().filter(o => !o.sub)],
       ...g.subs.map(([k, key]) => [T(key), g.list().filter(o => o.sub === k)])]
    : [[null, g.list()]];

  for (const [label, items] of groups) {
  if (label && items.length) {
    const h = document.createElement('div');
    h.className = 'opts__sub';
    h.setAttribute('aria-hidden', 'true');
    h.textContent = label;
    host.appendChild(h);
  }
  for (const o of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = o.id;
    b.setAttribute('role', 'radio');

    if (g.kind === 'swatch') {
      b.className = 'swatch';
      /* ⚠ THE CODE IS ON THE SWATCH NOW, 14.9.2026 — Peretz asked for the
         colour options to be rectangles with the code inside them. It is what
         he orders by: the number on the manufacturer's sheet, which until now
         was in the tooltip and the accessible name and nowhere a customer
         reading the page could see it.
         ⚠ IT SITS IN A BAND RATHER THAN ON THE COLOUR, AND THAT IS A
         MEASUREMENT AND NOT A PREFERENCE. Contrast was computed for all
         seventeen against both inks: ten read better in white and seven in
         dark, and SIXTEEN clear 4.5 comfortably — but ירוק מרווה (6219D,
         #7A8272) tops out at **3.99 in white and 3.94 in dark**. There is no
         ink that works on a mid-tone. Small text at 3.99 fails the contrast
         bar, and the bar is right: a code a customer has to squint at is the
         same defect as no code. A scrim or a text-shadow is the same thing
         with the evidence hidden, and it would sit the text on a colour that
         is no longer the colour.
         So the rectangle carries a band across its foot in the panel's own
         surface, with the code in the page's own ink — the pairing every other
         label on the page already uses and the audit already checks — and the
         colour above it is untouched and unobscured. It is how the
         manufacturer's own chart prints a code, and it is the same on all
         seventeen rather than one ink for ten and another for seven.
         The name stays hidden and stays in the accessible name: seventeen
         Hebrew colour names would not fit a 64 px tile at any size worth
         reading, and the tooltip and `aria-label` below carry both. */
      b.title = `${L(o)} · ${colourCode(o)}`;
      b.setAttribute('aria-label', `${L(o)}, ${colourCode(o)}`);
      b.innerHTML = `
        <span class="swatch__chip" style="--chip:${o.hex}">
          <span class="swatch__code">${colourCode(o).replace(/^.*\s/, '')}</span>
        </span>
        <span class="swatch__name">${L(o)}</span>
        <span class="swatch__meta">${colourCode(o)} · ${priceLabel(tilePrice(g, o, state))}</span>`;
    } else if (g.kind === 'pill') {
      b.className = 'pill';
      b.textContent = L(o);
    } else {
      b.className = 'tile';
      b.innerHTML = `
        <span class="tile__art">${g.glyph(o)}</span>
        <span class="tile__name">${L(o)}</span>
        ${/* ⚠ THE BAND EACH SIZE SERVES, AND IT HAS BEEN OWED SINCE 23.8.
             `ASK-PERETZ.md` §8: "the size tiles are meant to print the band each
             one serves, so a customer with an odd opening can tell which tile is
             theirs instead of guessing or telephoning." It refused to invent the
             ranges — one arrived from outside as an example and could not be
             right, because it swallowed צרה — so the tiles showed only a name.
             Peretz gave the real bands on 26.8 and this is that line.
             Read off `o.band`, so any option that grows one gets it for free
             and no group needs a special case. */''
        }${o.band ? `<span class="tile__band">${L(o.band)}</span>` : ''}
        <span class="tile__meta">${priceLabel(tilePrice(g, o, state))}</span>
        <span class="tile__why" hidden></span>`;
    }
    b.addEventListener('click', () => choose(g, o.id));
    host.appendChild(b);
  }
  }
  keyboardGrid(host);
  if (g.key === 'handle') buildLengthStepper(host);
  if (g.key === 'detail') buildStripes(host);
}

/**
 * ── THE משקוף — A SECTION AND SIX CHOICES ──────────────────────────────
 *
 * Peretz, 20.9.2026: *"there needs to be a sort of a square C shape that
 * represents how the mashkof looks from above if it is cut half way … there
 * are 3 parts to the mashkof, the outer kant, the falc, and the inner kant …
 * 6 boxes, 3 rows, 2 columns, in each row there is an option of 0 (the normal
 * size) and +250 … the user can check whatever they like … say that the
 * regular mashkof is within the price (although it is 500) and the other are
 * +250 or +500."*
 *
 * So: the section (`mashkofGlyph`, redrawn from the state on every paint, its
 * parts named in the customer's language), and under it three ROWS, one per
 * part, each a `radiogroup` of two — סטנדרטי · כלול against רחב · +₪250. A
 * tap computes the set of widened parts and asks `mashkofFor` for the one id
 * that set is, then goes through `choose` like every other tap, so the rules,
 * the URL, the code, the price and the order never learn that this control is
 * not a list of tiles.
 *
 * ⚠ THREE RADIOGROUPS IN ONE FIELD, AND TWO INSTRUMENTS COUNTED "ONE CHECKED
 * PER FIELD". `npm run fuzz` asserted exactly one `aria-checked="true"` per
 * `.field[data-group]`, which was the right invariant while a field was one
 * radiogroup; it counts per `[role="radiogroup"]` now, which is what the ARIA
 * invariant always was. `markGroup` hands this group to `markMashkof`, because
 * its radios' ids are PART choices (`out-wide`), not entries of `MASHKOFS`,
 * and the generic marker would have unchecked all six on every paint.
 *
 * ⚠ THE WIDE PILL PRINTS WHAT THAT PART COSTS ON THIS DOOR, read off
 * `priceParts` as the difference the part makes to the frame's row — ₪250 on
 * a standard door, and more on a חריגה, because the size multiplier lands on
 * the whole frame including its extras (assumption A3). Typing "+₪250" would
 * have been right on three sizes of six. The standard pill says כלול, and the
 * step's explainer says in one sentence why the breakdown still shows the
 * frame at ₪500: it is one of the six parts of a fitted door, not a surcharge.
 *
 * ⚠ THE DOOR MOVES FOR TWO PARTS OF THREE, BY CONSTRUCTION. `render` reads
 * `out` and `in`; the inner kant is behind the wall from the street. The hint
 * says so, so a customer who ticks it and sees nothing move is told why.
 */
function buildMashkof(g, host) {
  host.className = 'field__opts mkc';
  host.removeAttribute('role');
  host.removeAttribute('aria-label');
  host.innerHTML = `<div class="mkc__art" aria-hidden="true"></div>`
    + MASHKOF_PARTS.map(p => `
      <div class="mkc__row" role="radiogroup" aria-label="${L(p)}" data-part="${p.key}">
        <span class="mkc__part" aria-hidden="true">${L(p)}</span>
        <button type="button" class="pill mkc__opt" role="radio"
                data-id="${p.key}-std" data-part="${p.key}" data-wide="0">
          <span class="mkc__opt-t">${T('mk.std')}</span>
          <span class="mkc__opt-p">${priceLabel(0)}</span></button>
        <button type="button" class="pill mkc__opt" role="radio"
                data-id="${p.key}-wide" data-part="${p.key}" data-wide="1">
          <span class="mkc__opt-t">${T('mk.wide')}</span>
          <span class="mkc__opt-p" data-mk-price></span></button>
      </div>`).join('');
  for (const b of host.querySelectorAll('[data-part][role="radio"]')) {
    b.addEventListener('click', () => {
      const now = byId(MASHKOFS, state.mashkof).wide;
      const key = b.dataset.part;
      const next = b.dataset.wide === '1'
        ? [...new Set([...now, key])] : now.filter(k => k !== key);
      const mk = mashkofFor(next);
      if (mk) choose(g, mk.id);
    });
  }
  keyboardGrid(host);
  markMashkof(g);
}

/** Which of the six is on, what each wide part costs on THIS door, and the
    section redrawn — asked on every paint, like `markGroup` for the tiles. */
function markMashkof(g) {
  const host = document.querySelector(`.field[data-group="${g.key}"] .mkc`);
  if (!host) return;
  const mk = byId(MASHKOFS, state.mashkof);
  host.querySelector('.mkc__art').innerHTML = mashkofGlyph(mk);
  for (const p of MASHKOF_PARTS) {
    const isWide = mk.wide.includes(p.key);
    const others = mk.wide.filter(k => k !== p.key);
    const withIt = priceParts({ ...state, mashkof: mashkofFor([...others, p.key]).id }).mashkof;
    const without = priceParts({ ...state, mashkof: mashkofFor(others).id }).mashkof;
    const row = host.querySelector(`.mkc__row[data-part="${p.key}"]`);
    row.querySelector('[data-mk-price]').textContent = deltaLabel(withIt - without);
    for (const b of row.querySelectorAll('[role="radio"]')) {
      const on = (b.dataset.wide === '1') === isWide;
      b.setAttribute('aria-checked', String(on));
      b.classList.toggle('is-selected', on);
      b.tabIndex = on ? 0 : -1;
      b.setAttribute('aria-label', `${L(p)}: ${b.querySelector('.mkc__opt-t').textContent}, `
                                 + b.querySelector('.mkc__opt-p').textContent);
    }
  }
}

/**
 * THE STRIPES — a direction, a number, and how they are arranged.
 *
 * ⚠ THIS REPLACED FOURTEEN TILES. Peretz prices per stripe — ₪150 horizontal,
 * ₪300 vertical — so a grid of named compositions could not express what he
 * sells, and he asked for the complicated ones removed. What survives the test
 * ("more than two distinct stripe lengths") is recorded in
 * `research/works/INVENTORY.md` §5a; what is left is a count.
 *
 * Three controls, and the third only when it means something:
 *   - direction — none / horizontal / vertical, as pills
 *   - how many  — a stepper, capped by what the leaf holds
 *   - tight     — a toggle, HORIZONTAL ONLY, because nothing in the 129
 *                 photographs is a tight vertical group and offering one would
 *                 be inventing geometry (REALISM.md §6)
 *
 * ⚠ AND IT SAYS WHY WHEN IT CANNOT BE USED. `conflicts(state).stripes` is a
 * SENTENCE rather than a map of blocked ids, because there are no ids left to
 * block. A control that is simply dead tells the customer nothing; one that
 * says "לא משלבים פסי מתכת עם חלון" tells them what to change.
 */
function buildStripes(host) {
  const old = host.querySelector('.stripes');
  if (old) old.remove();
  const why = conflicts(state).stripes;
  const dir = state.stripeDir, n = state.stripeCount;
  const max = dir === 'v' ? STRIPE_MAX.v : (state.stripeTight ? STRIPE_MAX.hTight : STRIPE_MAX.h);

  const box = document.createElement('div');
  box.className = 'stripes';
  /* ⚠ THE CONTROL IS ALWAYS HERE NOW, AND IT SAYS WHY RATHER THAN VANISHING —
     14.9.2026. Peretz: the stripes disappear when panels are chosen.
     They did, completely: the whole control was replaced by its label and one
     sentence, so a customer who had picked a panel could not see that stripes
     exist, what they cost, or that one tap would trade the panel for them.
     The old comment on `.stripes__why` argued "a dead button tells a customer
     nothing, a sentence tells them what to change", and that reasoning is
     right about DEAD buttons — which is why this is not one. It is the tile
     idiom, which every other group in this flow has used all along and
     `PLAN.md` §10.5 states: blocked options stay focusable and clickable and
     say why, and where there is an obvious repair the click performs it.
     So the pills are rendered in every state, marked `aria-disabled` and
     `.is-blocked` when the face is in the way, with the reason under them —
     and a tap runs the same `repair(…, 'stripes')` every other tap runs, which
     clears the panels and says so. Nothing here decides anything: the rule
     table is still the only thing that knows what can go with what.
     ⚠ WHAT WAS REJECTED. A second `.opts__sub` heading over the missing
     control — that is the present fault with a label on it. Moving stripes to
     a step of their own — a ninth question for a ₪150 line, and the flow has
     just had `mk` moved for being one question too many. */
  box.innerHTML = `
    <span class="stripes__label" id="stripes-l">${T('stripes.label')}</span>
    <div class="stripes__dirs" role="group" aria-labelledby="stripes-l">
      ${[['none', 'stripes.none'], ['h', 'stripes.h'], ['v', 'stripes.v']].map(([id, k]) => `
        <button type="button" class="pill stripes__dir${dir === id ? ' is-on' : ''}${why && id !== 'none' ? ' is-blocked' : ''}"
                data-dir="${id}" aria-pressed="${dir === id}"
                aria-disabled="${!!why && id !== 'none'}">${stripesGlyph(id)}<span>${T(k)}</span></button>`).join('')}
    </div>
    ${why ? `<p class="stripes__why">${why}</p>` : ''}

    ${dir === 'none' ? '' : `
      <div class="blen__row">
        <button type="button" class="blen__b" data-n="-1" aria-label="${T('stripes.fewer')}"
                ${n <= 1 ? 'disabled' : ''}>−</button>
        ${/* ⚠ THROUGH `counted`, NOT `${n} ${T('stripes.noun')}`. Russian has
              three plural forms — 1 полоса, 3 полосы, 5 полос — and 21 takes
              the singular again while 11 does not. A count pasted beside a
              fixed noun is right in Hebrew, right in English, and wrong in
              Russian four times out of ten. */''}
        <output class="blen__v" aria-labelledby="stripes-l">${counted(n, 'stripes.noun')}</output>
        <button type="button" class="blen__b" data-n="1" aria-label="${T('stripes.more')}"
                ${n >= max ? 'disabled' : ''}>+</button>
      </div>
      ${dir === 'h' ? `
        <button type="button" class="pill stripes__tight${state.stripeTight ? ' is-on' : ''}"
                data-tight="1" aria-pressed="${state.stripeTight}">${T('stripes.tight')}</button>` : ''}
      <span class="stripes__cost">${priceLabel(priceParts(state).stripes)}</span>`}`;

  /* ⚠ AND IT SAYS WHAT IT TOOK AWAY — 14.9.2026. This discarded `said` and
     kept only `.state`, so a tap here performed its repairs in SILENCE: on a
     panelled door it cleared the face, on a glazed one it removed the window,
     and the customer was told neither. Every other control in this flow goes
     through `choose`, which has joined the sentences with ' · ' since 9.9;
     the stripes are the one control that is not a tile and so had its own
     handler, and the handler never got that fix.
     It was nearly unreachable while a blocked door showed no pills at all —
     which is how it stayed hidden — and this round makes the blocked tap the
     normal way to trade a panel for stripes, so it has to speak. */
  for (const b of box.querySelectorAll('[data-dir]')) {
    b.addEventListener('click', () => {
      const d = b.dataset.dir;
      noteEngaged();
      const { state: fixed, said } = repair({ ...state, stripeDir: d,
                   stripeCount: d === 'none' ? 0 : Math.max(1, state.stripeCount || 2),
                   stripeTight: d === 'v' ? false : state.stripeTight }, 'stripes');
      set(fixed);
      toast(said.join(' · '));
    });
  }
  for (const b of box.querySelectorAll('[data-n]')) {
    b.addEventListener('click', () => {
      const next = state.stripeCount + Number(b.dataset.n);
      if (next < 1 || next > max) return;
      set({ ...state, stripeCount: next });
    });
  }
  const t = box.querySelector('[data-tight]');
  if (t) t.addEventListener('click', () => set({ ...state,
    stripeTight: !state.stripeTight,
    /* A tight band tops out lower than a spread one — eight against eleven —
       so turning it on has to bring an over-long count with it rather than
       leaving a state the packer cannot encode. */
    stripeCount: Math.min(state.stripeCount, state.stripeTight ? STRIPE_MAX.h : STRIPE_MAX.hTight) }));
  host.appendChild(box);
}

/**
 * HOW LONG THE BAR IS — a stepper, appended under the pull-handle tiles.
 *
 * ⚠ A STEPPER AND NOT A SLIDER, BECAUSE THE PRICE STEPS. Peretz charges ₪150
 * for every 20 cm past a metre, so a control offering 137 cm would take that
 * ₪150 at 120 and again at 140 with nothing on screen to explain either jump.
 * A control finer than the price is a control that lies. The eight values are
 * `HANDLE_LENS`, which is also what lets the length pack into the short code
 * as three bits instead of a millimetre count.
 *
 * ⚠ HIDDEN, NOT DISABLED, for the two flat-priced grips. A recessed channel is
 * CUT when the leaf is made and a horizontal bow is one product Peretz buys —
 * neither has a length to sell — and a greyed-out control for a property a
 * product does not have is noise rather than information. `aria-disabled` is
 * for an option that COULD be chosen and cannot be right now; this is not that.
 *
 * ⚠ AND THE LIST IS WHAT THE LEAF WILL TAKE. `handleLensFor` drops any length
 * that would not fit the door, so a customer cannot ask for a 200 cm bar on a
 * 203 cm leaf. A configurator that accepts an impossible door is the one
 * failure PLAN.md §0 exists to prevent — and the clamp lives in the catalogue
 * beside the price and the drawing, not here, so all three agree.
 */
function buildLengthStepper(host) {
  const hd = byId(HANDLES, state.handle);
  const old = host.querySelector('.blen');
  if (old) old.remove();
  if (hd.priceKind !== 'bar') return;

  const lens = handleLensFor(state);
  const now  = handleLength(state);
  const box = document.createElement('div');
  box.className = 'blen';
  box.innerHTML = `
    <span class="blen__label" id="blen-l">${T('len.label')}</span>
    <div class="blen__row">
      <button type="button" class="blen__b" data-step="-1" aria-label="${T('len.shorter')}">−</button>
      <output class="blen__v" aria-labelledby="blen-l">${T('len.cm', Math.round(now / 10))}</output>
      <button type="button" class="blen__b" data-step="1" aria-label="${T('len.longer')}">+</button>
    </div>`;
  for (const b of box.querySelectorAll('.blen__b')) {
    const dir = Number(b.dataset.step);
    const i = lens.indexOf(now);
    b.disabled = i + dir < 0 || i + dir >= lens.length;
    b.addEventListener('click', () => {
      const j = lens.indexOf(handleLength(state)) + dir;
      if (j < 0 || j >= lens.length) return;
      set({ ...state, handleLen: lens[j] });
    });
  }
  host.appendChild(box);
}

/**
 * Open one thing at each level, closing whatever else was open there.
 *
 * Closing a SECTION also closes the category inside it. Without that, opening
 * the section again re-reveals options the customer left behind three
 * decisions ago, and the panel is suddenly two screens tall again — which is
 * the whole thing the cabinet exists to prevent.
 */

/**
 * ── WHERE THE SEND BUTTON BELONGS, AT THIS WIDTH ─────────────────────
 *
 * ⚠ THE FLOW ENDED WITH ITS OWN SEND BELOW THE FOLD. Measured on the live
 * page, driving forward with the BUTTON rather than by clicking the rail: on
 * the summary the 228 x 51 primary send sat **154 px below the fold at
 * 1280x720** and **202 px below at 320x568** — the one action this site
 * exists to produce, off screen on the one step whose job is producing it.
 * For eight consecutive steps the eye learns that the way on is in
 * `.sect__foot`; on the ninth that bar held a Back button and nothing else.
 *
 * ⚠ AND THE FIX IS NOT THE SAME AT BOTH WIDTHS, WHICH IS WHY THIS IS A
 * FUNCTION AND NOT A LINE IN `goStep`. Above 1100 px the foot is
 * `position: sticky` at the bottom of a card that scrolls inside its own
 * column, so moving the send there PINS it — measured after: on screen at
 * 1280, 1440 and 1920. Below 1100 the foot is not sticky, it is simply the
 * last thing on a page that scrolls, so the same move made the phone WORSE:
 * 202 px below the fold became **580**, and it put the primary action after
 * the two secondary ones. Measured, then backed out for that width.
 *
 * ⚠ PINNING IT ON A PHONE TOO WAS THE OBVIOUS THIRD OPTION AND THE NUMBERS
 * REFUSE IT. At 320x568 the navigator is `fixed` at 62 px and the quote bar
 * `fixed` at 59; a 95 px pinned foot would leave 352 px of a 568 px screen —
 * three bars of chrome. That is the same arithmetic that took the brand mark
 * off the phone on 30.8. The phone already has a pinned send: the quote bar's
 * chip, which is a `[data-wa]` like this one and carries the identical href.
 *
 * ⚠ SO THE 1100 px CROSSING HAS A LISTENER AGAIN, and the note in `init` that
 * says it does not is corrected. It was deleted when the fold went, because a
 * flow has one shape at every width and there was nothing for a crossing to
 * put right. There is exactly one thing now, and this is it — it moves one
 * element and reshapes nothing.
 */
function placeSend() {
  const wa = $('#wa-btn');
  const card = document.querySelector('.panel--send .send');
  if (!wa || !card) return;
  const wide = typeof window.matchMedia === 'function'
    && window.matchMedia('(min-width: 1100px)').matches;
  const foot = document.querySelector('.sect--sum .sect__foot');
  if (wide && foot) {
    if (wa.parentElement !== foot) foot.appendChild(wa);
  } else if (wa.parentElement !== card) {
    /* Home is above the alternates — the primary before the two secondaries,
       which is the order the card was written in. */
    card.querySelector('.send__alt')?.before(wa);
  }
}

/**
 * ── THE FLOW ─────────────────────────────────────────────────────────
 *
 * One step is live; the rest are `hidden`. This replaced a two-level cabinet —
 * four sections opening onto categories opening onto options — and the reason
 * is recorded at length in `TRANSFORM.md` §10.0. The short form: a fold asks a
 * question about the INTERFACE ("is what I want inside this one?") before it
 * asks anything about a door, it has nowhere to explain what a משקוף is, and
 * it gets worse with every category — of which this round added three.
 *
 * ⚠ `liveStep` IS PRESENTATION AND NEVER REACHES THE DESIGN. It is not in
 * `state`, not in the URL, not in the short code, and not in `js/spec.js`.
 * Which step a customer is looking at is a fact about their afternoon; the
 * door is what gets sent to Peretz.
 */
let liveStep = SECTIONS[0].key;
/** Has the customer already watched the door settle? See the note in `goStep`.
 *  Presentation, like `liveStep`: not in `state`, not in the URL, not in the
 *  code, and reset by nothing but a reload. */
let revealed = false;

/**
 * ── WHAT A CHOICE TOOK AWAY, SO THE NEXT ONE CAN GIVE IT BACK ─────────
 *
 * Asked for from outside: *"when i choose a window and then go back to no
 * window, i want it to go back to the panels that it had before. and that goes
 * for all the options that remove things."*
 *
 * Keyed by the FIELD that did the displacing, not by the field displaced, and
 * that is the whole design: `window` took the panels, so `window` is the thing
 * that can hand them back. A second tap in the same group is the only event
 * that consults it, which is exactly the customer's sentence — go back to no
 * window, get your panels.
 *
 * Each entry is `{ was, became }`. `became` is what makes this safe to keep
 * for the whole session without any bookkeeping: an entry is only honoured
 * while the field still holds the value the repair left it at, so a customer
 * who chose a window, lost their panels, and then deliberately picked a
 * different face has already invalidated it. Nothing has to notice that
 * happening; the check is made at the moment of restoring.
 *
 * ⚠ IT PROPOSES, `repair` DECIDES. The restored value is put into a CANDIDATE
 * state which goes through `repair` like any other, and is kept only if it
 * survives. So this cannot reintroduce a combination the rules refuse, and it
 * cannot fight the 7.9 paired-fittings block or any rule added later. It is a
 * suggestion with a veto over it, not a second rule table.
 *
 * ⚠ AND IT NEVER RIDES IN THE URL OR THE SHORT CODE, for exactly the reason
 * `liveStep` does not. What a customer had two taps ago is a fact about their
 * afternoon, not about the door: a link is a DOOR, and a code read down the
 * telephone is a door. Somebody opening either of them has no panels to get
 * back, and a memory that travelled would silently give them somebody else's.
 * There is no storage, no serialisation and nothing to migrate; a reload
 * empties it, which is correct.
 */
const displaced = new Map();

const STEP_KEYS = () => [...SECTIONS.map(x => x.key), SUMMARY.key];

function goStep(key, focus = true) {
  if (!STEP_KEYS().includes(key)) return;
  liveStep = key;
  for (const k of STEP_KEYS()) {
    const box = document.querySelector(`.sect[data-section="${k}"]`);
    if (box) { box.hidden = k !== key; box.classList.toggle('is-live', k === key); }
  }
  /* The send card lives in the summary step and nowhere else. It is MOVED
     rather than copied — `index.html` still owns the markup, and two copies of
     the price and the spec table is the one duplication this codebase has paid
     for most often.

     ⚠ BEFORE THE EXPLAINER, NOT AFTER IT — 11.9.2026. Every one of the eight
     question steps appends its `<details>` AFTER the answers (`buildPanel`),
     because "what is a משקוף?" is a question somebody asks while looking at
     the tiles, not before reaching them. The summary came out the other way
     round, and not by anybody's decision: the explainer is appended when the
     step is BUILT and this card is moved in LATER, so the order was an
     artefact of the clock rather than of the argument. It cost the one thing
     the summary is short of.
     Measured at 1280x720, the commonest laptop, on a customer's shared link:
     the spec table began at y=568 against a fold of 612, so **not one of the
     eight rows was whole on screen** under a lede that says "check that
     everything is right". The explainer is 45 px and a gap, and the table
     moves up by exactly that: 568 → 523. Whole rows, standard door:

       1100  2 → 4      1280  0 → 1      1440  5 → 6
       1680  7 → 8      1920  6 → 7

     ⚠ AND 1280 IS STILL ONE ROW, WHICH IS ARITHMETIC AND NOT A TUNING
     PROBLEM. The fold there is 612 and the table is 317 px, so it would have
     to start at 295; what stands above it is 92 px of heading, the 122 px
     handing confirmation (`UX-FINDINGS` §2, deliberate, and asserted whole on
     screen at every viewport) and the card's own padding. One of those would
     have to go. Recorded in CLAUDE.md §9 rather than guessed at, like the
     wall that cannot hold both its controls.

     `insertBefore(node, null)` appends, so a summary with no explainer
     behaves exactly as before. */
  const slot = $('#sum-slot'), send = document.querySelector('.panel--send');
  if (slot && send && send.parentElement !== slot) {
    slot.insertBefore(send, slot.querySelector('.sect__exp'));
  }

  placeSend();
  markMore();

  markSteps();

  /* ── THE REVEAL, AND THE LATCH THAT MAKES IT A MOMENT ────────────────
     `GUIDED-FLOW.md` §3.4: reaching the end is the one place this page is
     allowed a flourish. The animation is in the stylesheet (`.is-reveal`);
     what is here is the decision that it happens ONCE.

     ⚠ A flourish that replays every time somebody edits a choice and walks
     back to the summary is not a flourish, it is a tic — and a customer
     comparing two grilles crosses this step repeatedly. The latch is a plain
     boolean in this module: it is not `state`, not the URL and not the code,
     for exactly the reason `liveStep` is none of those. Whether somebody has
     already seen the door settle is a fact about their afternoon.

     ⚠ AND IT IS REMOVED ON A TIMER, NOT ON `animationend`. Under
     `prefers-reduced-motion` and under `.is-bare` the stylesheet cuts every
     animation to nothing, so `animationend` may never fire and the class would
     stay on the document for ever — the same trap the arrival animation
     documented, and the same answer.

     ⚠ AND IT IS GATED ON `focus`, WHICH IS THE ONLY SIGNAL THERE IS FOR "the
     customer went there". `init` places the first step with `focus = false` —
     and a SHARED LINK opens straight at the summary, so without this Peretz
     would get a flourish every time he opened a customer's door, over the top
     of the arrival animation that is already running. A reveal is for the
     person who built the thing. */
  if (key === SUMMARY.key && !revealed && focus) {
    revealed = true;
    const root = document.documentElement;
    root.classList.add('is-reveal');
    setTimeout(() => root.classList.remove('is-reveal'), 1000);
  }

  if (focus) {
    const h = $(`#sect-head-${key}`);
    /* ⚠ WHICH THING SCROLLS DEPENDS ON THE WIDTH, and getting it wrong is a
       fault the audit already knows how to name. Above 1100 the page is ONE
       SCREEN with `overflow: hidden` and the two columns scroll inside it —
       so `scrollIntoView` on the heading dragged the whole document to y=600
       and the audit reported it at all four desktop viewports. Below 1100 the
       page itself scrolls and the dock is `fixed` over its bottom 78 px, so
       `nearest` does nothing (the browser counts "behind the green bar" as in
       view) and the heading a customer just asked for took focus while
       invisible — WCAG 2.4.11 on top of the nuisance.
       So: scroll the PANEL on a desktop, the PAGE on a phone. The clearance
       for the dock is `scroll-margin-block` in the stylesheet, where the
       dock's height is declared. */
    if (h) {
      const wide = typeof window.matchMedia === 'function'
        && window.matchMedia('(min-width: 1100px)').matches;
      const panel = h.closest('.panel--choose');
      if (wide && panel) panel.scrollTop = Math.max(0, h.offsetTop - panel.offsetTop - 26);
      /* ⚠ THE STEP CARD SCROLLS, NOT THE HEADING, and the difference is one
         line of eyebrow. Bringing the `<h2>` to the top of what is visible puts
         everything ABOVE it behind the sticky door — which is the `NN ⁄ 08`,
         invisible on every jump from the moment that eyebrow got a style. The
         `.sect` box starts at the eyebrow and carries the scroll margin that
         clears the door. Focus still lands on the heading below, because that
         is what announces the step to a screen reader.
         Above 1100 the same 26 px of slack is subtracted from the panel's own
         scrollTop, for the same reason and against the same element. */
      else (h.closest('.sect') || h).scrollIntoView({ block: 'start' });
      /* `preventScroll`: the focus is what makes the step announce itself to a
         screen reader, and it must not undo the scroll just chosen. */
      h.focus({ preventScroll: true });
    }
  }
  fitStage();
  paint();
}

/**
 * ⚠ HAS THIS CUSTOMER ENGAGED WITH THE GUIDE? — 10.9.2026.
 *
 * `isUntouched(state)` answers "is this the door the page opened with", and
 * that is the same question as "has anybody engaged" for exactly as long as
 * the customer has not moved: at arrival, and never again. Walked forward
 * with the button through all eight steps at 390 px, accepting the standard
 * ₪3,195 door, the message reaching Peretz still read *"I looked at the door
 * the site opens with and I have a question"* — and so did the one from a
 * customer who changed the colour and changed it back.
 *
 * ⚠ IT IS PRESENTATION, EXACTLY LIKE `liveStep`, and is kept out of `state`
 * for the same reason: it would ride into the URL and the short code, and
 * which questions somebody read is not a fact about a door. A MONOTONE LATCH,
 * because engagement does not un-happen — and that also means no reader has
 * to care what order things ran in.
 *
 * ⚠ SET AT THE GESTURE, not inside `goStep`, and that distinction is the
 * whole correctness of it. `goStep` is also called by BOOT and by the
 * language switch, and marking there would tell Peretz that a shared link he
 * opened himself — which lands on the summary — was a door somebody chose.
 */
let engaged = false;
const noteEngaged = () => { engaged = true; };

/** One step forward or back, clamped. Never wraps: a flow that loops has no
 *  end, and the end is the whole point — it is where the door gets sent. */
function stepBy(d) {
  noteEngaged();
  const keys = STEP_KEYS();
  const i = keys.indexOf(liveStep) + d;
  if (i < 0 || i >= keys.length) return;
  goStep(keys[i]);
}

/* ── SAVED DESIGNS ───────────────────────────────────────────────────
 *
 * A customer comparing two doors had nowhere to put the first one. The design
 * IS the address bar and `fromQuery` round-trips it perfectly, but nothing on
 * the page ever said so, so closing the tab lost it.
 *
 * ⚠ THIS IS NOT A REPLACEMENT FOR THE CODE OR THE LINK, and the mockup's
 * version — which deletes the visible `DM-` code and puts a heart there — was
 * declined for that reason. The code is how an order is taken down a
 * telephone; the link is how Peretz sees the exact door. Those are the things
 * a customer can SEND. This is `localStorage`: it never leaves the machine,
 * never reaches us, and does not survive a different browser or a cleared
 * cache. A convenience for holding two doors side by side, nothing more, and
 * the copy says so.
 *
 * ⚠ EVERY ACCESS IS WRAPPED. `localStorage` THROWS rather than returning null
 * in a private window with site data blocked, and an unguarded read at boot
 * would take down the whole page — which, per the `<noscript>` work, means a
 * styled and inert screen with two dead buttons. A door-saving convenience is
 * not permitted to cost the site.
 */
const SAVED_KEY = 'dm.saved.v1';
const SAVED_MAX = 6;

const savedRead = () => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(x => typeof x === 'string') : [];
  } catch { return []; }
};
const savedWrite = list => {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, SAVED_MAX))); return true; }
  catch { return false; }
};

/** The stored form is the QUERY, because that is the only representation that
 *  survives a catalogue change with a notice rather than silently. */
function saveCurrent() {
  const q = toQuery(state);
  const list = savedRead().filter(x => x !== q);
  list.unshift(q);
  if (!savedWrite(list)) { toast(T('saved.no')); return; }
  toast(T('saved.ok'));
  paintSaved();
}

function paintSaved() {
  const list = savedRead();
  const btn = $('#saved-btn');
  if (!btn) return;
  btn.hidden = !list.length;
  /* ⚠ AND SHUT THE DRAWER WITH IT. Hiding the toggle used to be all this did,
     so deleting the last saved design left the open panel pinned under the
     header — "עדיין לא שמרתם עיצוב." — with its only control removed from the
     page and `aria-expanded="true"` still claiming it was open. Nothing but a
     reload could close it. A disclosure whose button is gone has to be shut,
     not merely orphaned. */
  if (!list.length) {
    const box = $('#saved');
    if (box) box.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }
  document.querySelectorAll('[data-saved-count]').forEach(e => { e.textContent = String(list.length); });
  const box = $('[data-saved-list]');
  const none = $('[data-saved-empty]');
  if (!box) return;
  if (none) none.hidden = list.length > 0;
  box.replaceChildren(...list.map(q => {
    const li = document.createElement('li');
    li.className = 'saved__row';
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'saved__open';
    /* Named by what the door IS, from the same rows everything else uses —
       and by what it COSTS, which is the only part of the row a 320 px phone
       has room for and the reason somebody saved two doors. `priceAgorot` on
       the state, never a figure stored beside the query: a price written down
       at save time is a price that goes stale the day `js/prices.js` moves,
       which is the shape `js/works.js` already refuses for the gallery. */
    let label = q, cost = '';
    try {
      const st = fromQuery(q).state;
      label = summaryLine(st);
      cost = formatAgorot(priceAgorot(st));
    } catch { /* keep the query */ }
    const what = document.createElement('span');
    what.className = 'saved__what';
    what.textContent = label;
    open.append(what);
    if (cost) {
      const money = document.createElement('b');
      money.className = 'saved__cost';
      money.textContent = cost;
      open.append(money);
    }
    open.addEventListener('click', () => {
      /* ⚠ THE NOTICE IS THE WHOLE REASON THE STORED FORM IS A QUERY, AND IT
         WAS BEING DROPPED ON THE FLOOR. `saveCurrent`'s own docstring says the
         query is kept because it "survives a catalogue change WITH A NOTICE
         rather than silently" — and this handler destructured `state` alone,
         so a design saved before an option was withdrawn came back as the
         nearest buildable door, at a different price, without a word. Nothing
         fires today, because `repair` is idempotent and every saved query was
         buildable when it was written; it is the next withdrawal that spends
         it, and by then the customer's localStorage is already full of them.
         Said as a TOAST rather than through `showNotice`: that strip is the
         boot-time reader for an address somebody arrived on, and this customer
         is standing in front of the drawer having just tapped a row. */
      const { state: st, notice, said } = fromQuery(q);
      set(st);
      $('#saved').hidden = true;
      $('#saved-btn').setAttribute('aria-expanded', 'false');
      if (notice) toast(said && said.length ? said.join(' · ') : T('notice.some'));
    });
    const drop = document.createElement('button');
    drop.type = 'button';
    drop.className = 'saved__drop';
    drop.setAttribute('aria-label', T('saved.remove', label));
    drop.textContent = '×';
    drop.addEventListener('click', () => {
      savedWrite(savedRead().filter(x => x !== q));
      paintSaved();
    });
    li.append(open, drop);
    return li;
  }));
}

/** Which sections are open, on the navigator. */
function markSteps() {
  const keys = STEP_KEYS();
  const at = keys.indexOf(liveStep);
  for (const [i, k] of keys.entries()) {
    const b = document.querySelector(`.steps__step[data-step="${k}"]`);
    if (b) {
      const on = k === liveStep;
      b.classList.toggle('is-on', on);
      /* ⚠ `is-done` MEANS "BEHIND YOU", NOT "FINISHED", and the distinction is
         the whole reason this row is allowed to have a fill at all. Every step
         carries a valid value from the first paint — `nowLabel` falls back to
         `list[0]` — so a mark meaning COMPLETE would read 9/9 on arrival, which
         is the dishonesty this navigator has refused since it was four circles.
         Ordinal position is a fact about the page, like `NN ⁄ 08`, and it is
         safe to draw. It fills only behind; it never runs ahead. */
      b.classList.toggle('is-done', at >= 0 && i < at);
      if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    }
    /* ⚠ `NN ⁄ 08` IS A PAGE NUMBER, NOT A PROGRESS BAR, and the wording is
       deliberate. It says where you ARE; it makes no claim about what is
       finished — which nothing on this page may, because `nowLabel` falls back
       to `list[0]` and any state-derived indicator reads complete on arrival.
       A page number in a book claims nothing about whether you understood
       chapter one. The summary is excluded from the count for the same reason
       a contents page is not chapter nine. */
    /* ⚠ IN WORDS, BECAUSE "08 ⁄ 03" IS A PUZZLE AND NOT A POSITION.
       Reported from outside, 30.8.2026, looking at the shipped page. Two
       zero-padded numerals either side of a slash have no reading order a
       customer can trust: in an RTL column the eye takes the left-hand one
       first, so the total read as the current step and the whole thing looked
       like step eight of three. Nothing about the digits says which is which.
       The words carry it instead — the same information, in the one order
       every reader of this language already has. */
    const where = document.querySelector(`.sect[data-section="${k}"] [data-step-n]`);
    if (where) {
      where.textContent = k === SUMMARY.key ? T(SUMMARY.sub)
        : T('nav.stepOf', i + 1, SECTIONS.length);
    }
  }
  /* ⚠ THE HAIRLINE FILLS BEHIND YOU, AS A FRACTION, AND IT IS SET HERE RATHER
     THAN COUNTED IN CSS. `.steps::after` is one rule scaled on the inline axis,
     so it mirrors correctly in LTR for free — a fill drawn per-circle would
     leave a seam at every flex gap, which is why the connector under it is one
     rule and not nine borders.
     Zero on step 01 and 1 at the summary. A `scaleX` on a hairline is a
     compositor transform, so this costs no layout. */
  const nav = document.querySelector('.steps');
  if (nav) nav.style.setProperty('--fill', keys.length > 1 ? at / (keys.length - 1) : 0);

  /* ⚠ WHICH STEP IS LIVE, ON THE PANEL, FOR THE STYLESHEET. The gallery opener
     sits above the navigator, so on a phone — where the navigator is fixed at
     the top and the panel is the whole scrolling half — it is the first thing
     between the door and the question, on all nine steps. It is a good offer
     ("start from a door we already built") and it is only an offer at the
     START; by step 05 the customer has started, and it is a third object in
     front of the thing they were asked. CSS cannot ask "is the live step the
     first one", so it is told. Above 1100 there is room and it stays. */
  const panel = document.querySelector('.panel--choose');
  if (panel) panel.dataset.live = liveStep;

  /* ⚠ AND THE LIVE CIRCLE IS BROUGHT INTO VIEW — BY SCROLLING THE ROW, AND
     NOTHING ELSE. The row is nine 44 px circles and it does not fit 320 px,
     390 px or a 310 px desktop column — measured `scrollWidth` 456 against
     390, 429 against 310 — so it scrolls, and a navigator whose current
     position is off its own edge is not a navigator.
     ⚠ THIS WAS `live.scrollIntoView({ inline: 'nearest', block: 'nearest' })`
     UNDER A COMMENT SAYING "inline only, so it can never scroll the PAGE" —
     and it passed `block`. Reported by Peretz on a laptop, 20.9.2026: *"every
     time i press a button the page goes up a bit."* Measured 23.9: taps with
     the choices panel at its top moved nothing, and with the panel scrolled
     down nearly every tap scrolled it back UP by as much as 65 px — 41 of 81 at
     1100x800, 37 of 77 at 1536x730, on every step — so it added up press by
     press until the panel reached its top. The circle lives in a STICKY rail
     inside that panel, and since 12.9 the panel's `scroll-padding-block`
     reserves the rail's own band; a stuck circle always sits inside that band,
     so "nearest" on the block axis always found it short and scrolled the
     panel by the difference. Switching this one call off took the moving taps
     from 15 of 25 to 1 of 25 with the circle still in view.
     So the row is scrolled directly, by a relative inline delta — which is
     right in RTL for free, where `scrollLeft` counts negative — inset by the
     row's own `scroll-padding-inline`. A sticky element is never again asked
     to scroll the box it is stuck in.
     ⚠ Guarded: the row is absent in `?sheet=1`, where the flow is not built at
     all — CLAUDE.md §5.20 is what happens when that is assumed. */
  const live = document.querySelector('.steps__step.is-on');
  const row = live && live.closest('.steps');
  if (row && typeof row.scrollBy === 'function') {
    const pad = parseFloat(getComputedStyle(row).scrollPaddingInlineStart) || 0;
    const r = row.getBoundingClientRect(), c = live.getBoundingClientRect();
    const dx = c.left < r.left + pad ? c.left - (r.left + pad)
             : c.right > r.right - pad ? c.right - (r.right - pad) : 0;
    if (Math.abs(dx) > 0.5) row.scrollBy({ left: dx, behavior: 'instant' });
  }

  /* The way on and the way back, disabled at the ends rather than wrapping. */
  const i = keys.indexOf(liveStep);
  for (const b of document.querySelectorAll('.sect__back')) b.disabled = i <= 0;
  for (const b of document.querySelectorAll('.sect__next')) {
    b.disabled = i >= keys.length - 1;
    b.textContent = T(i === keys.length - 2 ? 'nav.toSummary' : 'nav.next');
  }
  /* The skip is pointless on the last two: the summary IS the destination, and
     the step before it already offers לסיכום on `.sect__next`. `hidden` rather
     than `disabled` — a dead control asks to be pressed and then refuses. */
  for (const b of document.querySelectorAll('.sect__skip')) b.hidden = i >= keys.length - 2;
}

/* ⚠ SIX FUNCTIONS DIED HERE AND THE COMMENT IS THE POINT.
   `closeSection`, `openAllSections`, `closeAllSections`, `closeGroup`, `open`
   and `toggle` were the accordion: one open at a time on a phone, all four
   open on a desktop, with `soloSections()` asking the viewport which. Every
   one of them was correct and several were hard-won — `toggleSection` passing
   `null` to `openSection` is why a click on one heading once shut all four,
   and the exclusivity had to become a property of the DEVICE rather than of
   the function to fix it.
   A flow has none of that. One step is live at every width, so there is no
   "which is open", no per-device shape, and no crossing to reshape on. The
   machinery is deleted rather than left unreferenced, because dead code that
   still reads as load-bearing is the thing a future reader wires back up. */


// ── choosing ──────────────────────────────────────────────────────

/**
 * Apply a choice, repairing the design if the choice makes it unbuildable.
 *
 * Never a dead end (PLAN.md §10.5): a blocked tile is still clickable, and
 * clicking it performs whatever change makes it possible and says so. Picking
 * a grille on a solid door has always added the window; every rule works that
 * way now, and the same `repair` runs on incoming links, so the interface and
 * a shared URL cannot disagree about what is buildable.
 */
function choose(g, id) {
  noteEngaged();
  /* ⚠ A GREYED PULL HANDLE OR LOCKSET CHANGES NOTHING — 20.9.2026. Peretz:
     *"when a person wants a pull handle when there is no space, then the
     normal handle goes away, not the window or the panels. and if a person
     wants a lever handle when there is a pull handle that prevents it, then
     there should be a window pop up that says that it cannot be together."*
     Every other greyed tile performs its repair on a tap — the stripes clear
     the face, a window drops the bar — and that idiom stays. These two are
     the exception because running `repair` on them would take away something
     the customer already had for something they cannot have: a bar tapped
     against the glass would drop the bar they HAVE, and a lever tapped
     against the bar would drop the bar for the lever. So the handle's tap
     says the tile's own reason (the window stays, the panels stay) and the
     lockset's opens the one dialog in the flow besides the gallery. The
     reasons are `conflicts`' — the same table `markGroup` painted the tile
     from — so the tap and the tile cannot disagree about why.
     ⚠ A handle whose only obstacle is the LEVER is not greyed at all, and its
     tap goes through `repair` below, which swaps the lever for the cylinder
     and says so. That is the half of his sentence about the lever going.

     ⚠ AND THE עינית JOINED THEM ON 25.9.2026, on the owner's son's *"digital
     and normal peepholes arent compatable with a window"* — which brought the
     viewer under the same rule: a fitting never costs the glass. Before today a
     tap on the greyed viewer removed the WINDOW; now the window stays, so
     `repair` would set the viewer and take it straight back off, and the toast
     would read *"we removed the peephole"* to somebody who had just tried to
     add one. Saying the tile's own reason is both shorter and true.
     ⚠ THE פעמון IS DELIBERATELY NOT IN THIS LIST. Nothing he has said reaches
     the bell, so a bell tap still drops the glass and still goes through
     `repair`, which is why that branch in `js/rules.js` had to keep asking
     about both fittings together rather than becoming two. */
  if ((g.key === 'handle' || g.key === 'lockset' || g.key === 'peephole')
      && id !== state[g.key]) {
    const why = conflicts(state)[g.key][id];
    if (why) {
      if (g.key === 'lockset') openClash(); else toast(why);
      return;
    }
  }
  /* `said` comes back from the repair itself, one sentence per change, because
     the branch that made the change is the only place that knows why it did.
     It used to be looked up afterwards from the group name, which is right
     only while a group has one reason to move. */
  const want = { ...state, [g.key]: id };

  /* ⚠ GIVE BACK WHAT THIS FIELD TOOK AWAY, BEFORE ASKING THE RULES. See
     `displaced`. Everything this group displaced earlier is offered back, but
     only where the field still holds the value the repair left it at — a
     customer who has since chosen a face on purpose keeps it. The proposal
     then goes through `repair` like any other and is kept only if it survives,
     so nothing here can build a door the rules refuse. */
  const memo = displaced.get(g.key);
  const back = [];
  if (memo) {
    for (const [k, m] of Object.entries(memo)) {
      if (state[k] === m.became && want[k] === m.became) { want[k] = m.was; back.push(k); }
    }
  }

  const { state: fixed, said } = repair(want, g.key);

  /* Only the ones that actually stood. A restored value the rules moved again
     is not something to tell the customer about — they never asked for it. */
  const stood = back.filter(k => fixed[k] === memo[k].was);
  for (const k of stood) delete memo[k];

  /* ⚠ RECORDED BY DIFFING THE STATE, NOT FROM `changed`, AND THAT WAS A REAL
     BUG BEFORE IT WAS A DESIGN. `changed` is the ANNOUNCEMENT vocabulary — it
     carries `'stripes'` for a change that actually moves `stripeDir` and
     `stripeCount`, and `'glazing'` for one that moves `window`. Used as state
     keys it silently records `{ was: undefined, became: undefined }` and
     restores nothing, which is exactly what the stripes did when this was
     first wired: a face chosen over line work took it away and going back
     never gave it back. Caught by driving the page rather than by reading it.
     So the record is a diff of the STATE, which is the vocabulary the restore
     has to speak. Objects are skipped — `grip` is a position and two of them
     are never `===` — and the field the customer touched is skipped because
     they chose that. */
  for (const k of Object.keys(fixed)) {
    if (k === g.key || stood.includes(k)) continue;
    if (typeof fixed[k] === 'object' || typeof state[k] === 'object') continue;
    if (state[k] === fixed[k]) continue;
    if (!displaced.has(g.key)) displaced.set(g.key, {});
    displaced.get(g.key)[k] = { was: state[k], became: fixed[k] };
  }
  set(fixed);
  if (stood.length) said.unshift(T('fix.back'));
  /* ⚠ EVERY SENTENCE, NOT `said[0]` — AND `said[0]` WAS NOT "THE MAIN ONE".
     It is whichever repair `repair()` happens to run FIRST, and that order is
     fixed by geometry (glazing before line work, no-glass-no-grille last), not
     by what a customer would care about. Measured over 1,449 taps from every
     face x window: 274 change more than one thing, and on 23 of them the
     UNSPOKEN half is worth ₪3,800–4,200. The worst is a door carrying the
     ₪4,200 צוהר אנכי: tap the three-panel face and the toast says we removed
     the PULL HANDLE, while the window and its ironwork go without a word.
     ⚠ The one-sentence rule was itself a fix, for a real fault — "₪1,540 off a
     door in four repairs, with four toasts overwriting each other" (see UNDO
     below). Four toasts overwriting each other is cured by ONE toast, which is
     what this is; it was never cured by one SENTENCE, and nothing measured the
     difference until now. `showNotice` twenty lines down has joined them with
     ' · ' for a shared LINK all along, so the same repair has been explained
     two ways: in full to somebody opening a link, and a third of the way to
     the customer at the moment they are choosing. */
  toast(said.join(' · '));
}

/**
 * ── UNDO ──────────────────────────────────────────────────────────────
 *
 * Asked for from outside, in three words: *"add an undo button."*
 *
 * A stack of previous states, and `set` pushes onto it. It is worth being
 * exact about WHY a stack rather than a single "previous", because the obvious
 * one-step version is wrong here in a way that only shows up in use: `repair`
 * can change three axes from one tap — choose a window and the panel goes, the
 * ironwork goes with it and the handle moves for the moulding — so a customer
 * who taps twice and regrets both taps needs two undos, not one. Reported
 * defects of exactly that shape are all over §0b: a tap that quietly took
 * ₪1,540 off a door in four repairs, with four toasts overwriting each other.
 *
 * ⚠ IT STORES WHOLE STATES, NOT EDITS. A design is eight strings and a grip
 * position — smaller than the toast text — so an inverse-operation log would
 * be code that can disagree with `repair` for no saving whatever. CLAUDE.md §5
 * is a list of what happens when one quantity is computed twice; an undo built
 * out of inverses is that, for the whole state.
 *
 * ⚠ AND `undo()` GOES THROUGH `set`, so the URL, the price, the code and the
 * drawing all follow the way they do for any other change. An undo that
 * restored the drawing and left the link on the previous door would be the
 * silent-data-loss failure CLAUDE.md §0 calls the worst this site can produce.
 *
 * The cap is generous and exists only so a long session cannot grow the array
 * without bound; nobody is expected to reach it.
 */
const HISTORY_MAX = 100;
const history_ = [];

/**
 * AND FORWARD AGAIN. Asked for from outside: *"i wanna see the reverse last
 * change button at all times... and also add a forward button."*
 *
 * ⚠ THE REDO STACK IS CLEARED BY ANY NEW CHANGE, and that is not a detail.
 * Undo three steps, then pick a different colour, and the three doors you
 * walked back through are no longer on any path forward — keeping them would
 * offer a "redo" that jumps to a door built from choices the customer has
 * since replaced. Every editor works this way and the reason is the same.
 * Cleared in `set`, which is the one place a new change happens.
 */
const future_ = [];

/** Is there anything to go back to, or forward to? Read by `armUndo`. */
const canUndo = () => history_.length > 0;
const canRedo = () => future_.length > 0;

/**
 * WHAT CAME BACK, IN THE DOOR'S OWN WORDS.
 *
 * ⚠ AN UNDO RESTORES A WHOLE STATE, SO IT REVERSES EXACTLY THE MULTI-FIELD
 * TAPS §0b's 9.9 ENTRY MEASURED IN THE FORWARD DIRECTION — and until 13.9 it
 * said one fixed sentence whatever it had done. Measured over 250 taps that
 * change the door, from four starting doors: **56 of them (22.4%) change more
 * than one spec row**, up to four at once, and the worst puts **₪4,500** back
 * across three (choosing an etched glass off a square-window door takes the
 * window, the ironwork and the face with it). So a customer standing on the
 * glass step pressed undo, ₪2,200 came off the door, and the page said *"the
 * last step was cancelled"*.
 *
 * ⚠ AND THE ANSWER IN FRONT OF THEM NEVER MOVES, which is what makes the
 * silence expensive rather than merely terse. Measured by walking forward with
 * the button and pressing undo at 320x568, 390x844 and 1440x900: on **every**
 * press, the checked option on the step the customer is standing on is
 * unchanged — undo reverses the most recent choice, which was made on the step
 * they have just left, so the tile that moved is on another screen. The
 * drawing does change; whether they notice depends on whether the field was a
 * window or a 30 mm viewer.
 *
 * This is `choose()`'s own finding one control over, and `choose()` already
 * carries the fix: it joins every sentence with ' · ' rather than showing the
 * first. The forward tap names everything it did and the backward press named
 * nothing.
 *
 * ⚠ IT READS `specRows`, WHICH IS THE ONE DESCRIPTION OF A DOOR. Assembling a
 * second account here — a map of field names to labels — is the shape §5 is a
 * list of, and this file has paid for it once already (`BREAKDOWN_KEY`, a
 * hand-kept map beside a derived list, printed a row called `bell`). A field
 * added to the catalogue gets named here by having a spec row, which it must
 * have anyway for the ORDER to carry it.
 *
 * ⚠ Rows that changed, phrased as the door being MOVED TO, because that is
 * what the customer now has. And the fallback stays the bare sentence: the
 * grip's POSITION is deliberately not a spec row (it is settled on site, not a
 * specification), so undoing a drag legitimately changes no row — and a drag
 * is the one gesture whose result is unmistakable on the drawing.
 *
 * ⚠ AND IT WALKS BOTH DIRECTIONS, WHICH THE FIRST VERSION OF THIS DID NOT —
 * caught by measuring it rather than by reading it. `specRows` OMITS a row
 * whose option is "none", so a row appears and disappears with the feature:
 * the default door has eight rows and a loud one eleven. Filtering over the
 * rows of the door being moved TO therefore named every feature an undo
 * brought BACK and not one it took AWAY — and taking away is what an undo
 * mostly does. Measured on the live page: undoing the ₪300 פעמון moved the
 * price and printed the bare sentence, which is the exact fault this was
 * written to fix, surviving inside the fix. §5.22's rule one level down — a
 * derivation that only ever looks for presence cannot tell presence from
 * absence. The keys are the UNION now, and a row that has gone says so.
 */
function restored(from, to) {
  const was = specRows(from), now = specRows(to);
  const key = new Map(now.map(r => [r.key, r]));
  const out = [];
  for (const k of new Set([...was.map(r => r.key), ...now.map(r => r.key)])) {
    const a = was.find(r => r.key === k), b = key.get(k);
    if ((a && a.value) === (b && b.value)) continue;
    /* The label comes from whichever side HAS the row; only one can be gone. */
    out.push(`${(b || a).label}: ${b ? b.value : T('undo.gone')}`);
  }
  return out;
}

/** `undo.done` / `redo.done` plus what actually came back. */
const stepSaid = (lead, from, to) => {
  const rows = restored(from, to);
  return rows.length ? `${T(lead)} · ${rows.join(' · ')}` : T(lead);
};

function undo() {
  const prev = history_.pop();
  if (!prev) return;
  /* ⚠ NOT `set`, WHICH WOULD PUSH THIS ONTO THE STACK AND UNDO NOTHING. Going
     back is not a change to record; it is the removal of one. Straight to the
     same three things `set` does, minus the push. */
  const said = stepSaid('undo.done', state, prev);
  future_.push(state);
  state = prev;
  guard(paint)();
  scheduleUrl();
  toast(said);
}

function redo() {
  const next = future_.pop();
  if (!next) return;
  /* Symmetrical with `undo`: the door we are leaving goes onto the BACK stack
     so the two buttons stay each other's inverse however often they are
     pressed. Not through `set`, for the same reason — `set` would clear the
     future we are walking through. And it says what came back for the same
     reason too: a forward press that names nothing is the same silence read
     the other way round. */
  const said = stepSaid('redo.done', state, next);
  history_.push(state);
  state = next;
  guard(paint)();
  scheduleUrl();
  toast(said);
}

/** The URL write, debounced — shared by `set` and `undo`. It was inline in
    `set`, and `undo` needs the identical behaviour: a step back that did not
    rewrite the address would leave the link describing the door the customer
    just cancelled. */
let urlTimer = null;
function scheduleUrl() {
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    try {
      history.replaceState(null, '', toQuery(state));
    } catch { /* history is a nicety, never a dependency */ }
  }, 300);
}

/**
 * ⚠ WHAT THE CUSTOMER JUST CHANGED — the ONE thing that makes the drawing's
 * motion possible without a second render path.
 *
 * `render(state)` is pure and `paint()` swaps `#stage`'s innerHTML, so EVERY
 * element in the drawing is new on every change. A CSS entry animation keyed
 * off the markup alone would therefore re-animate the panel, the window, the
 * bar and the lock furniture every time somebody nudged the colour — which is
 * noise, not motion.
 *
 * The obvious repair is to diff the old drawing against the new one, and that
 * is exactly what must not happen: it means `render` knowing what the previous
 * state was, which is a second way of producing the drawing standing beside
 * the first. That argument killed the 3D renderer (`REDESIGN.md` §3.3) and the
 * incremental repaint (`CLAUDE.md` §9), and it is not weaker here.
 *
 * But `app.js` already knows what changed — it is holding the old state and
 * the new one. So it stamps the STAGE with the field that moved, for one
 * frame, and the stylesheet animates only the parts that field owns. No
 * diffing, no second render, and `render(state)` stays byte-identical for one
 * state, which a test asserts.
 */
function stampChange(before, after) {
  const stage = $('#stage');
  if (!stage) return;
  const moved = Object.keys(after).find(k => before[k] !== after[k]
    /* `grip` is an object; a drag changes it constantly and has its own
       feedback already. Comparing it by identity here would stamp on every
       pointer move. */
    && k !== 'grip');
  stage.removeAttribute('data-changed');
  if (!moved) return;
  /* Force a reflow so the attribute counts as newly set even when the same
     field changes twice running — otherwise a second tap on the colour row
     re-uses the old attribute value and the animation does not restart. */
  void stage.offsetWidth;
  stage.setAttribute('data-changed', moved);
}

function set(next) {
  const before = state;
  /* ⚠ ONLY WHEN SOMETHING ACTUALLY MOVED. `set` is called on every repaint
     path, including ones that hand back the state they were given — arriving
     at a size that repairs to itself, or a drag that lands the grip exactly
     where it already was. Pushing those would fill the stack with steps that
     undo nothing, and the button would need three presses to do one thing. */
  if (JSON.stringify(next) !== JSON.stringify(state)) {
    /* ⚠ A NEW CHANGE ENDS THE FUTURE — see the note over `future_`. */
    future_.length = 0;
    history_.push(state);
    if (history_.length > HISTORY_MAX) history_.shift();
  }
  state = next;
  stampChange(before, next);
  /* `guard` — see the bottom of this file. A throw out of `paint()` mid-click
     is the same defect one click in: `render()` throws BEFORE the `innerHTML`
     assignment, so the stage keeps the PREVIOUS door while the price, the code
     and the WhatsApp link beside it all describe the new one. A page showing
     one door and offering another is worse than the blank page it replaces. */
  guard(paint)();

  // Debounced: WebKit throws above ~100 history writes per 30s, and clicking
  // through swatches reaches that easily (PLAN.md §8.2).
  scheduleUrl();
}

/**
 * Arrow-key navigation with roving tabindex, per PLAN.md §14.
 *
 * ⚠ ARROWS MOVE FOCUS. THEY DO NOT CHOOSE. This used to call `act` on every
 * arrow — selection-follows-focus, which ARIA does allow, but only for a
 * listbox whose options are independent. Ours are not: `choose` runs `repair`,
 * and `repair` reaches across axes. Measured on a broad-window ironwork door,
 * simply BROWSING the face-design list with the arrow keys:
 *
 *   plain → panel → groove   removed the window and its ironwork, ₪1,540
 *   …and arrowing back to `plain` did not bring either of them back.
 *
 * Four repair toasts fired and overwrote each other, so nothing on screen said
 * what had happened. A keyboard user cannot look at a list without destroying
 * work, which the mouse user beside them can do freely. Space and Enter choose
 * — the WAI-ARIA manual-selection pattern, which exists for exactly this.
 *
 * `tools/audit.mjs` asserted the old behaviour ("selection follows focus … so
 * the DOOR has to change"). That assertion is restated there, not deleted:
 * Enter on a focused option still has to change the door.
 */
function keyboardGrid(wrap) {
  wrap.addEventListener('keydown', e => {
    const items = [...wrap.querySelectorAll('[role="radio"]')];
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;

    /* Space and Enter are not handled here on purpose: these are real
       `<button>` elements, so the browser turns both into a click and the
       click listener chooses. One path, the same one the mouse uses. */
    const cols = columnCount(wrap, items);
    let next = null;
    if (e.key === 'ArrowRight') next = i - 1;      // RTL: right is "previous"
    else if (e.key === 'ArrowLeft') next = i + 1;
    else if (e.key === 'ArrowDown') next = i + cols;
    else if (e.key === 'ArrowUp') next = i - cols;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;

    e.preventDefault();
    next = Math.max(0, Math.min(items.length - 1, next));
    items[next].focus();
  });
}

function columnCount(wrap, items) {
  if (items.length < 2) return 1;
  const top = items[0].getBoundingClientRect().top;
  const n = items.findIndex(el => el.getBoundingClientRect().top > top + 1);
  return n === -1 ? items.length : n;
}

// ── render ────────────────────────────────────────────────────────

/** What a closed category shows: the choice that has been made in it. */
function nowLabel(g) {
  const list = g.list();
  const hit = list.find(o => o.id === state[g.key]) || list[0];
  return hit ? L(hit) : '';
}

/**
 * What a closed SECTION shows: the choices inside it, joined.
 *
 * Not a count and not "4 options" — the point of a closed section is that the
 * customer can see what it currently says without opening it, or the fold has
 * hidden the answer along with the question. Defaults are included: "no pull
 * handle" is a decision the door carries, and leaving it out would make the
 * section read as unanswered.
 */
function sectionLabel(sec) {
  return groupsIn(sec.key).map(nowLabel).filter(Boolean).join(' · ');
}

function paint() {
  const colour = byId(COLOURS, state.colour);
  const handing = byId(HANDINGS, state.handing);
  const size = SIZES[state.size] || SIZES.standard;

  $('#stage').innerHTML = render(state);
  /* ⚠ THE ROOM DOES NOT CHANGE COLOUR WITH THE DOOR ANY MORE.
     There was a line here copying the drawing's `data-light` onto `.layout`,
     and a rule in app.css — `.layout[data-light="true"] { --wall: #E4E0D7;
     --floor: #D6D2C8 }` — that sank the wall and the floor a shade behind a
     pale door so it would not vanish into them.
     Reported from outside: *"there are some colors that the surrounding
     changes color. the backround and the things around the door needs no
     change no matter what."* And they are right, for a reason worth writing
     down: this is a configurator, and the ONE thing a customer is doing on
     this screen is comparing colours. A ground that moves under the swatch
     makes every comparison a lie — cream against a light wall and cream
     against a darkened wall are two different colours to the eye, and neither
     is the colour of the door. The room has to be a constant for the same
     reason a paint shop paints its walls grey.
     What was being solved is real: a white door on a white wall has no
     silhouette. That is answered where it belongs, in the drawing — the frame
     is painted, the reveal ramps in black at falling alpha, and the casing
     throws a shadow onto the plaster. Those work on any colour, because they
     describe the object rather than the backdrop.
     `data-light` is STILL EMITTED on the svg. The drawing itself reads it for
     the moulding's light, and the attribute is a fact about the paint. It is
     the copy onto the page's chrome that is gone. */
  fitStage();

  /* Written to EVERY element that claims to show it, not to one id. There are
     two now — the card in the send panel and the dock pinned to the foot of a
     phone — and two elements each fetching their own copy of a number is the
     shape CLAUDE.md §5 is about. One statement, however many places show it. */
  const money = formatAgorot(priceAgorot(state));
  document.querySelectorAll('[data-price]').forEach(el => { el.textContent = money; });
  renderBreakdown(state);

  /* ⚠ THE HANDING SENTENCE USED TO BE WRITTEN HERE TOO, over every
     `[data-handing-words]`, for the summary's confirmation card. The card went
     on 25.9.2026 at the owner's request and nothing on the page carries that
     attribute any more, so the loop went with it rather than staying as a
     no-op somebody would later feed. `handingWords()` still writes the
     WhatsApp order and the A4 sheet, which are where Peretz reads it, and the
     summary states the same fact through its spec table's פתיחה row. */

  /* ⚠ EVERY GROUP, FROM THE REAL ARITHMETIC. This loop used to run over the
     grille group alone, under a comment ending "Only the grille group needs
     it: nothing else in `GROUPS` is priced by a count." True, and beside the
     point — nothing else is PRICED by a count, but the window and the size are
     what CHANGE the count, so their tiles were the ones lying:

       sidelight + ironwork, the חלון מלבני tile printed  +₪620
       the price then moved                               ₪1,240

     748 tiles across the buildable space printed a surcharge that did not
     match the move. The old loop also floored the pane count at 1, so on an
     unglazed דלת וחצי the iron tile printed ₪620 for a click that costs
     ₪1,240 — the boolean this whole change removed, put back one screen over.

     A tile now answers the question the customer is actually asking, which is
     not "what is this option's list price" but "what happens to my total if I
     tap this". `repair` is included because tapping runs it: choose ironwork
     on a door with no glass and it fits a window, and that window is part of
     the bill. One arithmetic, one place, no group knowing anything special
     about panes. */
  /* The navigator marks what is OPEN, which is a fact about the page rather
     than about the door — so it is refreshed wherever the fold changes, not
     only here. `aria-current` rather than a class alone: a screen reader
     should be told which of the four it is looking at. */
  markSteps();

  repriceOptions(state);
  $('#code').textContent = encodeCode(state);

  const win = byId(WINDOWS, state.window);
  const grille = byId(GRILLES, state.grille);
  /* ⚠ THE ROWS, from `js/spec.js`. This list was assembled here, and in
     `share.js`, and in `describe()`, and the three disagreed — which is how a
     customer came to proof-read a line with no ironwork on it and send an
     order charging ₪620 for some. One statement, however many places show it,
     exactly as the price is. */
  $('#summary').textContent = summaryLine(state);

  /* ── THE SPEC TABLE ──────────────────────────────────────────────
     The mockup's best idea, and it costs almost nothing here because the rows
     already exist: this is `specRows(state)` with a different renderer, not a
     fifth description of the door. Label on the right, value on the left, and
     a swatch where the row carries one.
     `#summary` above stays and is not redundant — it is the same rows as ONE
     line, which is what a 320 px phone has room for, and it is what
     `npm run audit` compares against `summaryLine` to prove the page has not
     drifted off `js/spec.js`. The table is the desktop's version of it. */
  const table = $('#spec');
  if (table) {
    /* ⚠ EVERY ROW IS A BUTTON BACK TO THE STEP THAT OWNS IT — 14.9.2026.
       Asked for from outside: the summary lists every answer, and a customer
       reading it who wants to change one had to find the step themselves.
       The row already knows which answer it is; `stepFor` knows which question
       asked it.
       A real `<button>`, not a `<div>` with a listener: it is in the tab order,
       it takes Enter and Space, and a screen reader says "button" rather than
       reading a row of text nobody has said is interactive. The grid is
       unchanged — `display: grid` is set on `.spec__row` and a button takes it
       as happily as a div — so the four columns still line up.
       `aria-label` carries "label: value" because the visible text is split
       across two spans and a swatch, which a screen reader would otherwise
       read as three fragments with no relation. */
    table.replaceChildren(...specRows(state).map(r => {
      const step = stepFor(r.key);
      const row = document.createElement(step ? 'button' : 'div');
      row.className = 'spec__row';
      row.dataset.key = r.key;
      if (step) {
        row.type = 'button';
        row.dataset.step = step;
        row.setAttribute('aria-label', `${r.label}: ${r.value}`);
        row.addEventListener('click', () => goStep(step));
      }
      row.innerHTML = specIcon(r.key)
        + `<span class="spec__label">${r.label}</span>`
        + `<span class="spec__value">${r.value}</span>`
        + (r.hex ? `<span class="spec__chip" style="--chip:${r.hex}"></span>` : '');
      return row;
    }));
  }

  /* ⚠ NO MORE `[data-now]` OR `[data-sect-now]`. Those were the value printed
     ON a closed fold — "אפור אנתרציט · חלק" beside a shut heading — so the
     customer could see what was inside without opening it. Nothing is shut
     now, so the value is simply on screen, and repeating it above the controls
     that show it would be the duplication this file keeps paying for.
     `nowLabel` and `sectionLabel` survive because the NAVIGATOR could use them
     one day and because `npm run audit` compares the page's one-line summary
     against `summaryLine(state)` — but nothing paints them here. */
  const blocked = conflicts(state);
  for (const g of GROUPS) markGroup(g, blocked[g.key] || {});
  /* The stripe controls are rebuilt rather than repainted: they are three
     controls whose SHAPE depends on the state (the tight toggle exists only
     on the horizontal axis, the stepper's ceiling moves with it), not four
     tiles whose selected-ness does. */
  const faceOpts = document.querySelector('.field[data-group="detail"] .field__opts');
  if (faceOpts) buildStripes(faceOpts);
  const gripOpts = document.querySelector('.field[data-group="handle"] .field__opts');
  if (gripOpts) buildLengthStepper(gripOpts);

  const wa = whatsappUrl(state, engaged);
  document.querySelectorAll('[data-wa]').forEach(el => { el.href = wa; });
  /* ⚠ THE LABEL AND THE HREF CHANGE TOGETHER, and this is the line that makes
     that true. The buttons rest on "שלחו לנו הודעה" over the fallback message;
     the moment they point at a real door, they may say so. Set here rather
     than at boot: what licenses the sentence is the href on the line above,
     not the fact that a script ran. */
  document.documentElement.classList.add('is-live');
  /* ⚠ AND A THIRD STATE, ON THE SAME LINE OF REASONING AS THE SECOND.
     `is-live` licenses "send the door" because the href now points at one.
     `is-untouched` withdraws that licence again while the door is still the
     one the page opened with: both sends ask a question instead, and
     `message()` opens with a question to match. The label and the text are
     one decision and they are set from one predicate — `isUntouched`, which
     is derived from `DEFAULTS` rather than from a hand-kept list of fields,
     so a tenth choice cannot leave it calling a configured door untouched. */
  document.documentElement.classList.toggle('is-untouched', isUntouched(state) && !engaged);
  announce(describe(state));
  /* ⚠ ALWAYS ON THE PAGE NOW, AND `disabled` RATHER THAN HIDDEN. Asked for
     from outside: *"i wanna see the reverse last change button at all times."*
     It used to appear only once there was a step to take back, which is the
     behaviour that hides a control exactly while somebody is learning the page
     exists to be experimented with — you find out you can go back only after
     you have already done something you regret.
     `disabled` is right here where `aria-disabled` is right on an option tile:
     an option that refuses says WHY and stays clickable, because the reason is
     the useful part. "Nothing to undo yet" has no reason to give.
     ⚠ The box is kept either way — that was already true through `is-off` and
     matters more now that there are two: the strip under the door must not
     change height, or the door is redrawn smaller. `npm run audit` measured
     that at 23,021 pixels. */
  $('#undo-btn').disabled = !canUndo();
  $('#redo-btn').disabled = !canRedo();
}

/* ── the handle does not move ─────────────────────────────────────
 *
 * ⚠ ABOUT 240 LINES CAME OUT HERE ON 18.9.2026, and this note is what is left
 * of them so nobody rebuilds it by accident.
 *
 * The grip used to be the one object on the stage a customer could touch. It
 * dragged under the pointer with a `transform` rather than a re-render (a full
 * `render()` per pointermove is a few hundred nodes replaced sixty times a
 * second, which on a phone is what the drag felt like); it went red where it
 * could not be built and snapped on release; it took arrow keys at 10 mm and
 * 50; it had a 44 px touch pad grown through the SVG's own screen matrix, a
 * separate focus ring so the outline did not trace the pad, a non-passive
 * touch swallow so Chrome would not steal the gesture as a scroll, and
 * `pointercancel` wired to ABANDON rather than to commit — which was itself a
 * bug fixed from a report, because a mobile browser fires cancel the moment it
 * decides a gesture is a scroll.
 *
 * All of it worked. The owner's objection was not that it was broken:
 * *"i dont really like the part where you can move the pull handle, it just
 * makes it more complicated for the customer, so that part needs to be
 * redone."* A configurator's job is to ask a customer questions they can
 * answer, and where to drill a standoff is not one of them — Peretz sets it on
 * site, which is what the hint under the door used to say in as many words.
 *
 * What replaces it is `gripHome`: one position per design, computed from the
 * state, identical from a tap, a link and a code. The three controls in the
 * wall are gone from `index.html`, `state.grip` is gone from the state, `gp=`
 * is retired in `url-state.js`, and `repair` no longer walks a stale position
 * to the nearest buildable one because there is no longer a stale position.
 */


/**
 * Tick what is chosen, and mark what cannot be — in one pass, from the one
 * rules table.
 *
 * Blocked options are `aria-disabled`, never `disabled`: still focusable,
 * still clickable, and they say why. `disabled` is unreachable by keyboard
 * and silent to touch, which turns "you cannot have this" into "nothing
 * happened".
 */
function markGroup(g, blocked) {
  if (g.kind === 'mashkof') return markMashkof(g);
  const chosen = [state[g.key]];

  /* ⚠ A LISTING RULE BELONGS HERE, LIVE, AND NOT IN `list()` — and there is no
     longer one to apply. The face group had the only one: a filter inside
     `list()` is read when the tiles are BUILT and so freezes at the state the
     page booted in, which is the 8.9.2026 fault the long note over that group
     records. It was moved here, asked on every paint, and on 14.9.2026 the two
     faces it hid left the catalogue, so the predicate and this loop's `hidden`
     clause go with them: every option in every group is shown, and what a
     customer cannot have is marked `aria-disabled` below rather than removed.
     If a rule about what is SHOWN is ever wanted again it goes in this
     function — three lines building a Set of permitted ids off `g.list()` —
     and it never goes in `list()`. */

  let anyBlocked = false;
  document.querySelectorAll(`.field[data-group="${g.key}"] [role="radio"]`).forEach(el => {
    const id = el.dataset.id;
    const on = chosen.includes(id);
    el.setAttribute('aria-checked', String(on));
    el.tabIndex = on || (!chosen.length && el === el.parentElement.firstElementChild) ? 0 : -1;
    el.classList.toggle('is-selected', on);

    const why = blocked[id];
    anyBlocked = anyBlocked || !!why;
    el.setAttribute('aria-disabled', String(!!why));
    el.classList.toggle('is-blocked', !!why);
    const slot = el.querySelector('.tile__why');
    if (slot) { slot.hidden = !why; slot.textContent = why || ''; }
  });

  const note = $(`.field[data-group="${g.key}"] [data-note]`);
  if (note) {
    const first = Object.values(blocked)[0];
    note.hidden = !anyBlocked;
    note.textContent = anyBlocked ? first : '';
  }
}

/**
 * Let the room reach the edges of the stage.
 *
 * The renderer draws the door in a box that stops just outside the frame, and
 * paints wall and floor far beyond it. Fitted the ordinary way that box gets
 * letterboxed and the door reads as a picture of a door hung on the page. So
 * the viewBox is widened here to exactly the stage's shape, centred on the
 * same point: the door does not move or change size by a pixel — `meet` would
 * have chosen this same scale — but the crop now falls on wall and floor
 * instead of on nothing.
 */

/**
 * ── THE PHOTOGRAPHED ROOM, IN TWO CROPS ───────────────────────────────────
 *
 * The owner supplied the same entrance framed 3:4 and 16:9, and both ship.
 * Every number here is a FRACTION of the original, measured in
 * `tools/_bd2.mjs`, so re-encoding or re-scaling a file cannot invalidate one.
 * `npm run backdrop` produces the files; this table describes them, and
 * `pickRoom` below chooses between them by measuring rather than by a
 * breakpoint.
 *
 *   floor    the wall/floor junction, down from the top. Found as the
 *            strongest horizontal luminance step across the centre half:
 *            tilt -0.21° / -0.224°, residual 1.2 / 1.3 px. That is what
 *            "square-on" looks like as a number.
 *   aspect   width / height of the original.
 *   lampCx   the right-hand sconce's centre, out from the picture's centre.
 *   lampTop
 *   lampBot  the sconce body's head and foot, down from the top.
 *
 * ⚠ `lampCx`/`lampBot` EXIST BECAUSE THE PRICE HANGS UNDER A LAMP, and
 * `lampTop` exists because the first version of this did not have it. A
 * control placed against a feature of the room has to be placed against the
 * room that is actually on screen — and the room has to actually be on screen.
 *
 * ⚠ **THE PORTRAIT ALONE WAS WRONG AND IT SHIPPED.** Its 0.75 aspect is
 * narrower than every stage crop, so `cover` scales it by WIDTH — which is
 * what holds its sconces at a constant 10% and 90% of the stage on a phone,
 * and is exactly what ruins it on a wide desktop: covering a 1.95 stage makes
 * a 783 px hole out of a 2053 px picture and everything above the pinned floor
 * line climbs out of the top. Reported from outside off a 1920×918 laptop —
 * *the room has no lamps* — and measured: the sconce band sat at y −173 to
 * −52. Half-cut from 1680 up. The check that let it through tested the
 * sconces' HORIZONTAL position only.
 */
const ROOMS = [
  { id: 'tall', el: 'room-src',
    floor: 1214.5 / 1448, aspect: 1086 / 1448,
    lampCx: 450 / 1086, lampTop: 573 / 1448, lampBot: 659 / 1448 },
  { id: 'wide', el: 'room-wide-src',
    floor: 827.4 / 941, aspect: 1672 / 941,
    lampCx: 452.5 / 1672, lampTop: 326 / 941, lampBot: 402 / 941 },
];

/**
 * Where a room lands on a given stage: covering it, with its own floor line on
 * the line the door stands on.
 *
 * Three lower bounds on the height and the largest wins — tall enough that the
 * top edge reaches y=0 with the floor pinned, tall enough that the bottom edge
 * reaches the foot, wide enough to reach both sides. Solved every re-fit
 * rather than written as a `background-size` keyword, because `cover` scales
 * about the CENTRE and this has to scale about the floor line.
 */
function placeRoom(room, boxW, boxH, yBase) {
  const h = Math.max(yBase / room.floor,
                     (boxH - yBase) / (1 - room.floor),
                     boxW / room.aspect);
  const w = h * room.aspect;
  const top = yBase - room.floor * h;
  return { room, w, h, top,
           lampX: boxW / 2 + room.lampCx * w,
           lampTop: top + room.lampTop * h,
           lampBot: top + room.lampBot * h };
}

/**
 * ⚠ WHICH ROOM, DECIDED BY MEASURING BOTH — NOT BY A BREAKPOINT.
 *
 * A media query would be a second statement of a fact this function already
 * computes, in a language that cannot see the stage; that is CLAUDE.md §5.10
 * and it is how the wide-screen fault got in. So: place both, and take one
 * whose sconces are wholly inside the stage with a little room to spare.
 *
 * The portrait is preferred when both qualify — it is the phone's room, and
 * nearly every visitor arrives on a phone (§0). If NEITHER qualifies (a phone
 * held sideways makes the stage 3.7 wide, and no crop of this room survives
 * that) the one whose lamps are least far out wins, so the answer degrades
 * instead of flipping to nonsense.
 */
function pickRoom(boxW, boxH, yBase) {
  const MARGIN = 6;                       // px of lamp that must be showing
  const scored = ROOMS.map(r => {
    const p = placeRoom(r, boxW, boxH, yBase);
    /* How far outside the stage the sconce is, on whichever edge is worst.
       ⚠ EVERY TERM IS IN STAGE PIXELS AND COMES OFF `p`, NOT OFF `p.room`.
       The first version asked `p.lampCx` — a FRACTION, and a field of the room
       rather than of the placement — so the horizontal term was `undefined`,
       the whole expression was NaN, `NaN <= 0` was false for both rooms, and
       the sort left them in declaration order: it silently returned the
       portrait at every size, which is the bug it was written to fix, wearing
       the fix's own clothes. `lampX` is the same quantity already resolved to
       pixels, and half the lamp's own width is 2% of the picture. */
    const half = p.w * 0.02;
    /* ⚠ AND IT NEEDS ITS OWN HEIGHT OF WALL ABOVE IT, not merely a positive
       coordinate. Measured at 1280x720 with the portrait: the sconces landed
       at y 19..90 of a 585 px stage — in frame by every arithmetic test and
       reading, to an eye, as two fittings jammed under a ceiling. A wall light
       with less wall above it than the light is tall looks cropped whether or
       not it is, so that is the test: one lamp-height of plaster over it. */
    const lampH = p.lampBot - p.lampTop;
    const off = Math.max(0,
      lampH - p.lampTop,                          // too close to the top, or off it
      p.lampBot - (boxH - MARGIN),                // off the bottom
      (p.lampX + half) - (boxW - MARGIN),         // off the near edge
      MARGIN - ((boxW - p.lampX) - half));        // off the far edge
    return { ...p, off };
  });
  /* ⚠ AND A NaN CANNOT PASS FOR AN ANSWER. `Math.max` swallows one without a
     word and every comparison against it is false, which is how the mistake
     above produced a plausible wrong room instead of a failure. A room whose
     score is not a number is not a candidate. */
  const usable = scored.filter(s => Number.isFinite(s.off));
  if (!usable.length) return ROOMS[0];
  return (usable.find(s => s.off <= 0)
          || usable.slice().sort((a, b) => a.off - b.off)[0]).room;
}

/**
 * Swap the drawn room for the photograph, once, if and only if the file
 * actually arrives.
 *
 * ⚠ THE ORDER HERE IS THE FALLBACK. `.is-photo` is added in the image's own
 * `load` handler and nowhere else, so a missing file, a blocked request, a
 * corrupt asset or a browser that cannot decode WebP all land in exactly one
 * place: the class is never added, the SVG's `#backdrop` is never hidden, and
 * the visitor gets the drawn room — which is the page as it shipped
 * yesterday, complete and correct. PHOTOREAL.md §1: the page can never look
 * broken. There is no `onerror` branch because there is nothing to do in it.
 *
 * ⚠ NOT IN BARE MODE, AND NOT ON THE SHEET. `?bare=1` is what `recreate`,
 * `corpus`, `against`, `profile` and `collide` photograph, and the whole
 * architecture of this feature is that those keep reading a pure drawing;
 * `?sheet=1` is an A4 document Peretz prints, where a photograph of somebody
 * else's hallway is not information. Both are checked before the request is
 * made rather than before the class is added, so neither pays for the file.
 *
 * The URLs come from the two `<link>` tags in `index.html` — see the long
 * comment there. `link.href` is already resolved against the document, so this
 * works from `file://` as well as from a server.
 *
 * ⚠ ONE FILE IS FETCHED, NOT TWO. `pickRoom` needs only the constants and the
 * stage's box to choose, so the choice is made before anything is downloaded.
 * `liveRoom` remembers which arrived; `fitStage` re-runs the choice on every
 * re-fit and calls back in here if the answer changed — which is what makes
 * dragging a window across the crossover work rather than leaving the wrong
 * crop stretched over the stage.
 */
let liveRoom = null;

function armRoom() {
  const root = document.documentElement;
  if (root.classList.contains('is-bare') || root.classList.contains('is-sheet')) return;
  const stage = $('#stage');
  const svg = stage && stage.querySelector('svg');
  if (!stage || !svg) return;
  const box = stage.getBoundingClientRect();
  const fy = Number(svg.dataset.fitY), fh = Number(svg.dataset.fitH);
  const fw = Number(svg.dataset.fitW), baseY = Number(svg.dataset.baseY);
  if (!(box.width > 0 && box.height > 0 && fh > 0 && Number.isFinite(baseY))) return;
  const scale = Math.min(box.width / fw, box.height / fh);
  const want = pickRoom(box.width, box.height, (baseY - fy) * scale);
  if (want === liveRoom) return;
  const link = document.getElementById(want.el);
  if (!link || !link.href) return;
  const href = link.href;
  const img = new Image();
  img.addEventListener('load', () => {
    const st = $('#stage');
    if (!st) return;
    st.style.backgroundImage = `url("${href}")`;
    liveRoom = want;
    root.classList.add('is-photo');
    fitStage();                 // the placement needs the class and the room
  });
  img.src = href;
}

function fitStage() {
  /* Bare mode is the measurement harness (tools/frame.mjs, recreate.mjs and
     friends), and a harness wants the drawing's own frame: the door filling
     its box, nothing around it. Those tools measure the leaf, the frame and
     the hardware, none of which the surrounding room touches. */
  if (document.documentElement.classList.contains('is-bare')) return;

  /* ⚠ THERE MAY BE NO STAGE. The sheet route REMOVES `.layout` — see the
     block in `init` — and the stage goes with it, so both this function's
     callers reach it holding nothing: `goStep`, which `init` runs after the
     removal, and the `ResizeObserver` registered before it.

     It threw. Twice, uncaught, on every load of `?sheet=1`, in every language,
     from before this phase — and the comment over the removal says in as many
     words "nothing past this point reads `.layout` in sheet mode", which is
     the claim that was wrong. No instrument said so: the audit drives the
     sheet route but did not listen for `pageerror` on it, so the page threw
     into a silence. Found by opening the sheet to check a translation.

     A document with no stage in it does not need the stage cropped, so this
     is the whole fix. `npm run audit` now fails on an uncaught error there. */
  const stage = $('#stage');
  if (!stage) return;
  const svg = stage.querySelector('svg');
  if (!svg) return;

  /* ⚠ FOUR NUMBERS NOW, AND THE FIRST TWO ARE NEW. `data-fit-*` is the FIXED
     scene — the same rectangle whatever door is drawn — while the SVG's own
     `viewBox` is tight around this particular door. Cropping to the fixed
     scene is the whole of "the room stands still while the door changes size":
     the scale comes out a constant, so a wide door draws wider and a tall one
     taller, instead of everything being rescaled until every door filled the
     stage identically.
     This read `(w - vw) / 2`, which assumed the box began at the origin. That
     was true while there was one box and it started at 0 0. Centring a crop on
     `w / 2` when the rect starts at `x` puts the door off centre by exactly
     `x`, and CLAUDE.md §7 already records a tool bitten by assuming a viewBox
     origin was zero. */
  const fx = Number(svg.dataset.fitX), fy = Number(svg.dataset.fitY);
  const w = Number(svg.dataset.fitW), h = Number(svg.dataset.fitH);
  const box = stage.getBoundingClientRect();
  /* Read once, used three times: by the two lamp clamps below and by
     `--quote-h` at the end. See the note at the clamp. */
  const quoteEl = document.querySelector('.quote');
  const quoteR = quoteEl ? quoteEl.getBoundingClientRect() : null;
  const quoteH = quoteR ? quoteR.height : 0;
  const quoteW = quoteR ? quoteR.width : 0;
  if (!(w > 0 && h > 0 && Number.isFinite(fx) && Number.isFinite(fy)
        && box.width > 0 && box.height > 0)) return;

  const scale = Math.min(box.width / w, box.height / h);
  const vw = box.width / scale, vh = box.height / scale;
  svg.setAttribute('viewBox',
    `${(fx + (w - vw) / 2).toFixed(1)} ${(fy + (h - vh) / 2).toFixed(1)} `
    + `${vw.toFixed(1)} ${vh.toFixed(1)}`);
  /* ── WHERE THE PHOTOGRAPH GOES ────────────────────────────────────
     Two things have to be true at once and neither is negotiable: the
     picture's own wall/floor junction must land on the line the door stands
     on, and the picture must cover the stage — a strip of bare page at one
     edge would be worse than no photograph at all.

     `baseY` is read off the drawing (`data-base-y`), not retyped here: the
     scene is the renderer's to define, and the note over that attribute
     records what a second copy of the number would look like when it went
     wrong. Three lower bounds on the height, and the largest wins:

       yBase / floor            tall enough that the top edge reaches y=0
       (h - yBase) / (1-floor)  tall enough that the bottom edge reaches the foot
       w / aspect               wide enough to reach both sides

     Solved every re-fit rather than written as a background-size keyword,
     because `cover` scales about the CENTRE and this has to scale about the
     floor line. Published as three lengths; the stylesheet owns which
     properties they become. */
  /* ⚠ READ ONCE, HERE, BECAUSE TWO THINGS NEED THE DOOR'S BOX AND ONLY ONE OF
     THEM USED TO ASK. The wall publication at the foot of this function has
     always measured `#frame`; the lamp clamp below now needs the same rect, to
     know how far the price card may be pulled inboard before it stops standing
     on plaster and starts standing on the door. Two `getBoundingClientRect()`
     calls on one element in one pass is the wasted forced reflow the note at
     the clamp already records costing 19 ms — and the "one quantity, two
     measurements" smell CLAUDE.md §5.10 is a list of. */
  const frame = svg.querySelector('#frame');
  const frameR = frame ? frame.getBoundingClientRect() : null;

  const baseY = Number(svg.dataset.baseY);
  /* ⚠ HOW DEEP THE FLOOR IS, published whether or not there is a photograph.
     The strip of ground in front of the threshold is the only part of the
     scene that is not wall, and it is where the trust band stands. Measured
     rather than assumed to be a fraction: it happens to be a constant 5.97% of
     the stage today, because the crop is height-driven at every viewport this
     app has — but "happens to be" is how a number goes wrong the first time
     somebody changes `FIT_TRIM`, and `js/renderer.js` owns that number, not
     the stylesheet. */
  if (Number.isFinite(baseY)) {
    document.documentElement.style.setProperty(
      '--floor-b', `${Math.max(0, Math.round(box.height - (baseY - fy) * scale))}px`);
  }
  if (document.documentElement.classList.contains('is-photo')
      && Number.isFinite(baseY) && liveRoom) {
    const yBase = (baseY - fy) * scale;
    /* ⚠ AND THE CHOICE IS RE-RUN, NOT ASSUMED. A window dragged wider crosses
       from one crop to the other; without this the old one stays stretched
       over the stage and its lamps climb out of the top, which is the fault
       this whole pair exists to fix. `armRoom` returns immediately when the
       answer has not changed, so this costs a comparison. */
    const want = pickRoom(box.width, box.height, yBase);
    if (want !== liveRoom) { armRoom(); return; }

    const p = placeRoom(liveRoom, box.width, box.height, yBase);
    const ss = stage.style;
    ss.setProperty('--photo-w', `${p.w.toFixed(1)}px`);
    ss.setProperty('--photo-h', `${p.h.toFixed(1)}px`);
    ss.setProperty('--photo-y', `${p.top.toFixed(1)}px`);
    /* The pill that hangs under the right-hand lamp now has a different lamp
       to hang under — see the note on ROOMS. Same rects, same re-fit.
       ⚠ AND IT IS CLAMPED INTO THE STAGE. Reported from outside off a
       1920×918 laptop: the price card was sitting ON the language buttons —
       6,288 px² of overlap — and 33 px ABOVE the top of the stage, out on the
       header band. The lamp had climbed out of the frame and the card
       faithfully followed it. A control anchored to a feature of the picture
       must not leave the picture when the feature does: the anchor is held
       inside the stage with room for the card itself, so the worst case is a
       card sitting a little low rather than a card on the chrome. */
    const wrapR = $('.stage-wrap').getBoundingClientRect();
    /* ⚠ THE BAR'S HEIGHT IS READ ONCE PER FIT, NOT TWICE. The clamp needs it
       and so does `--quote-h` at the foot of this function, and asking the
       layout for the same box twice in one pass is both a wasted forced
       reflow and the "one quantity, two measurements" smell §5 is a list of.
       `npm run latency` went 180 -> 219 ms when the second read went in. */
    const lampB = Math.min(Math.max(p.lampBot, quoteH + 8), box.height - 8);
    /* ⚠ AND THE SENTENCE ABOVE WAS TRUE OF ONE AXIS AND WRITTEN AS A RULE.
       *"A control anchored to a feature of the picture must not leave the
       picture when the feature does"* — and the card went on leaving it
       sideways. `.quote` is `left: var(--lamp-cx); translateX(-50%)`, so half
       its width hangs either side of a lamp that the crop can bring within
       50 px of the stage's edge; `.stage-wrap` is `overflow: hidden`, so what
       is past that edge is not off the fold, it is cut off. Measured over 162
       readings (9 desktop widths × 3 languages × all six sizes), px of card
       lost, worst size:

           1100x800   he 23   en 34   ru 46
           1152x800   he 18   en 29   ru 41
           1200x800   he 14   en 25   ru 37
           1440x900   he  0   en  5   ru 17
           1280, 1366, 1536, 1680, 1920 — clean in all three

       64 of the 162 lose something, up to 30 px of the GREEN SEND ITSELF, and
       three of those widths are audit viewports. ⚠ Two axes of the fault are
       the two this project keeps meeting: the card is 22–44 px wider on any
       size but `standard` (the send's label grows the moment the door stops
       being the default one, 11.9), and 22–44 px wider again in Russian —
       so the reading everything here takes, the standard door in Hebrew, is
       the least bad of the eighteen.

       ⚠ AND IT MAY NOT SIMPLY BE PULLED INBOARD, which was the first version.
       At 1100–1152 the wall is 139–213 px and the card is 141–207, so on the
       wide doors there is no position that is both inside the stage and clear
       of the leaf: a plain clamp lays up to 76 px × 122 of OPAQUE PAPER on the
       door — three hundred times the 253 px² that got the language pill's
       ground taken away on 28.8. So the pull stops at the casing. Where the
       wall cannot hold the card the card stays where it is and stays cut, and
       that residual is CLAUDE.md §9's existing entry about this wall gaining a
       second occupant rather than a new fault.
       ⚠ It only ever moves the card INBOARD. Where the card already overlaps
       the door (1100 px, the two widest doubles) pushing it back out would buy
       clean plaster with a bigger cut, which is a different decision and not
       this one. */
    /* ⚠ AGAINST THE WRAP, WHICH IS THE BOX THAT CLIPS, not against `.stage`.
       They are coincident on every shape measured today — checked, 162
       readings — and that is exactly the kind of agreement that stops being
       true the day somebody gives the wrap a side padding again. The wrap is
       what carries `overflow: hidden`, so it is what decides what is cut. */
    const half = quoteW / 2;
    const edge = Math.min(wrapR.right, window.innerWidth) - box.x;
    const pull = Math.min(p.lampX, edge - half - 8);            // inside the picture
    const stop = frameR ? frameR.right - box.x + half : -Infinity;   // not onto the door
    const lampX = Math.max(pull, Math.min(p.lampX, stop));
    const st = $('.stage-wrap').style;
    st.setProperty('--lamp-cx', `${Math.round(box.x - wrapR.x + lampX)}px`);
    st.setProperty('--lamp-b', `${Math.round(box.y - wrapR.y + lampB)}px`);
  }

  /* HOW MUCH WALL THERE IS BESIDE THE DOOR, in css pixels, published for the
     grip controls to stand in.
     They are absolutely positioned in that wall, and their width cannot be a
     guess: the door's drawn width changes with the SIZE — a sidelight or a
     leaf-and-a-half is far wider than a narrow leaf — and it changes again
     with every viewport, because `fitStage` scales the whole drawing to the
     stage. A hand-picked `min(30vw, 9.5rem)` fitted a standard leaf on a
     laptop and overlapped the frame by seven pixels on a 390 px phone, which
     is the kind of number that is right until somebody opens it on a phone.
     Measured off `#frame`, which is the whole door assembly including its
     casing — not the leaf, whose edge is 158 mm inside it.
     The rect is the one read once above, for the lamp clamp and for this. */
  if (frameR) {
    const f = frameR;
    /* ⚠ Measured against the WRAP, not against `.stage`. Above 1100 px the
       wrap carries `padding-inline-start: var(--grip-strip)` so the controls
       always have somewhere to stand, and `.stage` begins after it. Measuring
       from `.stage` would report only the wall left over INSIDE the door's own
       box and miss the reserved strip entirely, shrinking the number by the
       whole strip at exactly the widths where the wall is most generous.
       The wrap's rect is its padding box, which is also what the absolutely
       positioned `.grip-bar` is laid out against — so the number published
       here and the box the bar sits in are the same box, by construction
       rather than by two agreeing measurements. */
    const wrap = $('.stage-wrap').getBoundingClientRect();
    const wall = Math.max(0,
      Math.min(f.x - wrap.x, wrap.x + wrap.width - (f.x + f.width)));
    /* ⚠ `--wall-gap`, NOT `--wall`. `--wall` is the wall's COLOUR and has been
       since the first stylesheet, and the SVG's own backdrop is painted with
       `fill="var(--wall)"` — so setting it to a pixel length on `.stage-wrap`
       cascaded into the drawing, made the fill invalid, and every door came up
       on a BLACK ground. Reported from the outside within minutes.
       A custom property set from script inherits into everything below it,
       including markup this file never looks at. Name one for what it is. */
    $('.stage-wrap').style.setProperty('--wall-gap', `${Math.round(wall)}px`);

    /* WHERE THE STAGE'S COLUMN IS, for the trust band to sit inside.
       Above 1100 px the band is `position: fixed` at the foot of the screen —
       the only way to give it height without taking that height out of the
       door — and fixed means it is placed against the VIEWPORT, which knows
       nothing about the three-column grid. So it is told, off the rect this
       function has already read: same measurement, same re-fit, same box.
       ⚠ Set on the root, because `.trust` is not a descendant of the wrap; and
       named for a length, after `--wall` was once handed a pixel value and
       every door came up on a black ground.
       Physical `left`/`width`, not logical: this is a box placed at measured
       viewport coordinates, and `getBoundingClientRect().x` is measured from
       the left edge in both writing directions. */
    /* ⚠ WHERE THE DRAWING STARTS INSIDE THE WRAP, for `.stage__hud`. The three
       controls on the wall — languages, price, undo — are absolute against
       `.stage-wrap`, and the wrap opens with the page's `<h1>`, so
       `inset-block-start: 0` put them on top of the heading rather than on the
       wall. They cannot be children of `.stage` itself: `paint` writes
       `#stage.innerHTML` on every change and would delete them.
       Measured off the same two rects this function has already read, on the
       same re-fit, so it cannot disagree with the door it is placed around. */
    $('.stage-wrap').style.setProperty(
      '--stage-top', `${Math.max(0, Math.round(box.y - wrap.y))}px`);

    /* ⚠ WHERE THE RIGHT-HAND LAMP IS, so the price can hang under it — asked
       for in those words. Measured off the drawing rather than written as a
       percentage of the stage: the sconces are placed from `MID_X ±
       SCONCE_OUT` and a third down the scene, and a hard-coded fraction here
       would go quietly wrong the day either moves.
       ⚠ PHYSICALLY RIGHT, NOT LOGICALLY. `sort` by `x` and take the last, so
       it is the same lamp in Hebrew as in English — the drawing does not
       mirror (see the note over `svg { direction: ltr }`) and neither may
       anything pinned to a feature of it.
       ⚠ AND IN PHOTO-MODE THE LAMP IS IN THE PHOTOGRAPH, so this block is
       skipped and the block above places the pill instead. Written as an
       explicit test and not left to the fact that a `display: none` element
       reports a zero-width rect: that IS what happens, so the guard below
       would have skipped anyway and the pill would have kept whatever value
       the previous fit left on it — correct today, and silently wrong the day
       somebody hides the backdrop a different way. Two rooms, two lamps, one
       decision, stated once. */
    const lamps = document.documentElement.classList.contains('is-photo') ? []
      : [...document.querySelectorAll('.door-svg [data-room="sconce"]')]
        .map(el => el.getBoundingClientRect())
        .sort((a2, b2) => a2.x - b2.x);
    const lamp = lamps[lamps.length - 1];
    if (lamp && lamp.width) {
      const st = $('.stage-wrap').style;
      st.setProperty('--lamp-cx', `${Math.round(lamp.x + lamp.width / 2 - wrap.x)}px`);
      st.setProperty('--lamp-b',  `${Math.round(lamp.bottom - wrap.y)}px`);
    }

    const root = document.documentElement.style;
    root.setProperty('--stage-l', `${Math.round(wrap.x)}px`);
    root.setProperty('--stage-w', `${Math.round(wrap.width)}px`);
    /* ⚠ AND HOW FAR THE WRAP'S FOOT IS FROM THE VIEWPORT'S, which is the whole
       reason the band needs a third number. `position: fixed` with
       `inset-block-end: 0` anchors to the VIEWPORT bottom — and above 1100 the
       layout's last grid row ends exactly there, and that row is
       `.stage__bar`. So the four trust claims were painted straight over
       "הדמיה להמחשה. הדלת נמדדת ומותקנת אצלכם.": measured at 1280x800 the two
       boxes were identical (y 759.7-800, left 360, width 560), and at 1100 the
       band wrapped to two rows and climbed 27 px up into the drawing as well.
       `REALISM2.md` §B5 asked for `absolute` inside the wrap and got `fixed`
       against the viewport, which is a different box.
       Published off the same rect as the two above, on the same re-fit, so the
       band's box and the measured box stay one box. */
    root.setProperty('--stage-b',
      `${Math.max(0, Math.round(window.innerHeight - wrap.bottom))}px`);

    /* ⚠ HOW TALL THE STICKY BLOCK AT THE TOP OF A PHONE ACTUALLY IS, and
       nothing was measuring it. Below 1100 px the navigator is FIXED at the
       top and `.stage-wrap` is STICKY directly under it, so the top ~490 px
       of the scrollport is permanently occupied — and `.sect__title` carried
       `scroll-margin-block-start: calc(var(--steps-h) + 8px)`, which clears
       the navigator and nothing else.

       Measured before the fix: tapping any circle on the rail landed the
       step's own heading **388 px behind the door** at 390x844 and 323 px at
       320x568. So the answer to "what did I just choose?" was the door and a
       half-cut tile, on every step, and the customer had to scroll UP to find
       the question they had just asked for. Nothing in `npm test` or
       `npm run audit` had an opinion about it — a scroll offset is neither a
       string nor an overflow.

       It has to be MEASURED rather than declared, because the wrap's height is
       the heading plus the drawing plus the caveat line and every one of those
       moves with the viewport and the language. Same rect this function has
       already read, same re-fit, so the number and the box it describes cannot
       drift apart. On the root, because `.sect__title` is not a descendant of
       the wrap; and it is only USED below 1100 px, where the wrap is sticky —
       above it the wrap is a column beside the panel and the CSS ignores this. */
    root.setProperty('--sticky-h', `${Math.max(0, Math.round(wrap.height))}px`);
  }

  /* ⚠ AND HOW TALL THE QUOTE BAR IS, so the page can end above it rather than
     underneath it. Outside the `#frame` guard on purpose: the bar exists and
     has a height whether or not the drawing came up, and a page whose door
     failed to render still must not hide its own last option behind the one
     control that can reach Peretz. */
  if (quoteEl) {
    document.documentElement.style.setProperty('--quote-h', `${Math.round(quoteH)}px`);
  }

  /* ⚠ AND HOW MUCH ROOM THERE IS UNDER THE PRICE FOR ITS OWN BREAKDOWN.
     Measured 13.9.2026 by opening the price the way a customer does. Above
     1100 px the breakdown hangs off `.quote__price` and opens DOWNWARD into
     the wall, capped at `46vh` — and 46vh is a guess at the room, not the
     room. On a 1280x720 laptop, on a door carrying one +₪200 colour and
     nothing else, the column's bottom edge landed 25 px past the foot of the
     window, and the row it took with it was **the total**: scrolled to the
     popover's own end, `סה״כ` sat at 700..732 against a 720 px screen.

     ⚠ AND THAT IS NOT "BELOW THE FOLD", WHICH IS THE WHOLE SEVERITY OF IT.
     Above 1100 `body` is `100dvh; overflow: hidden` — one screen, two columns
     scrolling inside it — so there is no page scroll to reach it with, and
     scrolling the popover only drags its content toward a bottom edge the
     window is already clipping. The bottom line of the customer's own bill,
     unreachable by any gesture. Measured on four of six desktop shapes,
     including two of the audit's own eight viewports (1280x720 and
     1920x918); 1152x800 and 1440x900 were clear.

     ⚠ THE PHONE SIDE IS CORRECT AND IS NOT TOUCHED. Below 1100 the bar is
     fixed at the foot and the box opens UPWARD into a whole screen of room —
     measured at nine shapes including the landscape phones and the zoomed
     laptop of §9, the box never leaves the screen and the total is always
     reachable. So this number is published for, and read by, the desktop rule
     alone, exactly as `--sticky-h` is published for the phone one.

     ⚠ AND THE BOX THAT CLIPS IT IS NOT THE WINDOW ON A DESKTOP, WHICH THE
     FIRST VERSION OF THIS GOT WRONG AND A PICTURE CAUGHT. Capped against
     `innerHeight` the column still came out cut at the foot, with the
     illustration caveat apparently painted over it — and it is not painted
     over, it is CLIPPED: in the wall the quote is `position: absolute` inside
     `.stage-wrap`, which is `overflow: hidden`, so anything hanging below the
     wrap simply stops and the sibling band behind it shows through. On the
     phone the bar is `position: fixed`, which no `overflow` ancestor clips,
     and the window really is the edge. Two different boxes, and the page is
     asked which rather than the 1100 px breakpoint being restated here —
     CLAUDE.md §9 counts eight readers of that one media query already, and a
     ninth written in JavaScript is the worst of them.

     `--bd-gap` is the box's own margin and stays in the CSS: the room is
     measured here, the margin subtracted where it is applied (§5.10). Read on
     every re-fit, off a rect this function is already in the business of
     taking, so it cannot drift from the box it describes. */
  const bdAnchor = document.querySelector('.quote__price');
  if (bdAnchor) {
    const a = bdAnchor.getBoundingClientRect();
    let clip = window.innerHeight;
    for (let n = bdAnchor; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.position === 'fixed') break;
      if (n !== bdAnchor && cs.overflowY !== 'visible') {
        clip = Math.min(clip, n.getBoundingClientRect().bottom);
        break;
      }
    }
    document.documentElement.style.setProperty(
      '--bd-room', `${Math.max(0, Math.round(clip - a.bottom))}px`);
  }

  /* ⚠ AND HOW MUCH OF THE DESKTOP PANEL IS SPOKEN FOR, for the
     same reason `--sticky-h` and `--quote-h` exist one breakpoint down: above
     1100 px the page does not scroll, the choices column does, and the
     navigator is sticky at its top edge while `.sect__foot` is sticky at its
     bottom. Anything scrolled into view inside that column therefore lands
     behind one of them unless the scrollport says how much of itself is
     already spoken for — which is `scroll-padding-block` in the stylesheet.

     Both are MEASURED rather than declared because neither is a constant: the
     foot carries one button on a question step and a button plus the green
     send on the summary (46 px against 93 measured at 1100x800), and the rail
     follows the 44 px tap floor and its own rule. Read here, on the re-fit
     this function already performs, so the published number and the box it
     describes are the same box. Outside the `#frame` guard for `--quote-h`'s
     reason: these exist whether or not the drawing came up. */
  const style = document.documentElement.style;
  const choose = document.querySelector('.panel--choose');
  const railEl = choose && choose.querySelector('.steps');
  const footEl = document.querySelector('.sect:not([hidden]) .sect__foot');
  if (choose && railEl && getComputedStyle(railEl).position === 'sticky') {
    /* ⚠ THE BAND, NOT THE HEIGHT, AND THE DIFFERENCE IS 10 px OF TILE.
       `scroll-padding` is measured from the scrollport's PADDING box; a sticky
       element is clamped by its own CONTAINING BLOCK, which for the rail is
       `.panel--choose`'s content box — so the panel's block-start padding
       stands between the two and the rail comes to rest below it, never on the
       padding edge. Measured at 1100, 1280 and 1440: rail 61 px tall resting
       23 px down a panel whose padding edge is at 1, band 83. Shipping the
       height alone left exactly 10 px of every tile behind the navigator on
       `Home` and `ArrowUp`, which is how this number was found.
       ⚠ AND IT IS NOT THE RAIL'S CURRENT RECT. At `scrollTop: 0` the rail has
       not stuck yet and sits 91 px down, so reading its live box published 151
       and over-padded the scrollport by 68 px. The quantity is where it comes
       to REST, which is the panel's own padding plus the rail's own height —
       both read off the element rather than copied from the stylesheet, so
       neither can drift from a declaration forty lines away (§5.10).
       ⚠ The foot is not symmetric and is deliberately NOT given the same
       treatment: its containing block is the `.sect`, and the card's bottom
       padding was moved INTO the foot on purpose (see `.sect__foot`'s own
       note), so it rests flush on the padding edge and its band IS its
       height. Measured: with `foot height + 12` the sweep is clean at every
       desktop width. */
    const pad = parseFloat(getComputedStyle(choose).paddingBlockStart) || 0;
    const band = pad + railEl.getBoundingClientRect().height;
    if (band > 0) style.setProperty('--rail-band', `${Math.round(band)}px`);
  }
  if (footEl && getComputedStyle(footEl).position === 'sticky') {
    const r = footEl.getBoundingClientRect();
    if (r.height > 0) style.setProperty('--foot-band', `${Math.round(r.height)}px`);
  }
}

// Debounced so arrowing through ten colours announces once on settle,
// not ten times (PLAN.md §14).
let liveTimer = null;
function announce(text) {
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { $('#live').textContent = text; }, 500);
}

// ── actions ───────────────────────────────────────────────────────

async function onCopy() {
  const ok = await copyMessage(state, engaged);
  toast(T(ok ? 'copy.ok' : 'copy.fail'));
}

let toastTimer = null;
/**
 * ⚠ THE DWELL FOLLOWS THE LENGTH, because a fixed 4,000 ms was chosen when
 * every toast was one sentence and it is not a constant that survived the
 * change above: the longest thing a repair can now say is 155 characters
 * (English, two sentences, measured over every face x window), which is about
 * 28 words — roughly eight seconds of careful reading of an unfamiliar line.
 * Four seconds would show the customer the ₪4,200 half of the sentence and
 * take it away before they reached it, which is the defect wearing a timer.
 *
 * 55 ms per character is a PROXY and is written down as one: it is not
 * measured off a reader, it is picked so that today's typical single sentence
 * (~40 chars) still dwells ~4.2 s — the case this change must not alter the
 * feel of — while the three-sentence worst case gets ~11 s. Floored at the old
 * 4,000 and capped at 12,000, because a message that will not go away is its
 * own fault and `.toast` is `pointer-events: none`, so nobody can dismiss it.
 */
function toast(text) {
  if (!text) return;
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  const ms = Math.min(12000, Math.max(4000, 2000 + 55 * text.length));
  toastTimer = setTimeout(() => { el.hidden = true; }, ms);
}

/**
 * The strip a customer — or Peretz, opening their link — reads on arrival.
 *
 * `said` is the repair's own account of what it did, one sentence per change,
 * and it is preferred over the generic line for exactly the reason the toast
 * prefers it: a lookup keyed on the KIND of notice can only be right while a
 * kind has one thing it can mean. `combination-fixed` has many. The commonest
 * of them by far is a stale `gp=` that moved nothing but the HANDLE, which is
 * not part of the order and which the stage already describes as settled on
 * site — and that arrived reading "the combination in the link cannot be
 * manufactured, we adjusted it to the nearest door". A false alarm, and the
 * expensive kind: it invites the clarifying question the site exists to
 * remove.
 *
 * `option-unknown` and `code-unknown` keep their own words and are NOT
 * overridden. They are the worse news — a name that matched nothing we sell,
 * so the customer is looking at a different door — and `settle` deliberately
 * lets them win over the milder statement. The sentences describe the repair,
 * which is the milder half of what happened.
 */
function showNotice(kind, said) {
  const el = $('#notice');
  const generic = {
    'code-unknown': T('notice.code'),
    'combination-fixed': T('notice.fixed'),
  }[kind] || T('notice.some');
  el.textContent = kind === 'combination-fixed' && said && said.length
    ? said.join(' · ') + '.'
    : generic;
  el.hidden = false;
}

// ── go ────────────────────────────────────────────────────────────

/* The measurement hook. `?bare=1` is already the harnesses' mode — it turns
   off `fitStage` so a tool sees the drawing's own frame — and this exposes the
   pure render function alongside it, so `tools/collide.mjs` can sweep
   thousands of designs inside ONE page load instead of navigating per case.
   Guarded, because production has no business carrying it. */
if (new URLSearchParams(location.search).has('bare')) {
  window.__render = render;
}

/* ── WHEN THE APP CANNOT START ────────────────────────────────────
 *
 * `init()` ran unguarded, and the screen a throw produced was measured: an
 * empty stage where the door goes, `—` for the price, `—` for the code, no
 * choices at all, and two full-width green WhatsApp buttons pointing at `#`.
 * A page that looks finished and is inert. That is the worst shape a failure
 * can take here, because a customer cannot tell it from a page still loading,
 * and the one thing PLAN.md §0 asks for — a message Peretz can act on — is
 * exactly what is missing.
 *
 * Note what this DOES NOT do: it does not swallow the error and it does not
 * carry on with half an app. The error is logged and then rethrown out of a
 * timeout, so it still reaches `window.onerror`, the audit's `pageerror`
 * listener and anything we ever hang off it — a page that quietly repaired
 * itself would take the only report of the fault with it. `npm run audit`
 * fails on a page error, deliberately: this handler is what the CUSTOMER gets,
 * never a licence for the app to be broken.
 *
 * What the customer gets: the honest strip (`#down`), the telephone as a live
 * `tel:` link, and both WhatsApp buttons pointing at a real conversation —
 * reset here explicitly rather than trusted to still be the markup's, because
 * `paint()` may have thrown at any point, including after it wrote the hrefs.
 */
function fail(err) {
  console.error('[dlatot-magen] the configurator could not start:', err);
  try {
    degrade();
    /* ⚠ AND THE LABEL COMES BACK DOWN WITH THE HREF. `is-live` is what
       licenses the buttons to say `שלחו את הדלת בוואטסאפ`, and `paint()` sets
       it as soon as there is a real door to send. A throw AFTER that point —
       a later paint, a drag, a repair — left the class on while these three
       lines pointed the href back at "the page didn't load for me, so I have
       no code to send". Label and href said opposite things again, which is
       the exact bug the resting-state rule in css/app.css was written to end.
       They move together or the pact is not a pact. */
    document.documentElement.classList.remove('is-live');
    document.querySelectorAll('[data-wa]').forEach(el => {
      el.href = fallbackWhatsappUrl();
      el.removeAttribute('target');   // a blocked popup on a broken page is a
                                      // dead end; open in the same tab
    });
  } catch (e) {
    console.error('[dlatot-magen] the fallback itself failed:', e);
  }
  // Rethrown asynchronously: handled for the customer, still reported to us.
  setTimeout(() => { throw err; });
}

/**
 * Apply the degraded stylesheet that lives in the `<noscript>`.
 *
 * ⚠ `noscript` is parsed as RAW TEXT when scripting is ON, so its single child
 * is the literal `<style>…</style>` source rather than a stylesheet. That is
 * the HTML spec, not a Chromium quirk, and it is what lets ONE copy of those
 * rules serve both failures — the browser applies them when scripting is off,
 * and this reads them back and appends them when scripting is on and something
 * threw. Two rule-lists would agree until the day somebody added a panel to
 * one of them.
 *
 * Nothing here comes from a URL or from a customer; it is our own markup read
 * back. Idempotent, because more than one route can call it.
 */
function degrade() {
  const css = document.getElementById('down-css');
  if (!css || document.getElementById('down-css-live')) return;
  document.head.insertAdjacentHTML('beforeend',
    css.textContent.replace('<style>', '<style id="down-css-live">'));
}

/* Every entry the browser has into this file goes through here. */
const guard = fn => (...a) => { try { return fn(...a); } catch (e) { fail(e); } };

/* ⚠ THE THIRD FAILURE ROUTE, WHICH NEITHER OF THE OTHER TWO COVERS: scripting
   is ON and this bundle never arrives. A 404 after a bad deploy, a poisoned
   cache, a CSP, a parse error. `<noscript>` is inert because scripting is on,
   and no handler was ever registered, so `fail()` cannot run — the page comes
   up styled, complete and dead, which is the original defect verbatim. This
   repo already has a test group about a stale bundle reaching a returning
   browser, so it is not hypothetical.
   `index.html` sets the flag below immediately after the bundle tag; if this
   file evaluated, it is already true and the check there does nothing. */
window.__up = 1;
/* Disarm the stall timer armed in the head. Reaching this line IS the bundle
   arriving, which is the only thing that timer is waiting to hear. */
try { clearTimeout(window.__downTimer); } catch { /* no timer, nothing to do */ }

document.addEventListener('DOMContentLoaded', guard(() => {
  /* ⚠ EVERY `tel:` ON THE PAGE, not the header's one. `#phone-link` lived in
     the brand bar and the brand bar is deleted; the number survives in the
     send card's fine print and in the cannot-load strip, and BOTH have to
     carry the same digits and the same RFC 3966 href as `js/share.js`. Written
     by selector rather than by id so a fourth place cannot be added without
     inheriting it — the old single-id write was one element's worth of a
     promise the whole page makes. */
  for (const a of document.querySelectorAll('a[href^="tel:"]')) {
    a.href = `tel:${PHONE_TEL}`;
  }
  /* The SPAN, not the link: a link may also hold an icon, and `textContent` on
     a parent replaces every child it has. */
  for (const el of document.querySelectorAll('[data-phone-text]')) {
    el.textContent = PHONE_DISPLAY;
  }
  init();
}));
