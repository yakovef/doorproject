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
import { load } from './imglib.mjs';
import { DEFAULTS, encodeCode } from '../js/url-state.js';

/* Derived, not spelled out: the code grew from seven characters to eight when
   the grip and the lockset became separate fields, and a hard-coded length
   here turned that into 280 audit failures that were all the same fact. */
const CODE = new RegExp(`^DM-[0-9A-Z]{${encodeCode(DEFAULTS).length - 3}}$`);

const VIEWS = [
  { name: 'phone',   w: 390,  h: 844 },
  { name: 'phone-s', w: 320,  h: 568 },
  { name: 'tablet',  w: 834,  h: 1112 },
  { name: 'laptop',  w: 1280, h: 720 },
  { name: 'wide',    w: 1680, h: 950 },
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

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let faults = 0;
const fault = (view, msg) => { faults++; console.log(`  ✗ [${view}] ${msg}`); };

for (const v of VIEWS) {
  const p = await b.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  await p.waitForTimeout(400);
  console.log(`\n${v.name}  ${v.w}x${v.h}`);

  /* The cabinet: on first paint the customer must see the four SECTIONS and
     nothing else — no category headings and no options. That is the whole
     change, so it is asserted rather than assumed; a regression here looks
     like a working page. */
  const shut = await p.evaluate(() => ({
    sections: document.querySelectorAll('.sect__head').length,
    openSections: [...document.querySelectorAll('.sect__body')].filter(b => !b.hidden).length,
    open: [...document.querySelectorAll('.field__body')].filter(b => !b.hidden).length,
    visibleHeads: [...document.querySelectorAll('.field__head')]
      .filter(e => e.getBoundingClientRect().height > 0).length,
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

  if (!shut.sections) fault(v.name, 'no sections rendered');
  if (shut.sections > 4) fault(v.name, `${shut.sections} top-level sections — the fold is meant to be short`);
  if (shut.openSections) fault(v.name, `${shut.openSections} sections already open on load`);
  if (shut.open) fault(v.name, `${shut.open} categories already open on load`);
  if (shut.visibleHeads) fault(v.name, `${shut.visibleHeads} category rows visible before a section was opened`);
  if (shut.visibleOptions) fault(v.name, `${shut.visibleOptions} options visible before anything was opened`);

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
  await p.evaluate(() => {
    document.querySelectorAll('.sect__body,.field__body').forEach(b => { b.hidden = false; });
  });
  /* DERIVED, not listed. This asked a hand-kept set of classes —
     [role="radio"], .btn, .bar__phone, .field__head, .sect__head — and the
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
      if (r.height < 44 || r.width < 30) {
        const cls = String(el.className || '').split(' ')[0];
        out.push(`${cls || el.tagName.toLowerCase()}:${el.dataset.id || el.id || el.textContent.trim().slice(0, 12)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return out;
  });
  small.forEach(s => fault(v.name, `tap target under 44px: ${s}`));
  await p.reload();
  await p.waitForTimeout(300);

  const seen = new Map();
  for (const { key, section } of await groupsOn(p)) {
    const g = `.field[data-group="${key}"]`;
    /* Open it the way a person does, both levels, section first. Clicking an
       option inside a closed category would still work through the DOM and
       would prove nothing about whether anyone can reach it — and with the
       cabinet two deep, "can anyone reach it" is the question. */
    await p.$eval(`.sect[data-section="${section}"] .sect__head`, el => {
      if (el.getAttribute('aria-expanded') !== 'true') el.click();
    });
    await p.waitForTimeout(60);
    if (!await p.$eval(`.sect[data-section="${section}"] .sect__body`, el => !el.hidden)) {
      fault(v.name, `section ${section} would not open`); continue;
    }
    await p.$eval(`${g} .field__head`, el => {
      if (el.getAttribute('aria-expanded') !== 'true') el.click();
    });
    await p.waitForTimeout(60);
    const opened = await p.$eval(`${g} .field__body`, el => !el.hidden);
    if (!opened) { fault(v.name, `${key} would not open`); continue; }

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
          code: document.getElementById('code').textContent,
          wa: document.getElementById('wa-btn').getAttribute('href'),
          summary: document.getElementById('summary').textContent,
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
      if (!s.wa || !s.wa.startsWith('https://')) fault(v.name, `${key}=${id}: WhatsApp link is "${s.wa}"`);
      if (!s.summary.trim()) fault(v.name, `${key}=${id}: the spec line is empty`);

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
    await p.goto(`file://${process.cwd()}/index.html`
               + '?c=rb-0097d&w=rect&g=none&n=shiran&k=cylinder&d=plain&s=standard&h=right-in');
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
    await p.waitForTimeout(500);
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

    /* Tab until a section head has focus rather than counting presses — the
       header's links come first and there is no reason for this check to know
       how many of them there are. */
    let head = null;
    for (let i = 0; i < 20 && !head; i++) {
      await p.keyboard.press('Tab');
      head = await p.evaluate(() => {
        const a = document.activeElement;
        return a && a.classList && a.classList.contains('sect__head') ? a.id : null;
      });
    }
    if (!head) fault(v.name, 'no section heading can be reached with Tab');
    else {
      await p.keyboard.press('Enter');
      await p.waitForTimeout(150);
      if (!await p.evaluate(() => [...document.querySelectorAll('.sect__body')].some(b => !b.hidden))) {
        fault(v.name, 'Enter on a section heading does not open it');
      }

      await p.keyboard.press('Tab');
      await p.waitForTimeout(80);
      if (!await p.evaluate(() => document.activeElement.classList.contains('field__head'))) {
        fault(v.name, 'Tab from an open section does not reach a category');
      }

      await p.keyboard.press('Enter');
      await p.waitForTimeout(150);
      if (!await p.evaluate(() => !!document.querySelector('.field__body:not([hidden])'))) {
        fault(v.name, 'Enter on a category heading does not open it');
      }

      await p.keyboard.press('Tab');
      await p.waitForTimeout(80);
      const first = await p.evaluate(() =>
        document.activeElement.getAttribute('role') === 'radio'
          ? document.activeElement.dataset.id : null);
      if (!first) fault(v.name, 'Tab from an open category does not reach an option');
      else {
        const codeBefore = await p.$eval('#code', e => e.textContent);
        await p.keyboard.press('ArrowLeft');
        await p.waitForTimeout(200);
        const moved = await p.evaluate(() => document.activeElement.dataset.id);
        const codeAfter = await p.$eval('#code', e => e.textContent);
        if (moved === first) fault(v.name, 'an arrow key does not move between options');
        /* Selection follows focus in a radiogroup, so the DOOR has to change.
           A grid that moves a highlight and leaves the drawing behind is the
           failure this is looking for. */
        else if (codeAfter === codeBefore) {
          fault(v.name, `arrowing from ${first} to ${moved} left the door unchanged`);
        }
        const checked = await p.evaluate(() =>
          document.activeElement.getAttribute('aria-checked'));
        if (checked !== 'true') {
          fault(v.name, `the focused option reads aria-checked="${checked}" after an arrow key`);
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
    const leafHeight = async q => {
      await p.goto(`file://${process.cwd()}/index.html?${q}`);
      await p.waitForTimeout(350);
      return p.$eval('#leaf rect', e => Math.round(e.getBoundingClientRect().height));
    };
    const stem = 'c=rb-0097d&w=none&g=none&k=cylinder&d=plain&h=right-in';
    for (const size of ['standard', 'sidelight']) {
      const bare = await leafHeight(`${stem}&s=${size}&n=none`);
      const held = await leafHeight(`${stem}&s=${size}&n=shiran`);
      if (bare !== held) {
        fault(v.name, `choosing a pull handle resized the door on ${size}: `
                    + `the leaf went from ${bare} px to ${held}`);
      }
    }

    for (const size of ['standard', 'narrow', 'wide', 'tall', 'half', 'sidelight']) {
      await p.goto(`file://${process.cwd()}/index.html?${stem}&s=${size}&n=shiran`);
      await p.waitForTimeout(350);
      const m = await p.evaluate(() => {
        const gb = document.getElementById('grip-bar');
        if (gb.hidden) return null;
        const g = gb.getBoundingClientRect();
        const f = document.querySelector('.door-svg #frame').getBoundingClientRect();
        return { g: [g.x, g.x + g.width, g.width], f: [f.x, f.x + f.width] };
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
         sliver, which is the other way a measured width can go wrong. */
      if (m.g[2] < 56) {
        fault(v.name, `the grip controls are ${Math.round(m.g[2])} px wide on ${size}`);
      }
    }
    if (!faults) console.log('  the door keeps its size when it gains a handle, '
                           + 'and the controls stand clear of it');
  }

  await p.close();
}
await b.close();

console.log(faults ? `\n✗ ${faults} faults\n` : '\n✓ no faults\n');
process.exitCode = faults ? 1 : 0;
