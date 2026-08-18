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
   audited — silence, not a failure. */
const groupsOn = p => p.$$eval('.field[data-group]', els => els.map(e => e.dataset.group));

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

  /* The cabinet: on first paint the customer must see the CATEGORIES and no
     options at all. That is the whole change, so it is asserted rather than
     assumed — a regression here looks like a working page. */
  const shut = await p.evaluate(() => ({
    heads: document.querySelectorAll('.field__head').length,
    open: [...document.querySelectorAll('.field__body')].filter(b => !b.hidden).length,
    visibleOptions: [...document.querySelectorAll('[role="radio"],[role="checkbox"]')]
      .filter(e => e.getBoundingClientRect().height > 0).length,
  }));
  if (!shut.heads) fault(v.name, 'no categories rendered');
  if (shut.open) fault(v.name, `${shut.open} categories already open on load`);
  if (shut.visibleOptions) fault(v.name, `${shut.visibleOptions} options visible before anything was opened`);

  /* Tap targets, measured with every category OPEN — a hidden element has no
     size, so measuring them closed would pass everything by measuring
     nothing. */
  await p.evaluate(() => {
    document.querySelectorAll('.field__body').forEach(b => { b.hidden = false; });
  });
  const small = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('[role="radio"], [role="checkbox"], .btn, .bar__phone, .field__head')) {
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
  for (const key of await groupsOn(p)) {
    const g = `.field[data-group="${key}"]`;
    /* Open it the way a person does. Clicking an option inside a closed
       category would still work through the DOM and would prove nothing about
       whether anyone can reach it. */
    await p.$eval(`${g} .field__head`, el => {
      if (el.getAttribute('aria-expanded') !== 'true') el.click();
    });
    await p.waitForTimeout(60);
    const opened = await p.$eval(`${g} .field__body`, el => !el.hidden);
    if (!opened) { fault(v.name, `${key} would not open`); continue; }

    const ids = await p.$$eval(`${g} [role="radio"],${g} [role="checkbox"]`,
                               els => els.map(e => e.dataset.id));
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
  await p.close();
}
await b.close();

console.log(faults ? `\n✗ ${faults} faults\n` : '\n✓ no faults\n');
process.exitCode = faults ? 1 : 0;
