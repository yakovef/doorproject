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
  if (!shut.sections) fault(v.name, 'no sections rendered');
  if (shut.sections > 4) fault(v.name, `${shut.sections} top-level sections — the fold is meant to be short`);
  if (shut.openSections) fault(v.name, `${shut.openSections} sections already open on load`);
  if (shut.open) fault(v.name, `${shut.open} categories already open on load`);
  if (shut.visibleHeads) fault(v.name, `${shut.visibleHeads} category rows visible before a section was opened`);
  if (shut.visibleOptions) fault(v.name, `${shut.visibleOptions} options visible before anything was opened`);

  /* Tap targets, measured with every body OPEN at BOTH levels — a hidden
     element has no size, so measuring them closed would pass everything by
     measuring nothing. */
  await p.evaluate(() => {
    document.querySelectorAll('.sect__body,.field__body').forEach(b => { b.hidden = false; });
  });
  const small = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('[role="radio"], .btn, .bar__phone, .field__head, .sect__head')) {
      const r = el.getBoundingClientRect();
      if (r.height < 44 || r.width < 30) {
        out.push(`${el.className.split(' ')[0]}:${el.dataset.id || el.id || el.textContent.trim().slice(0, 12)} ${Math.round(r.width)}x${Math.round(r.height)}`);
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

  await p.close();
}
await b.close();

console.log(faults ? `\n✗ ${faults} faults\n` : '\n✓ no faults\n');
process.exitCode = faults ? 1 : 0;
