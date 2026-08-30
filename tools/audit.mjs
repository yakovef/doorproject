/**
 * Interface audit. What `npm test` cannot see.
 *
 * The unit tests render SVG strings; they never open the page, so every fault
 * that lives in layout, CSS or event wiring is invisible to them. This drives
 * the real thing at four sizes: clicks every option in every group, and after
 * each click checks the invariants a person would notice.
 *
 *   - no console error, no unhandled rejection
 *   - the page never scrolls sideways
 *   - the door is on screen and not clipped
 *   - the price, the code and the WhatsApp link all changed with the door
 *   - nothing overflows its own column
 *   - every tap target reaches the 44 px minimum
 *
 * Run: npm run audit
 */
import { chromium } from 'playwright';
import { assertFreshBundle } from './fresh.mjs';
import { crashed } from './browser.mjs';
import { load, lum } from './imglib.mjs';
import { DEFAULTS, decodeCode, encodeCode } from '../js/url-state.js';
import { formatAgorot, priceAgorot } from '../js/price.js';
import { SIZES } from '../js/catalog.js';
import { setLang } from '../js/copy.js';
import { handingWords, specRows, summaryLine } from '../js/spec.js';

/* Derived, not spelled out: the code grew from seven characters to eight when
   the grip and the lockset became separate fields, and a hard-coded length
   here turned that into 280 audit failures that were all the same fact. */
const CODE = new RegExp(`^DM-[0-9A-Z]{${encodeCode(DEFAULTS).length - 3}}$`);

/* ⚠ 1100 AND 1152 ARE HERE BECAUSE THIS LIST USED TO STEP 834 -> 1280, AND THE
   THREE-COLUMN LAYOUT BEGINS AT 1100. Nothing had ever opened the band in
   between, and the band was broken: measured at 1100 on a sidelight the grip
   bar came out 0 px wide and its buttons 22, against the 44 px floor this same
   file asserts everywhere else. The controls a customer is told to press were
   unpressable on any 1100-1240 px laptop showing a wide door — a regression of
   a change made by request, invisible to every instrument in the repo.

   The lesson is AGENT-LOG run 8's, one level up: a hand-kept list inside a
   check is how the grip bar's two 34 px buttons went unmeasured the first
   time. A VIEWPORT list is a hand-kept list too, and the viewport that matters
   is the one just past a breakpoint, not the round number a laptop happens to
   be. `css/app.css` has exactly one breakpoint, 1100, so it is here; 1152 is
   the far side of the band, where the wall is only just wide enough. */
const VIEWS = [
  { name: 'phone',    w: 390,  h: 844 },
  { name: 'phone-s',  w: 320,  h: 568 },
  { name: 'tablet',   w: 834,  h: 1112 },
  { name: 'cusp',     w: 1100, h: 800 },
  { name: 'narrow-d', w: 1152, h: 800 },
  { name: 'laptop',   w: 1280, h: 720 },
  { name: 'wide',     w: 1680, h: 950 },
  /* ⚠ AN EIGHTH, AND IT IS HERE BECAUSE A FAULT GOT PAST THE SEVEN. A
     1920×918 laptop — a very ordinary machine, and the one the owner's son
     actually opened the page on — makes the stage 1540×783, an aspect of
     1.95 against `wide`'s 1.60. The photographed room's sconces were cropped
     clean off the top of it and the price card had climbed out of the picture
     onto the language buttons, and every one of the seven viewports above was
     green. The widest of them clipped the same sconce by TWO PIXELS and
     passed. A viewport list that stops before the screens people own is a
     list that reports on a page nobody has. */
  { name: 'wide-short', w: 1920, h: 918 },
];

/* Read off the page rather than listed here. The list was hand-kept and it had
   already outlived one rename; with the panel now generated from a table in
   app.js, a hand-kept copy in the audit would go stale the first time a
   category was added and its symptom would be the new category never being
   audited — silence, not a failure.

   Each category is returned WITH THE SECTION IT LIVES IN, because a category
   is now two clicks from the page: the fold is what this audit most needs to
   drive, since a category nobody can reach looks exactly like a working page
   from anywhere else. */
const groupsOn = p => p.$$eval('.field[data-group]', els => els.map(e => ({
  key: e.dataset.group,
  section: e.closest('.sect').dataset.section,
})));

await assertFreshBundle();

let b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let faults = 0;
let crashes = 0;
const fault = (view, msg) => { faults++; console.log(`  ✗ [${view}] ${msg}`); };

/* ── A VIEWPORT THAT KILLED THE BROWSER IS SKIPPED, LOUDLY ────────────
   Chromium in some containers stops being able to rasterise this page, and the
   ceiling falls the longer the container lives: measured, 1280x720 crashed its
   renderer on five consecutive brand-new browsers under ten flag sets, 1099
   passed once and failed twenty minutes later, and by the end even 390x844 —
   reliable all session — went down (see `tools/browser.mjs`). Until now that
   took the whole run down at whichever viewport it happened on — so a crash at
   the sixth of seven destroyed five good audits along with it, and the output
   ended in a stack trace rather than in a verdict.

   ⚠ THE SKIPPED VIEWPORT IS NOT A PASS, and the two must never print the same
   thing. It is counted separately, named in the summary, and the run exits
   non-zero if EVERY viewport had to be skipped — an instrument that measured
   nothing is not a page that is fine.

   ⚠ AND FAULTS ARE ROLLED BACK BEFORE THE SKIP. A crash halfway through a
   viewport leaves whatever it had already recorded; keeping those would report
   half an audit as if it were a whole one. This is deliberately a SKIP and not
   a retry: the crashes measured here are reproducible per viewport, so
   retrying the same one is a loop, and a partial audit re-run from the top
   would double-count everything before the crash. */
let skipped = [];
for (const v of VIEWS) {
  const faultsBefore = faults;
  try {
  const p = await b.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  await p.waitForTimeout(400);
  console.log(`\n${v.name}  ${v.w}x${v.h}`);

  /* ⚠ COMPARE LIKE WITH LIKE. Everything below checks the RENDERED page
     against `specRows`/`summaryLine` called here in Node, and those two now
     answer in whatever language is current — which in Node is Hebrew and in
     the page is whatever `pickLang` decided from this container's Chromium.
     Headless Chromium reports `en-US`, and for one build that produced 1,187
     faults reading "#spec has drifted off js/spec.js" about a page that
     agreed with `js/spec.js` perfectly, in English.
     Read off the page rather than pinned to a constant here: a hard-coded
     `he` would make this instrument stop testing the thing it exists to test
     the day the default changes. */
  setLang(await p.evaluate(() => document.documentElement.lang) || 'he', null);

  /* The cabinet: on first paint the customer must see the four SECTIONS and
     nothing else — no category headings and no options. That is the whole
     change, so it is asserted rather than assumed; a regression here looks
     like a working page. */
  const shut = await p.evaluate(() => ({
    steps: document.querySelectorAll('.sect').length,
    live: [...document.querySelectorAll('.sect')].filter(b => !b.hidden).length,
    liveKey: (document.querySelector('.sect:not([hidden])') || {}).dataset?.section,
    nav: document.querySelectorAll('.steps__step').length,
    current: document.querySelectorAll('.steps__step[aria-current]').length,
    visibleOptions: [...document.querySelectorAll('[role="radio"]')]
      .filter(e => e.getBoundingClientRect().height > 0).length,
  }));
  /* THE DRAWING IS PAINTED ON THE WALL, and it can stop being.
     `#backdrop` is filled with `fill="var(--wall)"`, so any script that sets
     `--wall` to something that is not a colour makes the fill invalid and the
     backdrop falls back to the initial value — BLACK. That happened: the grip
     controls needed the measured gap beside the door, `fitStage` published it
     as `--wall`, and a name that had meant the wall's COLOUR since the first
     stylesheet started meaning a pixel length. Every door came up on a black
     ground. A custom property set from script inherits into everything below
     it, including markup the setter never looks at.
     Asked of the COMPUTED fill rather than of the variable, because the
     variable being wrong is only one of the ways this can go. */
  const ground = await p.evaluate(() => {
    const bd = document.querySelector('.door-svg #backdrop rect');
    if (!bd) return null;
    const f = getComputedStyle(bd).fill;
    const m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(f);
    return { fill: f, lum: m ? (+m[1] * 0.2126 + +m[2] * 0.7152 + +m[3] * 0.0722) : null };
  });
  if (!ground) fault(v.name, 'the drawing has no backdrop to paint');
  else if (ground.lum == null || ground.lum < 60) {
    fault(v.name, `the drawing's backdrop computes to ${ground.fill} — the wall is unpainted`);
  }

  if (!shut.steps) fault(v.name, 'no steps rendered');

  /* ⚠ MOTION MUST BE DEAD IN BARE MODE, AND THIS IS WHY IT IS ASSERTED HERE
     RATHER THAN TRUSTED. `?bare=1` is what `npm run sheets`, `recreate`,
     `corpus`, `against`, `profile` and `collide` photograph. One animation
     running during a screenshot makes all 110 committed sheets
     NON-DETERMINISTIC: the same commit produces a different image every run,
     every comparison against a photograph drifts, and the byte-identical check
     that proves the leaf did not move fails at random.
     Measured on the COMPUTED style, not on the presence of the rule — a
     stylesheet that says the right thing and loses to specificity is the
     failure this exists for. And measured with a real duration, because
     `prefers-reduced-motion` zeroes the duration and keeps the NAME. */
  {
    const running = () => [...document.querySelectorAll('*')].filter(e => {
      const c = getComputedStyle(e);
      return c.animationName && c.animationName !== 'none'
          && (parseFloat(c.animationDuration) || 0) > 0.01;
    }).length;
    const bare = await p.evaluate(`(${running})()`, undefined).catch(() => null);
    if (bare === null) fault(v.name, 'could not measure animations on the live page');
    else if (!bare) fault(v.name, 'nothing on the page animates at all — the motion is not wired');

    /* Same page, `?bare=1`, then back — `browser.use()` hands out one page per
       call and this check is inside that borrow, so a second page is not ours
       to open. Navigating and returning is also the truer test: it is the same
       document the sheets photograph. */
    await p.goto('file://' + process.cwd() + '/index.html?bare=1');
    await p.waitForSelector('#stage svg');
    const inBare = await p.evaluate(`(${running})()`);
    if (inBare) {
      fault(v.name, `${inBare} elements still animate under ?bare=1 — every committed `
                  + 'sheet becomes non-deterministic');
    }
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.waitForSelector('#stage svg');
    await p.waitForTimeout(1100);      // let the arrival animation finish
  }

  /* ── AND NOTHING IS LEFT WAITING IN A DELAY ──────────────────────────
     ⚠ THE COMPUTED-STYLE CHECK ABOVE CANNOT SEE THIS ONE, AND THAT IS WHY
     THERE ARE TWO. It reads `animationDuration`, and under
     `prefers-reduced-motion` the duration collapses to nothing — so an
     animation sitting in its `animation-delay`, with `both` holding its
     element at the FROM keyframe, reads as harmless and is not.

     Measured, on the commit that added the reveal: `revealSend` carries a
     180 ms delay, the reduced-motion block zeroed the duration and not the
     delay, and the green send button was therefore held at `opacity: 0` for a
     fifth of a second — on the one screen whose whole job is sending, for
     exactly the customer who asked the browser to stop moving things.
     `getAnimations()` is the only thing that reports it, because it counts an
     animation in its delay phase as RUNNING, which it is.

     Emulated rather than assumed: a page opened with `reducedMotion: reduce`,
     driven to the summary — the step that has the most motion on it — and then
     asked what is still going. The answer has to be nothing. */
  {
    /* ⚠ THE SAME PAGE, NOT A SECOND ONE. `b.newPage()` hands out a page that
       OWNS its context, so `p.context().newPage()` throws
       "Please use browser.newContext()" — which it did, at the first viewport,
       on the first run. Emulating the media query on the page already borrowed
       is also the truer test: same document, same stylesheet, same everything
       but the one preference under test. Put back afterwards, because every
       check below this one runs on the same page. */
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.waitForSelector('#stage svg');
    await p.waitForTimeout(600);
    await p.click('.steps__step[data-step="sum"]');
    await p.waitForTimeout(90);
    const still = await p.evaluate(() => document.getAnimations()
      .filter(a => a.playState === 'running')
      .map(a => a.animationName || 'a transition'));
    if (still.length) {
      fault(v.name, `prefers-reduced-motion: ${still.length} animation(s) still `
        + `running — ${still.join(', ')}. A delay is motion too, and an element `
        + 'held at its FROM keyframe is an element nobody can see');
    }
    await p.emulateMedia({ reducedMotion: 'no-preference' });
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.waitForSelector('#stage svg');
    await p.waitForTimeout(1100);
  }

  /* ⚠ THE ARRIVAL STATE IS NOW THE SAME AT EVERY WIDTH, AND THAT IS THE POINT.
     This used to be two rules — a phone arrived with every fold SHUT and a
     desktop with all four OPEN — and each was measured: the panel once put the
     WhatsApp button eight screens down a phone, and a desktop column 918 px
     tall held 304 px of content, so 614 px of it was empty card.
     A flow has one shape. Exactly one step is live, at 320 px and at 1680, and
     the navigator says which. There is no per-device arrival to get wrong and
     no 1100 px crossing to reshape on — which is a whole class of fault
     (`REDESIGN.md` §1.8, and the fold sticking in the other device's mode)
     that stops existing rather than getting another assertion.
     ⚠ AND THE OPTIONS ARE MEANT TO BE VISIBLE. The old rule was "nothing open,
     anywhere", which is exactly backwards for a flow: a step whose controls
     are hidden is a step asking a question the customer cannot answer. What
     must NOT be visible is every step at once, and `live === 1` is that. */
  if (shut.live !== 1) {
    fault(v.name, `${shut.live} steps visible at once — exactly one should be live`);
  }
  if (shut.liveKey !== 'fit') {
    fault(v.name, `a bare load starts on "${shut.liveKey}" — it should start at step 01`);
  }

  /* ⚠ T15 — EVERY STEP EXPLAINS ITSELF. TRANSFORM.md §10.4's sixth part, and
     §10.4 calls it "the single biggest thing the old cabinet could not do": a
     fold heading had room for a name and nothing else, so the app never
     explained anything. Eight steps, eight disclosures, each closed on
     arrival — an explainer that starts open is not an explainer, it is a wall
     of text between the customer and the tiles.
     And every group carries its one line of plain Hebrew. Both halves are
     asserted because both shipped missing once: four of eleven groups had no
     `hint` and there was no `<details>` anywhere in the project. */
  const explains = await p.evaluate(() => ({
    steps: document.querySelectorAll('.sect[data-section]').length,
    exps: document.querySelectorAll('.sect .sect__exp').length,
    open: document.querySelectorAll('.sect .sect__exp[open]').length,
    empty: [...document.querySelectorAll('.sect .sect__a')]
      .filter(e => (e.textContent || '').trim().length < 40).length,
    fields: document.querySelectorAll('.field[data-group]').length,
    hinted: document.querySelectorAll('.field[data-group] .field__hint').length,
  }));
  if (explains.exps !== explains.steps) {
    fault(v.name, `${explains.steps} steps and ${explains.exps} explainers — a step that `
                + 'cannot answer "what is this?" is the cabinet again with wider margins');
  }
  if (explains.open) fault(v.name, `${explains.open} explainer(s) start open`);
  if (explains.empty) fault(v.name, `${explains.empty} explainer(s) are empty or a stub`);
  if (explains.hinted !== explains.fields) {
    fault(v.name, `${explains.fields} groups and ${explains.hinted} hints — a group with `
                + 'no line of plain language under its title explains nothing');
  }
  if (shut.nav !== shut.steps) {
    fault(v.name, `${shut.nav} navigator circles for ${shut.steps} steps`);
  }
  if (shut.current !== 1) {
    fault(v.name, `${shut.current} navigator circles marked current — exactly one should be`);
  }
  if (!shut.visibleOptions) {
    fault(v.name, 'the live step shows no options at all — its question cannot be answered');
  }

  /* ⚠ EVERY STEP MUST BE REACHABLE FROM THE NAVIGATOR AT ANY TIME, and this
     replaced "clicking one heading must not shut the others" — a check written
     because `toggleSection` passed `null` to `openSection`, which set
     `on = sec.key === key` for every section and shut all four on the first
     click. There are no headings to shut now.
     What matters instead is that the flow is not a one-way road: a customer
     who wants to change the colour must not walk through six steps to reach
     it. Walked rather than asserted at one point, because a navigator that
     works for the first circle and not the seventh is the fault this is for. */
  {
    const keys = await p.evaluate(() =>
      [...document.querySelectorAll('.steps__step')].map(b => b.dataset.step));

    /* ⚠ THE ORDER OF THE QUESTIONS, WHICH NOTHING IN THIS REPOSITORY WAS
       ASKING. Peretz moved the hardware in front of the face on 30.8.2026 —
       *"handles before the panels"* — and there was no assertion to restate
       for the new order, because every walk in this file reads the keys out of
       the DOM and is therefore true whatever order they arrive in. An order
       that is a product decision and is asserted nowhere is one a refactor
       reverses in silence.

       Written as the WHOLE sequence rather than as "grip comes before face":
       a pair-wise rule is satisfied by plenty of orders nobody chose, and what
       is being protected is the sequence a customer is walked through. Read
       off the rendered navigator rather than off `SECTIONS`, so it is the
       order a person actually meets. Falsified by swapping two entries in
       `SECTIONS`: it fires at every viewport and prints both sequences. */
    /* ⚠ RESTATED 30.8.2026 — `mk` MOVED FROM SECOND TO LAST, AND IT IS THE
       ONLY THING THAT MOVED. Reported from outside: משקוף is the most
       technical question in the guide and it was arriving before the customer
       had made one choice they enjoyed. Peretz's rule is untouched and is
       still the reason the middle of this list looks as it does — `grip` and
       `lock` remain ahead of `face`. The assertion keeps its shape: the WHOLE
       sequence, read off the rendered navigator, because a pair-wise rule is
       satisfied by plenty of orders nobody chose. */
    const WANT_ORDER = ['fit', 'colour', 'grip', 'lock', 'pz', 'face', 'glass', 'mk', 'sum'];
    if (keys.join(',') !== WANT_ORDER.join(',')) {
      fault(v.name, `the flow asks its questions as ${keys.join(' → ')}, `
        + `and it should be ${WANT_ORDER.join(' → ')} `
        + '(Peretz, 30.8.2026: handles before the panels; משקוף last, 30.8)');
    }

    for (const k of keys) {
      /* Back to the top before each jump. The navigator is sticky, so a
         customer never loses it — but Playwright scrolls its target into view
         and the DOCK is fixed over the bottom 78 px, so a circle that happens
         to land there is reported as intercepted. Scrolling first asks the
         question this check is actually about (does the circle open its step)
         rather than the one about where the browser chose to put it. */
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(40);
      await p.click(`.steps__step[data-step="${k}"]`);
      await p.waitForTimeout(90);
      const now = await p.evaluate(() =>
        (document.querySelector('.sect:not([hidden])') || {}).dataset?.section);
      if (now !== k) fault(v.name, `the navigator's "${k}" circle opened "${now}"`);

      /* ── SEND AND PRICE EXIST ON THIS STEP, AND ON THIS SCREEN ────────
         `PLAN.md` §0: the product is an order Peretz can act on. A guided flow
         may sequence the questions; it may not put the answer out of reach.

         Measured before this check existed, on 28.8.2026: a `[data-wa]` was in
         the DOM at every step and VISIBLE at exactly one — the summary — so
         **24 of 27 step x viewport pairs had no send at all**. The price was
         fine at 27 of 27, which is worth writing down because the brief that
         sent me looking said it was buried too; it had moved onto the wall the
         day before and the brief was one revision stale.

         ⚠ IN THE DOM IS NOT ON THE SCREEN. `checkVisibility` answers the CSS
         question and the rect answers the geometry one; a control below the
         fold or behind a fixed bar is unreachable however much `display` it
         has, and this file has confused the two before.

         ⚠ AND EVERY COPY MUST CARRY THE SAME HREF. There are two send links
         now — the quiet one in the quote bar and the green one on the summary
         card — and two elements each holding their own idea of which door to
         send is CLAUDE.md §5's oldest shape. §5.8 is the version that bit:
         *"an assertion has to name the object, not the document."* One writer
         paints them both (`querySelectorAll('[data-wa]')` in `paint`), and
         this is the check that says so. The day somebody reaches for
         `getElementById` again, the other button goes stale and a customer
         sends Peretz a door they never built — silently. */
      const reach = await p.evaluate(() => {
        const on = el => {
          const r = el.getBoundingClientRect();
          const shown = typeof el.checkVisibility === 'function'
            ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : true;
          return shown && r.width > 0 && r.height > 0
            && r.bottom > 0 && r.right > 0
            && r.top < innerHeight && r.left < innerWidth;
        };
        const was = [...document.querySelectorAll('[data-wa]')];
        const price = document.querySelector('[data-price]');
        return {
          waTotal: was.length,
          waSeen: was.filter(on).length,
          hrefs: [...new Set(was.map(a => a.getAttribute('href') || ''))],
          priceSeen: !!price && on(price),
          priceText: price ? price.textContent.trim() : '',
        };
      });
      if (!reach.waSeen) {
        fault(v.name, `step "${k}": ${reach.waTotal} send button(s) in the DOM and `
          + 'NONE on screen — the customer cannot hand Peretz this door');
      }
      if (reach.hrefs.length > 1) {
        fault(v.name, `step "${k}": the ${reach.waTotal} send buttons point at `
          + `${reach.hrefs.length} DIFFERENT doors — one of them is lying`);
      }

      /* ── THE LABEL AND THE MESSAGE ARE ONE DECISION ───────────────────
         ⚠ AND THEY ARE SET BY TWO DIFFERENT MECHANISMS, WHICH IS THE WHOLE
         REASON THIS EXISTS. On a door nobody has touched the sends ask a
         question instead of claiming an order (`UX-FINDINGS` §5) — the LABEL
         comes from `html.is-untouched` in the stylesheet and the MESSAGE from
         `isUntouched(state)` in `js/share.js`. Two answers to one question,
         and §5 is a list of what that eventually does. `npm test` pins the
         message; this pins them to EACH OTHER, on the real page.

         The same shape as the check this file already makes one line up
         (`is-live` licensing "send the door" only once the href points at
         one), which was written after the label and the href said opposite
         things on every page load for the first second. */
      const say = await p.evaluate(() => {
        const el = document.querySelector('[data-wa]');
        if (!el) return null;
        const shown = [...el.querySelectorAll('span')]
          .filter(s => getComputedStyle(s).display !== 'none');
        return {
          asks: shown.some(s => s.classList.contains('wa__ask')),
          href: decodeURIComponent(el.getAttribute('href') || ''),
          label: shown.map(s => s.textContent.trim()).join(' / '),
        };
      });
      if (say) {
        const hrefAsks = say.href.includes('ויש לי שאלה');
        if (say.asks !== hrefAsks) {
          fault(v.name, `step "${k}": the send says "${say.label}" and its message `
            + `${hrefAsks ? 'asks a question' : 'claims a chosen door'} — the label `
            + 'and the message disagree');
        }
      }
      if (!reach.priceSeen || !reach.priceText || reach.priceText === '—') {
        fault(v.name, `step "${k}": no price on screen (read "${reach.priceText}")`);
      }

      /* ── AND ON THE SUMMARY, THE PRIMARY SEND ─────────────────────────
         ⚠ THE CHECK ABOVE PASSED WHILE THE MAIN SEND WAS OFF SCREEN, and how
         it passed is the lesson. It asks whether ANY `[data-wa]` is on the
         screen, and on the summary the floating 131 x 44 `.quote__send` chip
         always is — so the 228 x 51 green button this whole page exists to
         produce could sit **154 px below the fold at 1280x720** and this
         audit called it green. An assertion satisfied by a different object
         is CLAUDE.md §5.8 in its politest form.

         So this one NAMES the object: a `[data-wa]` that is not the chip.

         ⚠ AND IT ASSERTS ITS SELECTOR MATCHED (§5.15), in both directions. If
         `.quote__send` is renamed, "everything is the chip" silently becomes
         "nothing is", and a check that stops asking is worse than one that
         fails.

         ⚠ FULLY INSIDE, NOT MERELY INTERSECTING. The check above accepts a
         button one pixel of which is on screen. A send cut in half by the
         fold is not an affordance.

         Above 1100 px the primary itself must be whole — that is what moving
         it into the sticky `.sect__foot` buys, measured at 1280, 1440 and
         1920. Below 1100 the foot is not pinned and pinning it would put
         three bars of chrome on a 568 px screen (62 + 59 + 95 of 568), so
         there the requirement falls on the chip, which IS pinned — still
         stronger than what stood here, because it demands the whole control
         rather than a corner of it. The argument is in `placeSend`. */
      if (k === 'sum') {
        /* ⚠ AND IT WAITS FOR THE ENTRANCE ANIMATION, WHICH COST A FALSE RED
           AT FOUR VIEWPORTS BEFORE THIS LINE EXISTED. Reaching the summary
           runs the one flourish this page allows — `.is-reveal`, which fades
           `.btn--wa` in over half a second — so `checkVisibility({
           checkOpacity: true })` measured 0 and reported the send invisible
           while it was in exactly the right place. Measured: opacity 0 at
           120 ms, 0.25 at 400, 0.76 at 900. The class comes off on a 1000 ms
           timer, so this waits for its absence rather than for a duration,
           and gives up rather than hanging if it never clears — under
           `prefers-reduced-motion` and in bare mode the animation is cut to
           nothing and the class may not be added at all. */
        await p.waitForFunction(
          () => !document.documentElement.classList.contains('is-reveal'),
          null, { timeout: 3000 }).catch(() => {});
        await p.waitForTimeout(120);
        const send = await p.evaluate(() => {
          const whole = el => {
            const r = el.getBoundingClientRect();
            const shown = typeof el.checkVisibility === 'function'
              ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : true;
            return shown && r.width > 0 && r.height > 0
              && r.top >= 0 && r.left >= 0
              && r.bottom <= innerHeight && r.right <= innerWidth;
          };
          const was = [...document.querySelectorAll('[data-wa]')];
          const chips = was.filter(e => e.classList.contains('quote__send'));
          const primary = was.filter(e => !e.classList.contains('quote__send'));
          const box = primary[0] ? primary[0].getBoundingClientRect() : null;
          return {
            chips: chips.length,
            primary: primary.length,
            primaryWhole: primary.some(whole),
            chipWhole: chips.some(whole),
            below: box ? Math.round(Math.max(0, box.bottom - innerHeight)) : 0,
            wide: innerWidth >= 1100,
          };
        });
        if (!send.chips) {
          fault(v.name, 'the summary has no `.quote__send` chip — this check can '
            + 'no longer tell the primary send from the floating one');
        }
        if (!send.primary) {
          fault(v.name, 'the summary has no primary send at all — every [data-wa] '
            + 'on it is the floating chip');
        } else if (send.wide && !send.primaryWhole) {
          fault(v.name, 'the summary\'s primary send is not fully on screen'
            + (send.below ? ` — ${send.below} px below the fold` : '')
            + ' — the one action this page exists to produce');
        } else if (!send.wide && !send.chipWhole && !send.primaryWhole) {
          fault(v.name, 'the summary has no send fully on screen: the primary is '
            + `${send.below} px below the fold and the chip is not whole either`);
        }

        /* ── AND THE HANDING IS CONFIRMED, IN THE ORDER'S OWN WORDS ─────
           ⚠ `handing` IS THE ONLY DEFAULT IN THIS PRODUCT THAT COSTS MONEY TO
           GET WRONG, and the page answers it for the customer because the
           drawing has to draw something. Measured at 1280x720: on arrival the
           ONLY controls the fold cuts through are the two handing pills — so
           it is pre-answered and below the fold at once. The confirm row on
           the summary is the answer (`UX-FINDINGS` §2, option B; option A
           costs a `VERSION` bump for a third value in a packed index).

           Three things, and the third is the one that would rot quietly: the
           row is there, its control is WHOLE on screen at this viewport, and
           its sentence is `handingWords()` to the character — the same
           sentence the WhatsApp order carries. A confirmation phrased its own
           way is a second statement of the fact that matters most on this
           page, and §5's whole subject is what two statements of one fact
           eventually do. */
        const hand = await p.evaluate(() => {
          const row = document.querySelector('.sum-hand');
          const words = document.querySelector('[data-handing-words]');
          const flip = document.querySelector('.sum-hand__flip');
          if (!row || !words || !flip) return { missing: true };
          const r = flip.getBoundingClientRect();
          return {
            words: (words.textContent || '').trim(),
            whole: r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0
                   && r.bottom <= innerHeight && r.right <= innerWidth,
            tap: Math.min(Math.round(r.width), Math.round(r.height)),
            below: Math.round(Math.max(0, r.bottom - innerHeight)),
          };
        });
        if (hand.missing) {
          fault(v.name, 'the summary has no handing confirmation — the one default '
            + 'in this product that costs money to get wrong is answered for the '
            + 'customer and never put back to them');
        } else {
          if (!hand.whole) {
            fault(v.name, 'the handing confirmation is not fully on screen'
              + (hand.below ? ` — ${hand.below} px below the fold` : ''));
          }
          if (hand.tap < 44) {
            fault(v.name, `the handing confirm control is ${hand.tap} px on its short `
              + 'side, under the 44 px this project asserts everywhere');
          }
          const want = handingWords(DEFAULTS);
          if (hand.words !== want) {
            fault(v.name, 'the handing confirmation does not say what the ORDER says: '
              + `page "${hand.words}" against spec.js "${want}"`);
          }
        }
      }

      /* ── AND THE ANSWER IS ON SCREEN WITH THE QUESTION ────────────────
         ⚠ A GUIDED FLOW WHOSE LIVE STEP SHOWS NO OPTIONS IS NOT GUIDED, and
         nothing in this repository was asking. `npm run audit` proved a step
         was REACHABLE (the walk clicks the rail) and that its send and its
         price were on screen; it never asked whether the thing the step is FOR
         had made it above the fold.

         Measured the day this was written, at 320x568: rail 62 + stage 318 +
         eyebrow/title/lede ~160 + quote bar 62 = 602 of a 568 px screen, so on
         **every one of the eight question steps** a customer saw a door, a
         question, and nothing to answer it with. At 390 there was room for
         three rows of swatches, which is why looking at a phone had not found
         it — 390 is the phone people test on and 320 is the one they own.

         ⚠ This is the same shape as the way-on being below the fold (§0b,
         28.8): the audit could reach everything and had never asked what was
         VISIBLE. Two different questions again.

         One control is the bar, not all of them: a grid that needs scrolling
         is normal, a grid with nothing showing is not. The summary has no
         options and is excluded by name rather than by counting zero, so the
         day it grows some this check starts covering it. */
      if (k !== 'sum') {
        const answers = await p.evaluate(() => {
          const live = document.querySelector('.sect.is-live');
          if (!live) return { live: false };
          const opts = [...live.querySelectorAll(
            '.tile, .swatch, input[type="range"], select, .field button')];
          /* ⚠ THE FOLD IS NOT `innerHeight`, AND THE FIRST VERSION OF THIS
             CHECK BELIEVED IT WAS. The quote bar is FIXED over the bottom of a
             phone — 67 px at 320 — so a tile that ends behind it is exactly as
             unreachable as one below the screen. Measuring against the viewport
             reported the worst step as "1 px short" where the truth was 68.
             The send/price check above already says this in its own comment
             ("a control below the fold or behind a fixed bar is unreachable")
             and then measures against `innerHeight` anyway; this one asks the
             bar where it actually is. */
          const q = document.querySelector('.quote');
          const fold = (q && getComputedStyle(q).position === 'fixed')
            ? q.getBoundingClientRect().top : innerHeight;
          /* And 24 px, not one: a control needs about half a thumb showing to
             be a control. A 1 px sliver of a tile is not an answer on screen. */
          const on = el => {
            const r = el.getBoundingClientRect();
            const shown = typeof el.checkVisibility === 'function'
              ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : true;
            return shown && r.width > 0
              && Math.min(r.bottom, fold) - Math.max(r.top, 0) >= 24;
          };
          return { live: true, total: opts.length, seen: opts.filter(on).length };
        });
        /* ⚠ §5.15 — assert the selector found something. A step with no
           matching control at all is this check quietly retiring, not a step
           that happens to be fine. */
        if (!answers.live) {
          fault(v.name, `step "${k}": no .sect.is-live in the document — the `
            + 'check for "can you answer the question" has nothing to look at');
        } else if (!answers.total) {
          fault(v.name, `step "${k}": the live step contains no option control `
            + 'the selector recognises — either the step is empty or this '
            + 'check has stopped matching the markup');
        } else if (!answers.seen) {
          fault(v.name, `step "${k}": ${answers.total} options and NONE on `
            + 'screen — a customer sees the question and nothing to answer it with');
        }
      }

      /* ── AND THE CUE AGREES WITH THE OVERFLOW ─────────────────────────
         Above 1100 the page does not scroll and the panel does, so the fade
         over the foot is the only thing saying there is more of the step.
         It is CONDITIONAL, and a conditional cue has two ways to lie: absent
         over hidden content, or present over none. Both are faults here, and
         the second is the one that would never be reported from outside —
         nobody writes in to say a gradient promised them options that were
         not there.

         Read from the panel's own numbers, so this cannot agree with the page
         by sharing its arithmetic: `data-more` is set in `js/app.js`, and
         what is compared against it is `scrollHeight - clientHeight -
         scrollTop` measured here. */
      const cue = await p.evaluate(() => {
        const panel = document.querySelector('.panel--choose');
        if (!panel) return null;
        return {
          wide: innerWidth >= 1100,
          more: Math.round(panel.scrollHeight - panel.clientHeight - panel.scrollTop),
          flag: panel.hasAttribute('data-more'),
        };
      });
      if (cue && cue.wide) {
        if (cue.more > 8 && !cue.flag) {
          fault(v.name, `step "${k}": ${cue.more} px of the panel is below the `
            + 'fold and nothing on screen says so');
        }
        if (cue.more <= 8 && cue.flag) {
          fault(v.name, `step "${k}": the panel shows a "more below" fade over `
            + `${cue.more} px of nothing`);
        }
      }
    }

    await p.click('.steps__step');          // back to step 01 for the walk below
    await p.waitForTimeout(120);
  }

  /* WHAT IS HIDDEN MUST ACTUALLY BE GONE.
     `hidden` is only `display: none` in the UA stylesheet, so any author rule
     setting `display` on the element silently beats it. That happened: giving
     `.grip-bar__btn` `display: inline-flex` left `#grip-home` rendered at
     104x44 on every fresh load, visible and clickable, offering to undo a drag
     nobody had made. Reading `el.hidden` says `true` throughout — the property
     is not the picture — so this asks the BOX, which is the only thing a
     customer sees. Run before the bodies below are force-opened, or the
     unhiding this check exists to detect is done by the audit itself. */
  const ghosts = await p.evaluate(() => [...document.querySelectorAll('[hidden]')]
    .map(el => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 0 && r.height > 0)
    .map(({ el, r }) => `${el.id || el.className || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`));
  ghosts.forEach(g => fault(v.name, `marked hidden but still drawn: ${g}`));

  /* Tap targets, measured with every body OPEN at BOTH levels — a hidden
     element has no size, so measuring them closed would pass everything by
     measuring nothing. */
  /* ⚠ EVERY STEP UNHIDDEN, because a hidden element has no size and measuring
     tap targets on eight hidden steps would pass everything by measuring
     nothing. This used to unhide the two fold levels; there is one now. */
  await p.evaluate(() => {
    document.querySelectorAll('.sect').forEach(b => { b.hidden = false; });
  });
  /* DERIVED, not listed. This asked a hand-kept set of classes —
     [role="radio"], .btn, .iconbtn, .lang, .field__head — and the
     rotate button in the grip bar is on none of them, so it sat at 34px for
     three rounds with the check green beside it. Same staleness the group list
     above was already rewritten to avoid: a list of what to measure stops
     being true the moment somebody adds a control, and its symptom is silence.
     So: everything a person can operate, minus the one exemption that is real
     — a link inside a sentence, which WCAG 2.5.8 exempts because growing it
     would break the paragraph it sits in. Zero-size means not rendered. */
  const small = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(
      'button, a[href], input, select, [role="radio"], [role="button"]')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (el.closest('p')) continue;
      if (r.height < 44 || r.width < 44) {
        const cls = String(el.className || '').split(' ')[0];
        out.push(`${cls || el.tagName.toLowerCase()}:${el.dataset.id || el.id || el.textContent.trim().slice(0, 12)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return out;
  });
  small.forEach(s => fault(v.name, `tap target under 44px: ${s}`));

  /* ⚠ SIZE IS NOT THE ONLY WAY TWO CONTROLS FAIL A CUSTOMER. The undo/redo
     pair, the price and the language pair sit on `.stage__hud`, each with its
     own `flex: 0 0 auto` or `min-inline-size` floor, and nothing before this
     asked whether those floors leave them room to coexist. At 320-353px they
     did not: the price pill's own box overlapped the undo button's by up to
     33px, invisible to the check above because both elements individually
     measured ≥44px on their own. Found by looking at a screenshot, not by an
     assertion — which is the failure mode this exists to close.
     DERIVED, same discipline as `small` above: every pair of operable
     elements inside `.stage__hud`, not a named list of the three slots, so a
     fourth control added later is covered without anyone remembering to. */
  const hudOverlaps = await p.evaluate(() => {
    const hud = document.querySelector('.stage__hud');
    if (!hud) return [];
    const els = [...hud.querySelectorAll(
      'button, a[href], input, select, [role="radio"], [role="button"]')]
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width && r.height);
    const out = [];
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
      const a = els[i].r, b = els[j].r;
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 0 && oy > 0) {
        const name = el => String(el.className || '').split(' ')[0] || el.tagName.toLowerCase();
        out.push(`${name(els[i].el)} x ${name(els[j].el)}: ${Math.round(ox)}x${Math.round(oy)}px`);
      }
    }
    return out;
  });
  hudOverlaps.forEach(o => fault(v.name, `wall controls overlap: ${o}`));

  /* ⚠ AND PUT THEM BACK. Unhiding all nine steps to measure them leaves the
     panel nine steps tall, and the very next check asserts that the PAGE does
     not scroll above 1100 — which it then does, at all four desktop viewports,
     because the audit made it. The old version unhid the two fold levels
     inside a panel that scrolls internally and got away with it; nine whole
     steps is a different quantity. An instrument that changes the thing it is
     about to measure is worse than no instrument. */
  await p.evaluate(() => {
    const live = document.querySelector('.steps__step[aria-current]');
    const key = live && live.dataset.step;
    document.querySelectorAll('.sect').forEach(b => { b.hidden = b.dataset.section !== key; });
  });

  /* ⚠ NOTHING IN THIS FILE EVER SCROLLED THE PAGE, and that is how the stage
     came to be un-pinned at every width without a single instrument noticing.
     The sticky rule sat in a media query ABOVE the base rule that re-declares
     `position: relative` — a media query adds no specificity, so the later
     declaration won and the door was never pinned. Measured before the fix:
     computed `relative` at 390, 768 and 1099, and the stage 78 px off the top
     of a 390x844 screen by the time the colour grid was in reach. The one
     thing a configurator has to get right.
     Below 1100 the page scrolls and the door must stay; at and above it the
     panel scrolls instead and the page itself must not move at all. */
  {
    const s = await p.evaluate(async () => {
      window.scrollTo(0, 600);
      await new Promise(r => requestAnimationFrame(r));
      const el = document.querySelector('.stage-wrap');
      return { y: window.scrollY, pos: getComputedStyle(el).position,
               bottom: Math.round(el.getBoundingClientRect().bottom) };
    });
    if (v.w < 1100) {
      if (s.pos !== 'sticky') {
        fault(v.name, `.stage-wrap computes position:${s.pos}, not sticky — the door `
                    + 'scrolls away while the customer chooses');
      }
      if (s.y > 0 && s.bottom <= 0) {
        fault(v.name, `the door is entirely off screen (bottom ${s.bottom}px) after scrolling`);
      }
    } else if (s.y !== 0) {
      fault(v.name, `the page itself scrolled to ${s.y} at ${v.w}px — above 1100 the two `
                  + 'columns scroll and the page does not');
    }
    await p.evaluate(() => window.scrollTo(0, 0));
  }

  await p.reload();
  await p.waitForTimeout(300);

  const seen = new Map();
  for (const { key, section } of await groupsOn(p)) {
    const g = `.field[data-group="${key}"]`;
    /* Reach it the way a person does: go to its STEP. Clicking an option on a
       hidden step would still work through the DOM and would prove nothing
       about whether anyone can get to it — and "can anyone reach it" is the
       question this walk exists to ask.
       ⚠ ONE LEVEL NOW, NOT TWO. It used to open the section and then the
       category inside it, because the cabinet was two deep. A step holds one
       or two groups and shows them both. */
    await p.click(`.steps__step[data-step="${section}"]`);
    await p.waitForTimeout(70);
    const onStep = await p.$eval(`.sect[data-section="${section}"]`, el => !el.hidden);
    if (!onStep) { fault(v.name, `step ${section} would not open`); continue; }
    const opened = await p.$eval(`${g}`, el => el.getBoundingClientRect().height > 0);
    if (!opened) { fault(v.name, `${key} is on step ${section} and not visible`); continue; }

    const ids = await p.$$eval(`${g} [role="radio"]`, els => els.map(e => e.dataset.id));
    if (!ids.length) { fault(v.name, `${key} rendered no options`); continue; }

    for (const id of ids) {
      /* el.click(), not page.click(): options that the current design blocks
         carry aria-disabled, and Playwright's actionability check refuses to
         click those. A person still can — they are buttons, not `disabled`
         buttons, exactly so that keyboard and touch users are never walled
         off — so this drives them the way Enter on a focused button does. */
      await p.$eval(`${g} [data-id="${id}"]`, el => el.click());
      await p.waitForTimeout(30);

      const s = await p.evaluate(() => {
        const doc = document.documentElement;
        const svg = document.querySelector('#stage svg');
        const stage = document.getElementById('stage');
        const leaf = svg && svg.querySelector('#leaf rect');
        const lb = leaf && leaf.getBoundingClientRect();
        const sb = stage.getBoundingClientRect();
        return {
          overflowX: doc.scrollWidth - doc.clientWidth,
          hasSvg: !!svg,
          leaf: lb && { x: lb.x, y: lb.y, w: lb.width, h: lb.height },
          stage: { x: sb.x, y: sb.y, w: sb.width, h: sb.height },
          price: document.getElementById('price').textContent,
          /* EVERY copy of it. The card and the dock both carry `data-price`,
             and two elements each fetching their own copy of a number is the
             shape CLAUDE.md §5 is about. */
          prices: [...document.querySelectorAll('[data-price]')].map(e => e.textContent),
          code: document.getElementById('code').textContent,
          /* ⚠ EVERY SEND BUTTON, NOT `#wa-btn`. This named one element by id,
             which was harmless while there was one — and the day a second
             `[data-wa]` arrived it would have gone on measuring the old button
             and reported the page clean while the new one pointed at a door
             nobody chose. That is CLAUDE.md §5.8 exactly: *"an assertion has to
             name the object, not the document."* `was` is the whole set; the
             comparison below reads `was[0]` for the "did the link change with
             the door" question and the set's size for the "do they agree" one,
             so neither can be answered about a button that is not on the page. */
          was: [...document.querySelectorAll('[data-wa]')].map(a => a.getAttribute('href')),
          summary: document.getElementById('summary').textContent,
          /* The OTHER sink. `#summary` is one line under the price; `#spec` is
             the table a desktop customer actually proof-reads, row by row. */
          spec: [...document.querySelectorAll('#spec .spec__row')].map(r => ({
            key: r.dataset.key,
            value: (r.querySelector('.spec__value') || {}).textContent || '',
          })),
        };
      });

      if (!s.hasSvg) { fault(v.name, `${key}=${id}: no door rendered`); continue; }
      if (s.overflowX > 1) fault(v.name, `${key}=${id}: page scrolls sideways by ${s.overflowX}px`);
      if (!s.leaf || s.leaf.w < 20 || s.leaf.h < 40) {
        fault(v.name, `${key}=${id}: leaf is ${s.leaf ? `${Math.round(s.leaf.w)}x${Math.round(s.leaf.h)}` : 'missing'}`);
      } else {
        const clip = Math.max(0, s.stage.x - s.leaf.x, s.stage.y - s.leaf.y,
                              (s.leaf.x + s.leaf.w) - (s.stage.x + s.stage.w),
                              (s.leaf.y + s.leaf.h) - (s.stage.y + s.stage.h));
        if (clip > 1) fault(v.name, `${key}=${id}: the leaf is cut off by ${Math.round(clip)}px`);
      }
      if (!/\d/.test(s.price)) fault(v.name, `${key}=${id}: price reads "${s.price}"`);
      if (!CODE.test(s.code)) fault(v.name, `${key}=${id}: code reads "${s.code}"`);
      /* Every send button on the page, and they must agree — see the note on
         `was` above, and CLAUDE.md §5.8. A page with two send buttons pointing
         at two different doors passes every check written about one of them. */
      if (!s.was.length) fault(v.name, `${key}=${id}: there is no send button at all`);
      for (const href of s.was) {
        if (!href || !href.startsWith('https://')) {
          fault(v.name, `${key}=${id}: WhatsApp link is "${href}"`);
        }
      }
      if (new Set(s.was).size > 1) {
        fault(v.name, `${key}=${id}: ${s.was.length} send buttons point at `
          + `${new Set(s.was).size} different doors`);
      }
      if (!s.summary.trim()) fault(v.name, `${key}=${id}: the spec line is empty`);
      /* ⚠ AND IT MUST BE THE ROWS, not a fourth assembly of them. `npm test`
         proves `summaryLine(state)` is the rows; only a browser can prove that
         the line ON THE PAGE is `summaryLine(state)`. Four readers of one door
         disagreed twice and cost money, and the last one to be corrected was
         the one nobody sighted ever sees — so an assertion that reads only the
         source is this fix wearing the defect's clothes.
         The code carries all eight axes, so the state comes back without the
         page having to expose it. */
      const back = decodeCode(s.code);
      if (back && summaryLine(back) !== s.summary.trim()) {
        fault(v.name, `${key}=${id}: the spec line reads "${s.summary.trim()}" and `
                    + `the rows say "${summaryLine(back)}" — #summary has drifted `
                    + 'off js/spec.js');
      }
      /* ⚠ AND THE TABLE, for exactly the same reason one line up. The argument
         above was made for `#summary` and then a SECOND sink was built beside
         it in Stage 4 — the spec table — and nothing followed it here. Proved
         rather than assumed: appending a marker to the table's own renderer in
         `app.js` left `npm run audit` green and `npm test` failing only its
         sheet-staleness checks, which fire for any change to the page and say
         nothing about whether the table is right. So the table could show a
         customer one door while the order carried another, and the only
         instrument that can see the page was not looking.
         Row for row against `specRows`, because a table that agrees on the
         concatenation and disagrees on which row holds what is still wrong. */
      /* ⚠ AND THE PRICE, which is the number a customer decides on and the
         number Peretz is handed. This file asserted only that it CONTAINS A
         DIGIT and that it changed when the door did — so a render path that
         showed the wrong figure passed. Proved: adding 100 agorot inside
         `paint`'s own `[data-price]` loop left `npm run audit` green with every
         price on the page a shekel high, and `npm test` failing only its
         sheet-staleness checks, which fire for any change to the page.
         `npm test` proves `priceAgorot` is right; only a browser can prove the
         number ON THE PAGE is `priceAgorot`. Same argument as `#summary` and
         the spec table, on the one value where being wrong costs money
         directly — and the page shows it TWICE, in the card and in the dock,
         which is CLAUDE.md §5's own shape. */
      if (back) {
        const wantPrice = formatAgorot(priceAgorot(back));
        if (s.price.trim() !== wantPrice) {
          fault(v.name, `${key}=${id}: the price reads "${s.price.trim()}" and `
                      + `priceAgorot says "${wantPrice}" — #price has drifted off js/price.js`);
        }
        for (const [i, shown] of s.prices.entries()) {
          if (shown.trim() !== wantPrice) {
            fault(v.name, `${key}=${id}: [data-price] #${i} reads "${shown.trim()}" `
                        + `and the card says "${wantPrice}" — two copies of one number`);
            break;
          }
        }
      }

      if (back) {
        const want = specRows(back);
        if (s.spec.length !== want.length) {
          fault(v.name, `${key}=${id}: the spec table has ${s.spec.length} rows and `
                      + `js/spec.js says ${want.length}`);
        } else {
          for (let i = 0; i < want.length; i++) {
            const got = s.spec[i].value.replace(/\s+/g, ' ').trim();
            const exp = String(want[i].value).replace(/\s+/g, ' ').trim();
            if (s.spec[i].key !== want[i].key || got !== exp) {
              fault(v.name, `${key}=${id}: spec row ${i} on the page is `
                          + `"${s.spec[i].key}: ${got}" and js/spec.js says `
                          + `"${want[i].key}: ${exp}" — #spec has drifted off js/spec.js`);
              break;
            }
          }
        }
      }

      /* Two designs that differ must not share a code — that is an order for
         the wrong door, arriving by telephone with nothing to catch it. */
      const code = s.code;
      if (seen.has(code) && seen.get(code) !== s.summary) {
        fault(v.name, `${key}=${id}: code ${code} is shared with a different design`);
      }
      seen.set(code, s.summary);
    }
  }
  errs.forEach(e => fault(v.name, `console: ${e}`));
  if (!small.length && !errs.length) console.log('  clicked every option, clean');

  /* ── DRAGGING THE HANDLE ──────────────────────────────────────────
     Three faults, all reported from a phone and none of them visible to
     anything that renders SVG strings:

     the handle moved a couple of pixels and stopped, because `pointercancel`
     was wired to the same handler as `pointerup` and a mobile browser fires
     cancel the moment it thinks a gesture is a page scroll;

     it teleported while the finger was still down — the same line, since
     ending a drag is what commits and snaps it;

     and the target was four pixels of bar. The pad is drawn 120 mm across and
     grown to 44 real pixels by the page, so this asks the page and not the
     drawing.

     A cancel is dispatched deliberately here rather than hoped for. It is the
     one part of a touch drag that a desktop browser will not produce on its
     own, and it is the part that was broken. */
  {
    await p.goto(`file://${process.cwd()}/index.html?c=rb-9016d&w=tallwin&n=idan`
               + '&k=cylinder&d=panel&s=standard&h=right-in');
    await p.waitForTimeout(300);
    const gp = () => (p.url().match(/gp=([^&]*)/) || [])[1] || null;
    const pad = await p.$('[data-hitpad]');
    const box = pad && await pad.boundingBox();
    if (!box) fault(v.name, 'the handle has no touch target at all');
    else if (box.width < 44 || box.height < 44) {
      fault(v.name, `the handle's touch target is ${Math.round(box.width)}x`
                     + `${Math.round(box.height)} px, under the 44 minimum`);
    }

    /* AND WHAT YOU SEE IS THE HANDLE, which is a different claim from the one
       above and was in conflict with it for three rounds. The touch target has
       to be 44 px whatever the drawing is; the FOCUS RING has to be the size
       of the thing it is outlining. While both were one rect the browser drew
       its outline round the grown pad, and a 35 mm rod got a box 131 mm wide —
       reported from the outside, twice, as the hit box being huge.
       So: the ring may not be bigger than the art it rings. Checked on the
       GRAB bar, which is the case that goes wrong first because it is the one
       grip centred on the leaf rather than hung off the stile — a pad laid out
       symmetrically about the grip's axis lands beside it, not on it. */
    /* ⚠ AND THE ROTATED PULL, which is the case that was still wrong after the
       grab bar was fixed. A grip laid on its side has a pad 135 x 45 css px
       round art that is 135 x 24, so the pad's own edges show above and below
       it — which is what the browser's `outline: auto` traced. */
    const RINGS = [
      'c=rb-9016d&w=none&n=grab&k=coral&d=plain&s=standard&h=right-in',
      'c=rb-9016d&w=none&n=grab&k=coral&d=plain&s=standard&h=left-in',
      'c=rb-0097d&w=rect&n=shiran&k=cylinder&d=plain&s=standard&h=right-in&gp=285,1280,90',
      'c=rb-0097d&w=rect&n=shiran&k=cylinder&d=plain&s=standard&h=right-in',
    ];
    for (const hd of RINGS) {
      await p.goto(`file://${process.cwd()}/index.html?${hd}`);
      await p.waitForTimeout(250);
      const m = await p.evaluate(() => {
        const g = document.querySelector('.door-svg [data-hw="handle"]');
        const ring = g && g.querySelector('[data-chrome="focus"]');
        if (!ring) return null;
        const r = ring.getBoundingClientRect();
        let a = 1e9, z = -1e9, t = 1e9, u = -1e9;
        for (const el of g.querySelectorAll('rect,ellipse,circle,path')) {
          if (el.hasAttribute('data-hitpad') || el.hasAttribute('data-chrome')) continue;
          const b = el.getBoundingClientRect();
          if (!b.width || !b.height) continue;
          a = Math.min(a, b.x); z = Math.max(z, b.x + b.width);
          t = Math.min(t, b.y); u = Math.max(u, b.y + b.height);
        }
        return { ring: [r.x, r.y, r.width, r.height], art: [a, t, z - a, u - t] };
      });
      if (!m) { fault(v.name, `[${hd}] the handle has no focus ring to draw`); continue; }
      const slack = 4;
      if (m.ring[2] > m.art[2] + slack || m.ring[3] > m.art[3] + slack) {
        fault(v.name, `[${hd}] the focus ring is ${Math.round(m.ring[2])}x`
                     + `${Math.round(m.ring[3])} px round a handle that is only `
                     + `${Math.round(m.art[2])}x${Math.round(m.art[3])}`);
      }
      /* And it is ON the handle, not beside it. */
      if (m.ring[0] > m.art[0] + m.art[2] || m.ring[0] + m.ring[2] < m.art[0]
          || m.ring[1] > m.art[1] + m.art[3] || m.ring[1] + m.ring[3] < m.art[1]) {
        fault(v.name, `[${hd}] the focus ring does not overlap the handle it rings`);
      }

      /* ⚠ THE BROWSER'S OWN OUTLINE IS NOT CHECKED HERE, and that is
         deliberate. `outline: auto` on the group traces whichever child
         reaches furthest — the touch pad — so the ring can be perfect above
         and the customer still see a box; that is precisely the "lines left
         behind" fault. But it cannot be reproduced from a harness: Chromium
         reports focus-visible for a scripted `focus()` AND for a synthesised
         mouse press, so a check written here reads the state that was already
         suppressed and passes while the real one is broken. It did exactly
         that on the first attempt.
         A check that cannot fire is worse than no check, because it reads as a
         live rule. What catches this instead is the pixel comparison after a
         real drag, further down — which found it at 1,530 pixels. */
    }
    await p.goto(`file://${process.cwd()}/index.html?c=rb-9016d&w=tallwin&n=idan`
               + '&k=cylinder&d=panel&s=standard&h=right-in');
    await p.waitForTimeout(300);

    const g = await (await p.$('[data-hw="handle"]')).boundingBox();
    const cx = g.x + g.width / 2, cy = g.y + g.height / 2;

    /* A long drag must track every step of the way, not stop after the first. */
    await p.mouse.move(cx, cy);
    await p.mouse.down();
    const seen = [];
    for (const dy of [20, 70, 140, 220]) {
      await p.mouse.move(cx, cy + dy);
      seen.push(await p.$eval('[data-hw="handle"]', e => e.getAttribute('transform')));
    }
    await p.mouse.up();
    await p.waitForTimeout(400);
    if (new Set(seen).size < seen.length) {
      fault(v.name, `a 220 px drag tracked ${new Set(seen).size} of ${seen.length} moves`);
    }
    if (!gp()) fault(v.name, 'a completed drag did not move the handle');

    /* And an interrupted one must change nothing. */
    const before = gp();
    const g2 = await (await p.$('[data-hw="handle"]')).boundingBox();
    await p.mouse.move(g2.x + g2.width / 2, g2.y + g2.height / 2);
    await p.mouse.down();
    await p.mouse.move(g2.x + g2.width / 2 - 30, g2.y + g2.height / 2 - 120, { steps: 5 });
    await p.evaluate(() =>
      window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true })));
    await p.waitForTimeout(300);
    await p.mouse.up();
    await p.waitForTimeout(300);
    if (gp() !== before) {
      fault(v.name, `a cancelled drag moved the handle anyway (${before} -> ${gp()})`);
    }
    if (await p.$eval('[data-hw="handle"]', e => e.getAttribute('transform'))) {
      fault(v.name, 'a cancelled drag left the handle displaced');
    }
    if (!faults) console.log('  the handle drags, and a cancelled drag changes nothing');
  }

  /* ── A DRAG LEAVES NOTHING BEHIND ─────────────────────────────────
     The strongest form of the check above, and the one that would have caught
     all three reports of a visible box round the handle: drag it about, then
     load the RESULTING LINK fresh and compare the two pictures pixel for
     pixel. A shared link is the door; if the screen after a drag is not the
     screen that link produces, something is on the door that is not part of
     it.
     It found the browser's own focus outline sitting round the touch pad after
     every drop — 1,530 pixels, four grey lines above and below the handle.
     Once at one viewport: this is about the drag, not the layout, and it costs
     two navigations and two screenshots. */
  if (v.name === 'laptop') {
    /* ⚠ A WIDE DOOR WITH `ron`, AND IT USED TO BE A STANDARD ONE WITH `shiran`.
       Peretz withdrew the Shiran on 26.8.2026 and its id now resolves to
       `idan`, a 1050 mm bar — and `gripCanRotate` hides `#grip-rot` for any
       bar longer than the leaf is wide, so on a standard door the button this
       step clicks is `hidden` and the click waited thirty seconds for it.

       ⚠ AND THE REAL FINDING IS BIGGER THAN THE TEST. Swept after the
       withdrawal: NO grip can be rotated on a standard, narrow, tall, half or
       sidelight door any more. Only `ron` and `barblack` on רחבה, and four
       bars on the new רחבה וגבוהה. The Shiran was the one short grip in the
       range, so it was quietly the only thing making that control reachable on
       the door most people buy. That is a product consequence of a product
       decision, not a bug — recorded in CLAUDE.md rather than worked around —
       and this step now runs on a door where the button genuinely exists. */
    /* ⚠ AND `s=wide` BECAME `s=extra2` ON 30.8.2026, FOR THE SAME REASON ONE
       LEVEL ON. The size list is two families of three bands now, and the
       merged חריגה is the MIDPOINT of the רחבה and גבוהה it replaces — so its
       leaf is 925 mm where רחבה's was 1000, and `ron` (a 900 mm bar) no longer
       turns on it. Swept after the change: `barblack` alone rotates on חריגה,
       and `ella`, `nitzan`, `ron` and `barblack` on חריגה שנייה. Nothing
       rotates on a standard door or a plain דו כנפי, which has been true since
       the Shiran was withdrawn.
       ⚠ WRITTEN AS THE LIVE ID, NOT THE ALIAS. `s=wide` still resolves —
       `SIZE_ALIAS` points it at `extra1` — so this link would have gone on
       loading a real door and waiting thirty seconds for a button that is
       correctly hidden. An alias keeps a CUSTOMER's link working; a test
       should name the thing it means. */
    await p.goto(`file://${process.cwd()}/index.html`
               + '?c=rb-0097d&w=rect&g=none&n=ron&k=cylinder&d=panel&s=extra2&h=right-in'
               /* ⚠ `d=panel`: a square light always takes a bottom panel now
                  (Peretz), so `d=plain` here arrives REPAIRED — and this step
                  compares the screen after a drag against a fresh load of its
                  own link, which is a comparison a repaired arrival muddies. */);
    await p.waitForTimeout(350);
    await p.click('#grip-rot');
    await p.waitForTimeout(300);
    const leaf = await p.$eval('#leaf rect', e => {
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y),
               width: Math.round(r.width), height: Math.round(r.height) };
    });
    const gb = await (await p.$('[data-hw="handle"]')).boundingBox();
    const cx = gb.x + gb.width / 2, cy = gb.y + gb.height / 2;
    await p.mouse.move(cx, cy);
    await p.mouse.down();
    for (const d of [-40, -120, -200, -120, -30]) {
      await p.mouse.move(cx, cy + d);
      await p.waitForTimeout(60);
    }
    await p.mouse.up();
    await p.waitForTimeout(450);
    const url = p.url();
    await p.screenshot({ path: '/tmp/audit-dragged.png', clip: leaf });
    await p.goto(url);
    /* ⚠ 1100 ms, NOT 500. A fresh load runs the arrival animation — the door
       assembles over 900 ms — and a screenshot taken at 500 catches the frame
       and the fittings mid-fade, which this check then reports as "something is
       on the door that the link does not carry". It said 928 pixels the first
       time motion landed. The comparison is about what the DOOR is, not about
       when the browser got round to drawing it. */
    await p.waitForTimeout(1100);
    await p.screenshot({ path: '/tmp/audit-fresh.png', clip: leaf });

    const A = load('/tmp/audit-dragged.png'), B = load('/tmp/audit-fresh.png');
    let diff = 0;
    for (let i = 0; i < Math.min(A.d.length, B.d.length); i += 4) {
      if (Math.abs(A.d[i] - B.d[i]) + Math.abs(A.d[i + 1] - B.d[i + 1])
        + Math.abs(A.d[i + 2] - B.d[i + 2]) > 18) diff++;
    }
    /* A hair of slack for antialiasing on the handle's own edges; the fault
       this exists for was fifteen hundred pixels. */
    if (diff > 120) {
      fault(v.name, `after a drag the door differs from a fresh load of its own link `
                  + `by ${diff} pixels — something is on the door that the link does not carry`);
    }
    if (!faults) console.log('  and a drag leaves the door exactly as its own link draws it');
  }

  /* ── THE WHOLE THING FROM THE KEYBOARD ────────────────────────────
     Nothing anywhere had ever pressed a key. The audit clicks, the fuzzer
     clicks, the suite renders strings — so the roving tabindex and the
     arrow-key grid in app.js were carried by nobody, on a page whose entire
     content is a two-deep fold of buttons.
     Driven the way a person does it: tab to a section, open it, tab to a
     category, open it, arrow around inside the options. `role="radio"` in a
     radiogroup means selection FOLLOWS focus, so an arrow key must change the
     DOOR — that is the assertion, and not that Enter does something, because
     on an already-selected option Enter is correctly a no-op.
     Run at every viewport: what is reachable depends on what is rendered, and
     the panel is laid out differently on a phone. */
  {
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.waitForTimeout(300);

    /* ⚠ TAB TO A NAVIGATOR CIRCLE, NOT TO A SECTION HEADING. The headings are
       `<h2>`s now: nothing folds, so a `<button>` that toggles nothing would
       be a control lying to a screen reader about being interactive. What a
       keyboard user tabs to instead is the navigator, which is where the
       page's own structure lives.
       Tab until one has focus rather than counting presses — the header's
       links come first and there is no reason for this check to know how many
       of them there are. */
    let head = null;
    for (let i = 0; i < 20 && !head; i++) {
      await p.keyboard.press('Tab');
      head = await p.evaluate(() => {
        const a = document.activeElement;
        return a && a.classList && a.classList.contains('steps__step') ? a.dataset.step : null;
      });
    }
    if (!head) fault(v.name, 'no navigator circle can be reached with Tab');
    else {
      /* ⚠ ENTER GOES TO THAT STEP, and this replaced "Enter toggles a section",
         which itself replaced "Enter opens it" when the desktop started
         arriving with all four open. A flow has no toggle: pressing Enter on a
         circle takes you there, and the assertion is that the live step
         becomes the one the circle names. One direction, no device dependency,
         and no breakpoint to know about. */
      await p.keyboard.press('Enter');
      await p.waitForTimeout(180);
      const live = await p.evaluate(() =>
        (document.querySelector('.sect:not([hidden])') || {}).dataset?.section);
      if (live !== head) {
        fault(v.name, `Enter on the "${head}" navigator circle opened "${live}"`);
      }

      /* And from there, Tab must reach the options on that step — with no fold
         in between, which is the whole ergonomic point of the change. */
      let hops = 0, first = null;
      while (hops++ < 24 && !first) {
        await p.keyboard.press('Tab');
        await p.waitForTimeout(30);
        first = await p.evaluate(() =>
          document.activeElement.getAttribute('role') === 'radio'
            ? document.activeElement.dataset.id : null);
      }
      if (!first) fault(v.name, 'Tab from a navigator circle does not reach an option');
      else {
        const codeBefore = await p.$eval('#code', e => e.textContent);
        await p.keyboard.press('ArrowLeft');
        await p.waitForTimeout(200);
        const moved = await p.evaluate(() => document.activeElement.dataset.id);
        const codeMid = await p.$eval('#code', e => e.textContent);
        if (moved === first) fault(v.name, 'an arrow key does not move between options');
        /* ⚠ RESTATED, NOT DELETED. This used to require the opposite — that
           arrowing CHANGE the door, selection-follows-focus. It does not any
           more, and the reason is a measurement: `choose` runs `repair`, which
           reaches across axes, so simply BROWSING the face-design list with the
           arrow keys removed a window and its ironwork, ₪1,540 of door, and
           arrowing back did not restore it. A keyboard user could not look at a
           list without destroying work that a mouse user beside them can browse
           freely. So the two halves are asserted separately: an arrow MUST NOT
           change the door, and Enter MUST. */
        if (codeMid !== codeBefore) {
          fault(v.name, `arrowing from ${first} to ${moved} changed the door — a keyboard `
                      + 'user cannot browse a list without altering it');
        }
        await p.keyboard.press('Enter');
        await p.waitForTimeout(200);
        const codeAfter = await p.$eval('#code', e => e.textContent);
        if (codeAfter === codeBefore) {
          fault(v.name, `Enter on the focused option ${moved} left the door unchanged`);
        }
        const checked = await p.evaluate(() =>
          document.activeElement.getAttribute('aria-checked'));
        if (checked !== 'true') {
          fault(v.name, `the chosen option reads aria-checked="${checked}" after Enter`);
        }
        /* And it has to be VISIBLE that it is focused. */
        const ring = await p.evaluate(() => {
          const cs = getComputedStyle(document.activeElement);
          return { style: cs.outlineStyle, shadow: cs.boxShadow };
        });
        if (ring.style === 'none' && ring.shadow === 'none') {
          fault(v.name, 'a focused option draws no focus ring at all');
        }
      }
    }
    if (!faults) console.log('  and the whole thing works from the keyboard');
  }

  /* ── CHOOSING A HANDLE MUST NOT RESIZE THE DOOR ───────────────────
     The grip controls are `hidden` until the door has a pull handle, and they
     used to sit in the page's flow under the stage — which on desktop is the
     flexible row above them. So picking a handle made the row appear and the
     door shrank, reported from the outside in exactly those words. Nothing
     here was looking: every check in this file measures one state at a time.
     Two states, one measurement. And the controls now stand in the wall beside
     the door, so the second half is that they have to CLEAR it — at every size,
     because a sidelight is far wider than a narrow leaf and the wall it leaves
     on a 320 px phone is the case that goes wrong. */
  {
    const TAP = 44;                       // the tap floor, as everywhere else
    const leafHeight = async q => {
      await p.goto(`file://${process.cwd()}/index.html?${q}`);
      await p.waitForTimeout(350);
      return p.$eval('#leaf rect', e => Math.round(e.getBoundingClientRect().height));
    };
    const stem = 'c=rb-0097d&w=none&g=none&k=cylinder&d=plain&h=right-in';
    /* `sidelight` was withdrawn 27.8.2026; `half` is the two-leaf door that
       survived and is what this check was really about. */
    for (const size of ['standard', 'half']) {
      const bare = await leafHeight(`${stem}&s=${size}&n=none`);
      const held = await leafHeight(`${stem}&s=${size}&n=shiran`);
      if (bare !== held) {
        fault(v.name, `choosing a pull handle resized the door on ${size}: `
                    + `the leaf went from ${bare} px to ${held}`);
      }
    }

    /* Every size there is — read off `SIZES` rather than listed, so a
       withdrawal cannot leave this sweep quietly testing a door that no
       longer exists. `narrow` and `sidelight` left on 27.8.2026 and this
       line was the only place still naming them. */
    for (const size of Object.keys(SIZES)) {
      await p.goto(`file://${process.cwd()}/index.html?${stem}&s=${size}&n=shiran`);
      await p.waitForTimeout(350);
      const m = await p.evaluate(() => {
        const gb = document.getElementById('grip-bar');
        if (gb.hidden) return null;
        const g = gb.getBoundingClientRect();
        const f = document.querySelector('.door-svg #frame').getBoundingClientRect();
        const cs = getComputedStyle(gb);
        const pad = parseFloat(cs.paddingInlineStart) + parseFloat(cs.paddingInlineEnd);
        return { g: [g.x, g.x + g.width, g.width], f: [f.x, f.x + f.width],
                 floor: 44 + pad };
      });
      if (!m) { fault(v.name, `no grip controls on a ${size} door carrying a pull`); continue; }
      /* Half a pixel of slack: these are laid out from a measured `--wall` and
         a rounded css pixel is not a collision. */
      if (!(m.g[1] <= m.f[0] + 0.5 || m.g[0] >= m.f[1] - 0.5)) {
        fault(v.name, `the grip controls sit on the ${size} door: `
                    + `${Math.round(m.g[0])}..${Math.round(m.g[1])} against a frame at `
                    + `${Math.round(m.f[0])}..${Math.round(m.f[1])}`);
      }
      /* And they have to stay wide enough to be a control rather than a
         sliver, which is the other way a measured width can go wrong.

         ⚠ THE FLOOR IS DERIVED FROM THE BUTTON, NOT PICKED. It was a literal
         56, and 56 is the wrong number: the bar carries its own padding on
         both sides, so a 56 px bar holds a 40 px button — under the 44 px tap
         floor this file enforces everywhere else. Two statements of one
         quantity, disagreeing, which is CLAUDE.md §5.10. The bar's real floor
         is 44 plus its padding, read off the element rather than assumed, so
         changing the padding cannot silently lower the bar this check will
         accept. Equal-or-stronger: on a phone the padding is 6, so the floor
         is 56 as before; above 1100 it is 8 and the floor rises to 60. */
      if (m.g[2] < m.floor) {
        fault(v.name, `the grip controls are ${Math.round(m.g[2])} px wide on ${size}, `
                    + `and ${Math.round(m.floor)} is the floor `
                    + `(a ${TAP}px button inside ${Math.round((m.floor - TAP) / 2)}px of padding)`);
      }
      /* ⚠ AND IT IS THE BAR'S INNER WIDTH THAT IS MEASURED, NOT THE BUTTONS.
         Measuring the buttons directly reads better and is a check that goes
         DEAD: `#grip-rot` is hidden on a door whose grip cannot turn and
         `#grip-home` on a door nobody has dragged, so on most states there is
         nothing to measure and the loop passes by finding zero buttons —
         §5.15's exact failure. The bar's inner width is the same question in
         a form that always has an answer. */
    }
    if (!faults) console.log('  the door keeps its size when it gains a handle, '
                           + 'and the controls stand clear of it');
  }

  /* ── AND THE FURNITURE IN THE WALL DOES NOT COVER ITSELF ────────────
     ⚠ THE WALL IS A SHARED SURFACE AND NOTHING WAS MEASURING IT AS ONE.
     Three things stand in the plaster beside the door — the price chip with
     its send, the undo/redo circles and the grip controls — and every one is
     `position: absolute` against a stage whose width moves with the viewport
     AND with the choices column. Widening that column to 440 on 31.8 put the
     chip on top of `#grip-rot` at 1440x900, and the only thing that noticed
     was Playwright refusing to click a button it could plainly see.

     This asks the browser the question a finger asks: at each control's own
     centre, whatever is on top must BE that control. That is not the same
     question as "do the boxes overlap" — two boxes can share a rectangle and
     both still be pressable, and the geometric checks above already cover the
     overlap case.

     ⚠ AND IT LOADS A DOOR THAT HAS THE CONTROLS. The first version of this
     ran on whatever door the step walk left behind, which is the DEFAULT —
     and the grip controls are hidden there, so it measured nothing and passed
     everywhere. §5.15 again, in the check written to catch a §5.15 fault.
     The URL is the drag test's own, which carries a Ron bar on an extra2
     leaf: the widest door in the range beside the narrowest wall.

     ⚠ AND TWO VIEWPORTS ARE EXEMPT FOR `#grip-rot`, WITH THE MEASUREMENT.
     At `cusp` (1100x800) and `narrow-d` (1152x800) the price chip already
     covers that button, and it did before this change: measured on real page
     loads at the shipped 380 cap and again at 400 and 420, identical every
     time. The arithmetic says why — the wall there is 140-152 px and the chip
     is **163 px wide**, so the two cannot sit side by side at any cap. That
     is a decision about which piece of furniture yields, and both were placed
     by the owner with circles on a screenshot (`CLAUDE.md` §0a), so it is
     recorded in §9 rather than settled here.
     ⚠ NAMING THE TWO VIEWPORTS AND THE ONE CONTROL IS THE POINT. A blanket
     skip would have hidden the 1440x900 regression that prompted this check,
     and the exemption shrinks the day the chip does. */
  {
    await p.goto(`file://${process.cwd()}/index.html`
               + '?c=rb-0097d&w=rect&g=none&n=ron&k=cylinder&d=panel&s=extra2&h=right-in');
    await p.waitForTimeout(400);
    const wall = await p.evaluate(() => {
      const seen = [], bad = [];
      for (const sel of ['#grip-rot', '#grip-home', '#price-toggle', '#quote-wa',
                         '#undo-btn', '#redo-btn']) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;    // hidden controls have no hit test
        seen.push(sel);
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (top && top !== el && !el.contains(top)) {
          bad.push(`${sel} is covered by ${top.id || top.className || top.tagName}`);
        }
      }
      return { seen, bad };
    });
    /* §5.15: the door above was chosen BECAUSE it shows the grip controls. If
       it stops showing them this check has quietly become an empty loop. */
    if (!wall.seen.includes('#grip-rot')) {
      fault(v.name, 'the wall check found no grip controls on a door that carries '
        + 'a rotatable bar — it is measuring nothing');
    }
    for (const b of wall.bad) {
      if ((v.name === 'narrow-d' || v.name === 'cusp')
          && b.startsWith('#grip-rot')) continue;
      fault(v.name, `a control in the wall cannot be pressed: ${b}`);
    }
  }

  await p.close();
  } catch (e) {
    if (!crashed(e)) throw e;          // a real failure, reported as one
    faults = faultsBefore;             // half an audit is not an audit
    crashes++;
    skipped.push(v.name);
    console.log(`  ⚠ chromium died at ${v.w}x${v.h} — this viewport was NOT audited`);
    await b.close().catch(() => {});
    b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  }
}

/* ── A PAGE THAT CANNOT START HAS TO LOOK LIKE ONE ──────────────────
 *
 * Measured before this existed, Chromium with scripting off at 390x844: the
 * page came up complete — brand, price card, fine print, two full-width green
 * WhatsApp buttons — with `#stage` empty, `#price` and `#code` both "—",
 * `#choices` with no children, and both buttons pointing at `#`. Styled,
 * professional and entirely inert, with no way for a customer to tell it from
 * a page still loading. The header telephone number was the only thing on it
 * that worked.
 *
 * FOUR routes get here and every one of them is checked, because three of them
 * were found by asking "what else produces that screen" rather than by
 * reasoning forward from the first:
 *
 *   happy         nothing degraded, the door drawn, the real message offered
 *   scripting off the browser applies the <noscript> stylesheet
 *   init() threw  `guard`/`fail` in app.js injects the same stylesheet
 *   bundle 404    scripting is ON so <noscript> is inert and no handler was
 *                 ever registered — the inline check after the bundle tag is
 *                 the only thing that catches it. A bad deploy, a poisoned
 *                 cache, a CSP or a parse error all land here, and this repo
 *                 already has a test group about a stale bundle reaching a
 *                 returning browser, so it is not hypothetical.
 *
 * The predicate is DERIVED, not a list of expected strings: an element is
 * lying if it is on screen and still showing its placeholder. That way a panel
 * added to the page later is covered without anybody remembering to add it
 * here — the failure mode AGENT-LOG run 8 is about.
 */
{
  const URL = `file://${process.cwd()}/index.html`;
  const probe = pg => pg.evaluate(() => {
    /* `__rect` is the pristine getBoundingClientRect stashed by the fault
       injection before it broke the real one. A probe that breaks with the
       page measures nothing. */
    const rect = e => (window.__rect ? window.__rect.call(e) : e.getBoundingClientRect());
    const vis = sel => { const e = document.querySelector(sel);
      if (!e) return false; const r = rect(e);
      return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== 'none'; };
    const lying = [];
    for (const sel of ['#stage', '#choices']) {
      const e = document.querySelector(sel);
      if (e && vis(sel) && !e.children.length) lying.push(sel);
    }
    for (const sel of ['#price', '#summary', '#code']) {
      const e = document.querySelector(sel);
      const t = e && e.textContent.trim();
      if (vis(sel) && (!t || t === '—')) lying.push(sel);
    }
    return {
      down: vis('#down'),
      lying,
      dead: [...document.querySelectorAll('[data-wa]')]
        .filter(a => !/^https:\/\/wa\.me\//.test(a.getAttribute('href') || '')).length,
      /* ⚠ RESTATED 31.8, AND STRICTLY STRONGER THAN THE LINE IT REPLACES.
         This asked for a visible `.wa__on`, which was a fair proxy for "the
         page came up live" while the button had two states. It has three now:
         on a door nobody has touched the send asks a question instead of
         claiming an order (`UX-FINDINGS` §5), so `.wa__on` is hidden on a
         perfectly working arrival and the old wording read that as broken.

         What the check MEANS is "the page came up live and is offering the
         WhatsApp channel with an honest label" — either of the two live
         labels will do. And the half it never asked is added here: the
         DEAD label must not be showing at the same time. `.wa__off` is the
         "the page did not load for me" wording, and a page displaying both is
         the label/href contradiction this route exists to catch. */
      promising: [...document.querySelectorAll('.wa__on, .wa__ask')]
        .filter(e => getComputedStyle(e).display !== 'none').length,
      resting: [...document.querySelectorAll('.wa__off')]
        .filter(e => getComputedStyle(e).display !== 'none').length,
    };
  });

  /* ── THE TWO SURFACES THIS AUDIT COULD NOT SEE ────────────────────
     The gallery and the order sheet shipped with nothing in this file driving
     either of them, so the audit printed "no faults" about a round that added
     two whole screens. The first thing it finds is the reason it exists.

     ⚠ EVERY DOOR ON A PAGE NEEDS ITS OWN SVG IDS. `render()` emits fixed ones
     — `leafFill`, `keyWash`, `retNear` and fifty-five more — and `url(#x)`
     resolves to the FIRST element with that id in the document. That is
     correct for a page with one door and silently wrong for a grid of thirty:
     the gallery shipped painting every tile in the first tile's colour, and
     nothing here could have noticed. This is the check that would have. */
  {
    console.log('\nthe gallery, and the order sheet');
    const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
    await pg.goto(URL);
    await pg.waitForTimeout(600);
    await pg.evaluate(() => document.querySelector('#works-btn').click());
    await pg.waitForTimeout(900);

    const gal = await pg.evaluate(() => {
      const dlg = document.querySelector('#works');
      const tiles = [...document.querySelectorAll('.work')];
      const drawn = tiles.filter(t => t.querySelector('svg'));
      /* Collect the ids of every drawn tile and count the ones that appear in
         more than one. Any repeat means a tile is painting with another
         tile's gradients. */
      const seen = new Map();
      for (const t of drawn) {
        for (const el of t.querySelectorAll('[id]')) {
          seen.set(el.id, (seen.get(el.id) || 0) + 1);
        }
      }
      const shared = [...seen.entries()].filter(([, n]) => n > 1);
      /* And every reference must resolve INSIDE its own tile. */
      let dangling = 0;
      for (const t of drawn) {
        const ids = new Set([...t.querySelectorAll('[id]')].map(e => e.id));
        for (const el of t.querySelectorAll('*')) {
          for (const a of el.attributes) {
            const m = /^url\(#(.+)\)$/.exec(a.value);
            if (m && !ids.has(m[1])) dangling++;
          }
        }
      }
      const small = tiles.filter(t => {
        const r = t.getBoundingClientRect();
        return r.width && r.height && (r.width < 44 || r.height < 44);
      }).length;
      return {
        open: dlg && dlg.open, tiles: tiles.length, drawn: drawn.length,
        shared: shared.length, sharedSample: shared.slice(0, 4).map(([k]) => k),
        dangling, small,
        unnamed: tiles.filter(t => !(t.getAttribute('aria-label') || '').trim()).length,
      };
    });

    if (!gal.open) fault('gallery', 'the gallery button does not open the dialog');
    if (!gal.tiles) fault('gallery', 'the gallery has no doors in it');
    if (!gal.drawn) fault('gallery', 'no door in the gallery was drawn');
    if (gal.shared) {
      fault('gallery', `${gal.shared} SVG id(s) are shared between gallery tiles `
                     + `(${gal.sharedSample.join(', ')}) — every tile after the first `
                     + 'paints with the first one\'s gradients');
    }
    if (gal.dangling) {
      fault('gallery', `${gal.dangling} url(#…) reference(s) in the gallery point outside `
                     + 'their own tile');
    }
    if (gal.small) fault('gallery', `${gal.small} gallery tile(s) under 44px`);
    if (gal.unnamed) fault('gallery', `${gal.unnamed} gallery tile(s) have no accessible name`);
    if (!gal.shared && !gal.dangling && gal.drawn) {
      console.log(`  ${gal.drawn} of ${gal.tiles} doors drawn, each with its own ids`);
    }

    /* Escape has to close it. `showModal` gives that for free — which is the
       argument for using it — so this is really asking whether it is still a
       modal dialog rather than a div wearing one. */
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(200);
    if (await pg.evaluate(() => document.querySelector('#works').open)) {
      fault('gallery', 'Escape does not close the gallery');
    }
    await pg.close();

    const sheetPg = await b.newPage({ viewport: { width: 794, height: 1123 } });
    /* ⚠ THIS ROUTE DID NOT LISTEN, AND THE PAGE WAS THROWING. Every other
       route in this file collects `pageerror`; the sheet did not, and
       `fitStage` had been raising two uncaught TypeErrors on every load of
       the document Peretz orders from — for long enough that nobody knows
       when it started. A route that drives a page without listening to it
       reports "the sheet is fine" about a page that is on fire. */
    const sheetErrs = [];
    sheetPg.on('pageerror', e => sheetErrs.push(String(e)));
    sheetPg.on('console', m => { if (m.type() === 'error') sheetErrs.push(m.text()); });
    await sheetPg.goto(`${URL}?sheet=1&c=rb-6219d&w=rect&g=iron&n=idan`
                     + '&k=cylinder&d=panel&s=sidelight&h=left-in');
    await sheetPg.waitForTimeout(700);
    if (sheetErrs.length) {
      fault('sheet', `${sheetErrs.length} uncaught error(s) building the order sheet: `
                   + sheetErrs.slice(0, 2).join(' · '));
    }

    /* ⚠ AND THE SHEET IN A LANGUAGE PERETZ DOES NOT READ STILL CARRIES THE
       HEBREW. This is the one document on the site with two readers — the
       customer proof-reads it, Peretz orders from it — so it prints both.
       See `buildSheet`. */
    const ruPg = await b.newPage({ viewport: { width: 794, height: 1123 } });
    await ruPg.goto(`${URL}?sheet=1&lang=ru&c=rb-6219d&w=rect&g=iron&n=idan`
                  + '&k=cylinder&d=panel&s=sidelight&h=left-in');
    await ruPg.waitForTimeout(600);
    const ru = await ruPg.evaluate(() => ({
      cyrillic: /[\u0400-\u04FF]/.test(document.querySelector('#sheet')?.textContent || ''),
      hebrewGlosses: document.querySelectorAll('#sheet .sheet__he').length,
      hebrew: /[\u0590-\u05FF]/.test(document.querySelector('#sheet')?.textContent || ''),
    }));
    if (!ru.cyrillic) fault('sheet', 'a Russian order sheet has no Russian on it — the customer cannot proof-read it');
    if (!ru.hebrew || ru.hebrewGlosses < 8) {
      fault('sheet', `a Russian order sheet carries ${ru.hebrewGlosses} Hebrew lines — Peretz `
                   + 'orders from this document and cannot read it');
    }
    await ruPg.close();
    const sheet = await sheetPg.evaluate(() => {
      const box = document.querySelector('#sheet');
      const svgs = box ? box.querySelectorAll('svg') : [];
      const ids = new Set(), dupes = [];
      for (const el of document.querySelectorAll('[id]')) {
        if (ids.has(el.id)) dupes.push(el.id); else ids.add(el.id);
      }
      const notice = document.querySelector('#notice');
      return {
        drawn: svgs.length,
        h1: document.querySelectorAll('h1').length,
        text: box ? box.textContent : '',
        dupes: dupes.length,
        configuratorVisible: [...document.querySelectorAll('.layout, .steps, .stage__hud')]
          .filter(e => getComputedStyle(e).display !== 'none').length,
        noticeShowing: notice && !notice.hidden,
      };
    });
    if (!sheet.drawn) fault('sheet', '?sheet=1 draws no door');
    if (sheet.h1 !== 1) fault('sheet', `the order sheet has ${sheet.h1} <h1> — a printed `
                                     + 'document with no heading is one nobody can navigate');
    if (sheet.dupes) fault('sheet', `${sheet.dupes} duplicated id(s) on the sheet page`);
    if (sheet.configuratorVisible) {
      fault('sheet', `${sheet.configuratorVisible} configurator element(s) still showing on `
                   + 'the order sheet');
    }
    if (!/DM-/.test(sheet.text)) fault('sheet', 'the order sheet carries no design code');
    if (!/מבחוץ/.test(sheet.text)) {
      fault('sheet', 'the order sheet does not say which side you are standing on — the '
                   + 'ambiguity that had this site building mirrored doors');
    }
    if (sheet.noticeShowing) {
      fault('sheet', 'the unknown-parameter strip is up on a legitimate ?sheet=1 URL');
    }
    if (!faults) console.log('  the order sheet prints a door, a code and an unambiguous opening');
    await sheetPg.close();
  }

  const routes = [
    ['happy', async () => { const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
        await pg.goto(URL); await pg.waitForTimeout(700); return pg; }],
    ['no-js', async () => { const c = await b.newContext(
          { javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
        const pg = await c.newPage(); await pg.goto(URL); await pg.waitForTimeout(400); return pg; }],
    ['init-threw', async () => { const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
        /* Break something `init()` needs WITHOUT breaking `getElementById`,
           which `degrade()` itself calls — an injection that disables the
           recovery is testing nothing. */
        await pg.addInitScript(() => {
          window.__rect = Element.prototype.getBoundingClientRect;
          Object.defineProperty(Element.prototype, 'getBoundingClientRect',
            { value: () => { throw new Error('injected'); } });
        });
        pg.on('pageerror', () => {});   // expected: `fail` rethrows on purpose
        await pg.goto(URL); await pg.waitForTimeout(700); return pg; }],
    ['bundle-404', async () => { const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
        await pg.route('**/bundle.js*', r => r.abort());
        await pg.goto(URL); await pg.waitForTimeout(700); return pg; }],
    /* ⚠ A FIFTH ROUTE, and it is the saved-designs feature's own. Reading
       `localStorage` THROWS rather than returning null in a private window
       with site data blocked, so an unguarded read at boot takes the whole
       page down — and by everything above, "down" here means styled, complete
       and inert. A convenience for holding two doors side by side is not
       permitted to cost the site, so this route must come up NORMAL: the door
       drawn, the price real, nothing degraded. */
    ['no-storage', async () => { const c = await b.newContext({ viewport: { width: 390, height: 844 } });
        await c.addInitScript(() => {
          Object.defineProperty(window, 'localStorage',
            { get() { throw new Error('site data blocked'); } });
        });
        const pg = await c.newPage();
        await pg.goto(URL); await pg.waitForTimeout(700); return pg; }],
    /* ⚠ A SIXTH: THE STYLESHEET NOT ARRIVING. This file already carries a
       luminance check whose own comment names the symptom — "Every door came
       up on a black ground" — and had no route that produced it. Measured with
       app.css aborted and nothing else touched: ground fill rgb(0,0,0),
       luminance 0 against 243 on the happy path, because an SVG `fill` set to
       a CSS variable that does not resolve paints black.
       Like `no-storage`, this must come up NORMAL. The page is unstyled but
       usable, and the phone link and both wa.me links survive — the customer
       can still reach the shop, which is the half that matters. The renderer
       carries `var(--wall, #F5F3EF)` fallbacks now so the room survives too. */
    ['css-404', async () => { const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
        await pg.route('**/app.css*', r => r.abort());
        await pg.goto(URL); await pg.waitForTimeout(700); return pg; }],
    /* ⚠ A SEVENTH: THE BUNDLE STALLING RATHER THAN FAILING. `bundle-404`
       aborts, and an abort RESOLVES — which is the only reason the inline
       guard placed after the script tag catches it. A stall never resolves, so
       that guard never runs: a dead cell, a captive portal, a proxy holding
       the socket. Measured, the page sat at 3s, 8s and 15s showing brand,
       headline, an empty stage, "מחיר משוער —" and two green send buttons.
       index.html arms a 4s timer for exactly this; the wait here is past it. */
    ['bundle-stalls', async () => { const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
        await pg.route('**/bundle.js*', () => { /* deliberately never settles */ });
        await pg.goto(URL, { waitUntil: 'commit' }); await pg.waitForTimeout(5200); return pg; }],
    /* ⚠ AN EIGHTH: THE PHOTOGRAPHED ROOM NOT ARRIVING. `assets/room.webp` is
       the fourth file this site has, and the first one it does not need.
       PHOTOREAL.md §1 makes that a requirement rather than a hope — the drawn
       wall, floor and sconces stay in the SVG and are the automatic fallback —
       so this joins the routes that must come up NORMAL. What is specific to
       it is asserted below the loop: `.is-photo` never goes on, and the drawn
       `#backdrop` is still painting.
       ⚠ It produces one console error and that is the route working, not a
       nuisance: it BLOCKS the file, so a failed load is the condition under
       test. `pageerror` is still fatal here; only the aborted request is
       expected, and it is expected by URL rather than by kind — see the note
       over the font tag in index.html for why an instrument taught to ignore a
       CLASS of error will one day ignore the real one. */
    ['no-photo', async () => { const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
        await pg.route('**/room.webp*', r => r.abort());
        await pg.goto(URL); await pg.waitForTimeout(1000); return pg; }],
  ];

  console.log('\nthe page cannot come up styled and inert');
  for (const [name, open] of routes) {
    const pg = await open();
    const r = await probe(pg);
    if (r.lying.length) {
      fault(name, `${r.lying.join(', ')} on screen still showing a placeholder — `
                + 'the page looks finished and is not');
    }
    if (r.dead) fault(name, `${r.dead} send button(s) do not point at wa.me`);
    /* `css-404` and `no-photo` join the routes that must come up NORMAL:
       losing the stylesheet costs the page its looks and nothing else, and
       losing the photograph costs it the staging and nothing else. */
    if (name === 'happy' || name === 'no-storage' || name === 'css-404'
        || name === 'no-photo') {
      if (r.down) fault(name, 'the "cannot load" strip is showing on a working page');
      if (!r.promising) fault(name, 'a working page offers neither to send the door '
        + 'nor to ask about it — both live labels are hidden');
      /* ⚠ EXCEPT ON `css-404`, WHERE NOTHING IS HIDDEN BECAUSE THERE IS NO
         STYLESHEET TO HIDE IT. All three labels show at once there, and that
         is what an unstyled page IS — the route exists to prove the page is
         still usable without its looks, not that it still has them. Named
         rather than skipped by a general rule, so the day a fourth label
         appears this line is where somebody has to think about it. */
      if (r.resting && name !== 'css-404') {
        fault(name, 'a working page is still showing the "the page did not load '
          + 'for me" label beside a live one');
      }
    } else {
      if (!r.down) fault(name, 'nothing tells the customer the door did not load');
      if (r.promising) {
        fault(name, 'the button still promises to send a door there is no door for');
      }
      if (!r.resting) fault(name, 'a broken page is not showing the resting label '
        + 'either — the button says nothing at all');
    }
    /* ⚠ AND THE SPECIFIC THING ABOUT `no-photo`: the drawn room takes over.
       The route above only asks whether the page is usable; this asks whether
       the FALLBACK actually happened. Without it the route would pass on a
       page whose stage was a blank rectangle where the room should be, because
       a blank rectangle has a working price and a working send button.
       Both halves are asserted: `.is-photo` must NOT be on (nothing hides the
       backdrop) and `#backdrop` must be painting (it is really there). */
    if (name === 'no-photo') {
      const f = await pg.evaluate(() => {
        const bd = document.querySelector('#stage #backdrop');
        return { on: document.documentElement.classList.contains('is-photo'),
                 has: !!bd, shown: bd ? getComputedStyle(bd).display !== 'none' : false };
      });
      if (f.on) fault(name, 'is-photo went on with no photograph to show');
      if (!f.has) fault(name, 'the drawn room is not in the document at all');
      else if (!f.shown) fault(name, 'the drawn room is hidden and there is no photograph — '
                                   + 'the stage is empty');
    }
    await pg.close();
  }
  if (!faults) console.log('  a page that cannot start says so, and still reaches Peretz');
}

/* ═══════════════════════════════════════════════════════════════════
   THE PHOTOGRAPH'S FLOOR LINE IS THE DRAWING'S FLOOR LINE.
   ═══════════════════════════════════════════════════════════════════
   PHOTOREAL.md §3: *"The photo's wall/floor junction must coincide with the
   SVG's baseY at every viewport. One constant, measured once per backdrop,
   asserted in the audit (the drawn shadow must land ON the photo floor, not
   above/below it)."*

   ⚠ MEASURED IN PIXELS, NOT IN THE CONSTANTS THAT PRODUCED THEM. The obvious
   check compares the number `fitStage` computed against the number `PHOTO`
   holds, and it would pass with the picture upside down: two readings of one
   arithmetic is CLAUDE.md §5's whole subject. So this screenshots the stage,
   finds the strongest horizontal luminance step in the bottom fifth of a
   column of WALL well clear of the door, and compares that with where the
   drawing says its floor is.

   ⚠ The column has to dodge the chrome as well as the door. Written first
   without the "bottom fifth" bound, it found the price pill's edge at 1100 px
   and reported the floor line 239 px out — a check failing about the wrong
   object is a check nobody will trust twice.

   Falsifiable: change `PHOTO.floor` in app.js by 0.01 and this fires at every
   viewport (14 px at a 1440 desktop against a 4 px tolerance). */
{
  console.log('\nthe photographed floor is the floor the door stands on');
  const TOL = 4;                     // px. The measured spread is 0.3–1.7.
  /* ⚠ ITS OWN NAME, for the reason spelled out under T11 below: the `URL` the
     failure-routes block uses is scoped to that block, and reaching for it out
     of scope does not throw — it silently yields the WHATWG `URL` class. */
  const PAGE = 'file://' + process.cwd() + '/index.html';
  for (const v of VIEWS) {
    if (skipped.includes(v.name)) continue;
    const pg = await b.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1 });
    await pg.goto(PAGE);
    await pg.waitForTimeout(1100);
    const g = await pg.evaluate(() => {
      if (!document.documentElement.classList.contains('is-photo')) return null;
      const st = document.querySelector('#stage');
      const svg = st && st.querySelector('svg');
      if (!svg) return null;
      const r = st.getBoundingClientRect();
      const fr = st.querySelector('#frame').getBoundingClientRect();
      const vb = svg.getAttribute('viewBox').split(/\s+/).map(Number);
      const baseY = Number(svg.dataset.baseY);
      if (!Number.isFinite(baseY)) return { noBase: true };
      return { x: r.x, y: r.y, w: r.width, h: r.height,
               frL: fr.x - r.x, frR: fr.x - r.x + fr.width, frW: fr.width,
               drawn: (baseY - vb[1]) * (r.height / vb[3]) };
    });
    if (!g) { fault(v.name, 'photo-mode did not come up, so the calibration cannot be read'); await pg.close(); continue; }
    if (g.noBase) { fault(v.name, 'the drawing publishes no data-base-y — the page cannot place the room'); await pg.close(); continue; }
    /* ⚠ THE CHROME COMES OFF BEFORE THE PHOTOGRAPH IS MEASURED, and the first
       version of this check did not do that and failed about the wrong object
       — for the second time in one evening. The trust band's scrim was built
       to start exactly AT the floor line, so its own gradient edge sits a few
       pixels below the skirting it is aligned to, and this detector locked
       onto the scrim instead: 4.2 px at `cusp` and 4.7 px at `wide` against a
       4 px gate, with the error growing in proportion to the stage, which is
       the signature of measuring a thing that scales rather than a thing that
       is fixed.
       This is not teaching the instrument to ignore a kind of fault. It is
       taking an occluding object out of the frame before photographing what is
       behind it, which is exactly what `?bare=1` does for the drawing.
       `visibility`, not `display`, so nothing reflows and the stage keeps the
       size the rest of this block already measured. */
    await pg.addStyleTag({ content:
      '.trust, .stage__hud, .quote, .hint, .grip-bar, .toast '
      + '{ visibility: hidden !important; }' });
    await pg.waitForTimeout(60);
    await pg.screenshot({ path: '/tmp/audit-floor.png',
      clip: { x: g.x, y: g.y, width: g.w, height: g.h } });
    const im = load('/tmp/audit-floor.png');
    const at = (x, y) => lum(im.d, ((y | 0) * im.w + (x | 0)) * 4);
    /* ⚠ SAMPLED BESIDE THE DOOR, WITHIN ONE DOOR-WIDTH — and the first version
       took ONE column halfway out to the edge of the stage, which is the third
       time tonight this check measured the wrong object.
       It reported the floor 38.7 px out at 1680 and 16.8 at 1920×918, both on
       the wide crop, and the page was right: `tools/_bd2.mjs` re-measured both
       SHIPPED assets and got exactly the constants the code holds — 83.87% and
       87.93%, residual 1.2 px over 231 and 336 agreeing columns. What differs
       is that the wide crop shows far more dappled floor, and a single column
       out near the edge lands in it and finds a foliage edge.
       The constant was measured in the picture's CENTRE HALF for precisely
       that reason, so the check now looks where the constant came from: the
       band of floor immediately either side of the casing, a door-width wide,
       per-column argmax, median of what agrees. Measured across both rooms and
       all eight viewports it reads −0.5 to +1.3 px.
       ⚠ THE TOLERANCE DID NOT MOVE. It is 4 px, as it was when the check was
       written; what changed is where the instrument points. Widening a gate to
       fit a reading is how a real misalignment would have got through. */
    const cols = [];
    for (let x = Math.round(g.frR + 16); x < Math.min(im.w - 6, g.frR + 16 + g.frW); x += 3) cols.push(x);
    for (let x = Math.max(6, Math.round(g.frL - 16 - g.frW)); x < g.frL - 16; x += 3) cols.push(x);
    const ys = [];
    for (const x of cols) {
      let s = -1, sy = -1;
      for (let y = Math.round(im.h * 0.80); y < im.h - 6; y++) {
        let a = 0, c = 0;
        for (let k = 1; k <= 4; k++) { a += at(x, y - k); c += at(x, y + k); }
        const d = Math.abs(a - c) / 4;
        if (d > s) { s = d; sy = y; }
      }
      if (s > 5) ys.push(sy);
    }
    ys.sort((a, c) => a - c);
    const bestY = ys.length ? ys[ys.length >> 1] : -1;
    const best = ys.length;                 // how many columns found a step at all
    const delta = bestY - g.drawn;
    if (best < 8) {
      fault(v.name, `only ${best} column(s) beside the door found a wall/floor step `
                  + '— the room is not where the page thinks it is, or this check has '
                  + 'stopped being able to see the floor');
    } else if (Math.abs(delta) > TOL) {
      fault(v.name, `the photographed floor is ${delta.toFixed(1)} px from the drawn one `
                  + `(tolerance ${TOL}) — the door is standing above or below the ground`);
    } else {
      console.log(`  ${v.name.padEnd(14)} floor line agrees to ${Math.abs(delta).toFixed(1)} px`);
    }
    await pg.close();
  }
}

/* ═══════════════════════════════════════════════════════════════════
   THE ROOM KEEPS ITS LAMPS, AND THE PRICE STAYS IN THE PICTURE.
   ═══════════════════════════════════════════════════════════════════
   Reported from outside off a 1920×918 screenshot, in four words: *the room
   has no lamps.* Both faults in it were one fault. The portrait crop is scaled
   by WIDTH to cover a wide stage, which makes it 2053 px tall inside a 783 px
   hole; everything above the pinned floor line climbs out of the top, the
   sconces went with it (measured: the band sat at y −173 to −52), and the
   price card — which hangs off `--lamp-b` — faithfully followed its lamp out
   of the stage and landed on the language buttons, 6,288 px² of overlap.

   ⚠ THE CHECK THAT LET IT THROUGH TESTED ONE AXIS. The spike asked whether the
   sconces were far enough apart HORIZONTALLY for the widest door to clear
   them, decided the portrait was the better crop on that basis, and never
   asked where they were vertically. So this asks for the whole rectangle, on
   both counts, in pixels off the rendered page:

     · the right-hand sconce is wholly inside the stage, with a lamp's height
       of wall above it — a fitting jammed against the top edge reads as
       cropped whether or not it is, which is the criterion `pickRoom` uses
     · the price card is inside the stage and touches no part of the chrome
       standing on the wall beside it

   ⚠ AND IT KNOWS WHICH ROOM IS UP. Two crops ship and `js/app.js` chooses by
   measuring; a check that assumed one of them would be asserting about a
   picture that is not on screen — which is how the original went wrong. It
   reads the file out of the computed `background-image` and takes that room's
   own constants. */
{
  console.log('\nthe room keeps its lamps, and the price stays in the picture');
  /* Fractions of each ORIGINAL, measured in `tools/_bd2.mjs`. The same numbers
     are in `js/app.js`'s ROOMS — deliberately, because an instrument that
     borrows the implementation's own table cannot notice the table changing,
     and CLAUDE.md §7 says so in as many words. */
  const ROOMS = {
    'room.webp':      { floor: 1214.5 / 1448, lampTop: 573 / 1448, lampBot: 659 / 1448, lampCx: 450 / 1086 },
    'room-wide.webp': { floor: 827.4 / 941,   lampTop: 326 / 941,  lampBot: 402 / 941,  lampCx: 452.5 / 1672 },
  };
  const PAGE = 'file://' + process.cwd() + '/index.html';
  for (const v of VIEWS) {
    if (skipped.includes(v.name)) continue;
    const pg = await b.newPage({ viewport: { width: v.w, height: v.h } });
    await pg.goto(PAGE);
    await pg.waitForTimeout(1300);
    const r = await pg.evaluate(() => {
      const st = document.querySelector('#stage');
      if (!st) return { none: true };
      const cs = getComputedStyle(st), box = st.getBoundingClientRect();
      const file = (cs.backgroundImage.match(/([a-z0-9-]+\.webp)/) || [])[1] || null;
      const q = document.querySelector('.quote');
      const qFixed = q && getComputedStyle(q).position === 'fixed';
      const qr = q ? q.getBoundingClientRect() : null;
      const ov = (a, c) => (a && c)
        ? Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left))
        * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top)) : 0;
      const hud = [...document.querySelectorAll('.stage__hud .hud__slot')]
        .map(e => e.getBoundingClientRect());
      return {
        photo: document.documentElement.classList.contains('is-photo'),
        file,
        w: parseFloat(cs.backgroundSize),
        h: parseFloat(cs.backgroundSize.split(' ')[1]),
        top: parseFloat(cs.backgroundPositionY),
        boxW: box.width, boxH: box.height, boxT: box.top, boxB: box.bottom,
        qFixed, qTop: qr ? qr.top : null, qBot: qr ? qr.bottom : null,
        hudOverlap: Math.round(hud.reduce((s, x) => s + ov(qr, x), 0)),
        hudCount: hud.length,
      };
    });
    await pg.close();
    if (r.none || !r.photo) { fault(v.name, 'photo-mode did not come up, so the room cannot be checked'); continue; }
    const room = ROOMS[r.file];
    /* ⚠ §5.15 — a file this check does not know about is a check that has
       stopped asking, not a page that is fine. */
    if (!room) {
      fault(v.name, `the stage is showing "${r.file}", which this check has no `
        + 'constants for — a room was added or renamed and nothing here noticed');
      continue;
    }
    const lampTop = r.top + room.lampTop * r.h;
    const lampBot = r.top + room.lampBot * r.h;
    const lampH = lampBot - lampTop;
    const lampX = r.boxW / 2 + room.lampCx * r.w;
    if (lampTop < lampH) {
      fault(v.name, `the room's sconces are at y ${lampTop.toFixed(0)}..${lampBot.toFixed(0)} `
        + `of a ${r.boxH.toFixed(0)} px stage — less than their own height of wall above them, `
        + 'so they read as cropped. The room is the wrong crop for this shape');
    } else if (lampBot > r.boxH || lampX + r.w * 0.02 > r.boxW) {
      fault(v.name, `the room's sconces fall outside the stage (y ${lampTop.toFixed(0)}..`
        + `${lampBot.toFixed(0)}, x ${lampX.toFixed(0)} of ${r.boxW.toFixed(0)})`);
    }
    /* The quote bar is FIXED at the foot of the screen below 1100 and hung on
       the wall above it. Only the wall placement can leave the picture. */
    if (!r.qFixed) {
      if (r.qTop < r.boxT - 1 || r.qBot > r.boxB + 1) {
        fault(v.name, `the price card is outside the stage (${Math.round(r.boxT - r.qTop)} px above `
          + 'its top) — it is anchored to a lamp and the lamp left the frame');
      }
      if (!r.hudCount) {
        fault(v.name, 'no .hud__slot on the wall — the overlap check has nothing to compare against');
      } else if (r.hudOverlap > 0) {
        fault(v.name, `the price card covers ${r.hudOverlap} px² of the wall chrome `
          + '(the language buttons, or undo/redo)');
      }
    }
    if (!faults) { /* keep the log quiet on a clean run */ }
  }
  if (!faults) console.log('  every stage: lamps whole, price card inside the picture, chrome clear');
}

/* ═══════════════════════════════════════════════════════════════════
   T11 — A LINK IS A DOOR TO LOOK AT, NOT A FORM TO FILL IN.
   ═══════════════════════════════════════════════════════════════════
   TRANSFORM.md §10.5. Somebody following a shared link is not designing a
   door, they are LOOKING at one — Peretz most of all, who opens these off
   WhatsApp to price them. Landing him on `01 ⁄ 08 · מבנה הדלת` with a size
   picker makes him hunt for the door he was sent. A bare load is the opposite
   and must start at step 01, which is asserted at every viewport above.

   Both halves matter and only the bare half was checked. Asserted for the
   full query AND for `?d=CODE` typed on its own, because they are two
   different paths into `fromQuery` and the short code is the one Peretz reads
   down the telephone. */
{
  console.log('\n  a shared link arrives at the quote page');
  /* ⚠ ITS OWN NAME, NOT `URL`. The `URL` this file uses elsewhere is scoped to
     the failure-routes block above, and `URL` is ALSO a global — the WHATWG
     class. Reaching for it out of scope does not throw; it silently yields
     `function URL() { [native code] }` and every navigation below would go to
     a nonsense path and quietly fail to be the check it claims to be. */
  const HOME = `file://${process.cwd()}/index.html`;
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  const arrivals = [
    ['a full query', '?v=18&c=rb-9016d&w=rect&d=panel&k=coral&s=wide&h=left-in'],
    ['a short code', null],
    ['a bare load',  ''],
  ];
  for (const [what, q] of arrivals) {
    let query = q;
    if (query === null) {
      /* Read the code off a built door rather than typing one: a literal here
         would go stale the next time VERSION moves, and it would go stale
         SILENTLY — an unreadable code lands on the default door, at step 01,
         which is exactly the failure this check is looking for. */
      await pg.goto(`${HOME}?v=18&c=rb-9016d&w=rect&d=panel&k=coral&s=wide&h=left-in`);
      await pg.waitForTimeout(400);
      const code = await pg.evaluate(() => document.querySelector('#code')?.textContent);
      query = `?d=${code}`;
    }
    await pg.goto(HOME + query);
    await pg.waitForTimeout(500);
    const at = await pg.evaluate(() => ({
      live: (document.querySelector('.sect:not([hidden])') || {}).dataset?.section,
      notice: !document.querySelector('#notice')?.hidden,
    }));
    const want = query === '' ? 'fit' : 'sum';
    if (at.live !== want) {
      fault('arrival', `${what} lands on step "${at.live}", want "${want}" — ${
        want === 'sum'
          ? 'somebody following a link is looking at a door, not building one'
          : 'a customer starting fresh belongs at step 01'}`);
    }
    if (at.notice) fault('arrival', `${what} raised a notice on a door that is buildable`);
  }
  if (!faults) console.log('    a link opens the door; a bare load opens step 01');
  await pg.close();
}

/* ═══════════════════════════════════════════════════════════════════
   THE HINGE TRAP — PLAN.md §6.1, and the one check this phase exists for.
   ═══════════════════════════════════════════════════════════════════
   Hebrew sets `dir="rtl"` on `<html>`; English and Russian set `ltr`. Every
   logical property in the stylesheet mirrors with it, which is what they are
   for. THE DOOR MUST NOT. A right-hinged door is a physical fact about an
   object somebody hangs in a wall, and a drawing that flipped with the
   stylesheet would show one hinge side while Peretz built the other.

   `npm test` asserts the SVG STRING is byte-identical across the three; this
   asserts the RENDERED GEOMETRY is, which is the thing a stylesheet can move
   and a string cannot see. `transform: scaleX(-1)` on any ancestor, a
   `direction` that reached the SVG, an absolutely-positioned overlay that
   flipped its inset — none of those change one byte of `render()` and all of
   them put the cylinder on the wrong side of the leaf.

   Measured against the LEAF'S OWN CENTRE rather than the viewport, so a
   layout that legitimately moves the whole stage does not read as a mirrored
   door. */
{
  console.log('\n  languages');
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const read = () => pg.evaluate(() => {
    const leaf = document.querySelector('.door-svg #leaf');
    const lock = document.querySelector('.door-svg [data-hw="lockset"]');
    if (!leaf || !lock) return null;
    const l = leaf.getBoundingClientRect(), k = lock.getBoundingClientRect();
    return {
      dir: document.documentElement.dir,
      lang: document.documentElement.lang,
      /* -1 .. +1 across the leaf. Sign is the whole answer. */
      side: ((k.left + k.width / 2) - (l.left + l.width / 2)) / (l.width / 2),
      h1: document.querySelector('.stage__h1 [data-t]')?.textContent?.trim(),
      /* Glyphs in the order a human's eye meets them, not in string order. */
      priceGlyphs: (() => {
        const t = document.querySelector('#price')?.firstChild;
        if (!t || t.nodeType !== 3) return null;
        const r = document.createRange(), out = [];
        for (let i = 0; i < t.length; i++) {
          r.setStart(t, i); r.setEnd(t, i + 1);
          const box = r.getBoundingClientRect();
          if (box.width) out.push([box.left, t.data[i]]);
        }
        return out.sort((a, b2) => a[0] - b2[0]).map(m => m[1]).join('');
      })(),
      langBtns: document.querySelectorAll('.lang').length,
    };
  });

  const seen = {};
  for (const id of ['he', 'en', 'ru']) {
    /* ⚠ `k=coral` IS NOT DECORATION. The page opens on a BARE door — no lock
       furniture at all, which is what Peretz asked for — so `[data-hw=
       "lockset"]` does not exist on arrival and the mirror check would have
       measured nothing and reported "no door", passing quietly for as long as
       nobody read the message. The one part of the drawing that names a side
       has to be on the door before you can ask which side it is on. */
    await pg.goto('file://' + process.cwd() + `/index.html?lang=${id}&k=coral`);
    await pg.waitForTimeout(400);
    seen[id] = await read();
    if (!seen[id]) { fault('languages', `${id}: no door on the page to measure`); continue; }
    if (seen[id].lang !== id) fault('languages', `?lang=${id} left <html lang> at "${seen[id].lang}"`);
    const wantDir = id === 'he' ? 'rtl' : 'ltr';
    if (seen[id].dir !== wantDir) fault('languages', `${id}: <html dir> is "${seen[id].dir}", want "${wantDir}"`);
    if (seen[id].langBtns !== 3) fault('languages', `${id}: ${seen[id].langBtns} language buttons, want 3`);
  }

  if (seen.he && seen.en && seen.ru) {
    for (const id of ['en', 'ru']) {
      const drift = Math.abs(seen[id].side - seen.he.side);
      if (Math.sign(seen[id].side) !== Math.sign(seen.he.side)) {
        fault('languages', `THE DOOR MIRRORED IN ${id}. The cylinder is at `
          + `${seen[id].side.toFixed(3)} across the leaf and at ${seen.he.side.toFixed(3)} in `
          + 'Hebrew — opposite sides. This is PLAN.md §6.1: the interface mirrors and the '
          + 'door must not, or the site shows one hinge side and Peretz builds the other');
      } else if (drift > 0.02) {
        fault('languages', `${id}: the cylinder sits ${drift.toFixed(3)} of a half-leaf away `
          + 'from where Hebrew puts it — the door is not mirrored but it has moved');
      }
    }
    /* ⚠ AND THE PRICE HAS ONE SHAPE. `Intl`'s `he-IL` currency format wraps
       the shekel in U+200F marks, so the bidi algorithm moved the symbol to
       the far side of the digits on the English page — `3,150₪` against
       Hebrew's `₪ 3,150`, one door and two prices, and the string is
       identical in both. Only a rendered page can see this, which is why it
       is measured here in GLYPHS SORTED BY THEIR REAL x POSITION rather than
       compared as text. */
    for (const id of ['en', 'ru']) {
      if (seen[id].priceGlyphs !== seen.he.priceGlyphs) {
        fault('languages', `the price READS "${seen[id].priceGlyphs}" in ${id} and `
          + `"${seen.he.priceGlyphs}" in Hebrew — the same figure is being painted in two `
          + 'shapes, and the customer screenshots one while Peretz reads the other');
      }
    }

    /* And the words DID change, or nothing was translated and the check above
       is measuring the same page three times. */
    if (seen.he.h1 === seen.en.h1) {
      fault('languages', 'the stage heading is identical in Hebrew and English — nothing was '
        + 'translated, which would make the mirror check above vacuous');
    }
  }

  /* Switching in the page, rather than by URL: the same rebuild path a
     customer takes, and the one that keeps their half-built door. */
  await pg.goto('file://' + process.cwd() + '/index.html?lang=he&c=rb-9016d');
  await pg.waitForTimeout(400);
  const before = await pg.evaluate(() => document.querySelector('#code')?.textContent);
  await pg.evaluate(() => [...document.querySelectorAll('.lang')]
    .find(b => b.lang === 'en')?.click());
  await pg.waitForTimeout(400);
  const after = await pg.evaluate(() => ({
    code: document.querySelector('#code')?.textContent,
    dir: document.documentElement.dir,
    live: document.querySelectorAll('.sect:not([hidden])').length,
  }));
  if (after.code !== before) {
    fault('languages', `switching language changed the DOOR: the code went ${before} -> `
      + `${after.code}. Changing language must keep what the customer built`);
  }

  /* ⚠ NOT ONE HEBREW WORD SURVIVES A SWITCH TO ENGLISH, AND NOTHING IS
     BUILT TWICE. Both were reported from one screenshot: *"when i change
     the language it doesnt change the language on all the text"* and *"at
     the bottom of the screen the categories get repeated, and the 30 doors
     button too."* One cause — `buildPanel` APPENDED instead of clearing, so
     a correctly translated panel was built underneath the stale one and
     everything visible was the copy that had never been rebuilt.
     Counting the duplicates alone would not have caught it: the page was
     translated, twice, and showed the wrong one. So both halves are
     asserted, and the Hebrew sweep covers the strings written by SCRIPT
     rather than by `data-t` — the illustration note came from
     `js/share.js` and was the last one left behind. */
  const HEBREW = /[\u0590-\u05FF]/;
  const rebuilt = await pg.evaluate(() => ({
    navs: document.querySelectorAll('.steps').length,
    openers: document.querySelectorAll('.works-open').length,
    sends: document.querySelectorAll('.panel--send').length,
    text: [...document.querySelectorAll(
      '#choices .tile__name, #choices .field__title, #choices .sect__title,'
      + ' #choices .sect__q, #choices .field__hint, #choices .sect__back,'
      + ' .stage__note, .trust span, .send__lead')].map(e => e.textContent).join(' '),
  }));
  for (const [what, n] of [['navigators', rebuilt.navs], ['gallery openers', rebuilt.openers],
                           ['send cards', rebuilt.sends]]) {
    if (n !== 1) {
      fault('languages', `${n} ${what} on the page after switching language — `
        + 'the panel is being built again instead of rebuilt, and the customer is '
        + 'looking at whichever copy came first');
    }
  }
  if (HEBREW.test(rebuilt.text)) {
    fault('languages', 'Hebrew survives on the English page: "'
      + (rebuilt.text.match(/[^\s]*[\u0590-\u05FF][^\s]*/g) || []).slice(0, 3).join(' ')
      + '" — a string that is written once at boot and never again');
  }

  if (after.dir !== 'ltr') fault('languages', 'clicking English did not flip <html dir>');
  if (after.live !== 1) fault('languages', `after switching, ${after.live} steps are live, want 1`);
  if (!faults) console.log('    the interface mirrors, the door does not, and the door survives the switch');
  await pg.close();
}

await b.close();

if (skipped.length) {
  console.log(`\n⚠ ${skipped.length} of ${VIEWS.length} viewports were NOT audited — `
            + `${skipped.join(', ')} — because chromium died rendering them.`
            + '\n  That is this container, not this page: see tools/browser.mjs.'
            + '\n  Nothing below covers those widths. Re-run somewhere it survives.');
}
console.log(faults ? `\n✗ ${faults} faults\n` : '\n✓ no faults\n');
/* ⚠ Skipping EVERY viewport is a broken instrument, not a clean page. */
process.exitCode = (faults || skipped.length === VIEWS.length) ? 1 : 0;
