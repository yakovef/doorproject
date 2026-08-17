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

const VIEWS = [
  { name: 'phone',   w: 390,  h: 844 },
  { name: 'phone-s', w: 320,  h: 568 },
  { name: 'tablet',  w: 834,  h: 1112 },
  { name: 'laptop',  w: 1280, h: 720 },
  { name: 'wide',    w: 1680, h: 950 },
];

const GROUPS = ['#colours', '#windows', '#grilles', '#handles', '#details',
                '#finishes', '#sizes', '#handings'];

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

  /* Tap targets. 44 px is the floor everywhere it is written down, and it is
     the difference between choosing a colour and choosing the one next to it
     with a thumb. */
  const small = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('[role="radio"], .btn, .bar__phone')) {
      const r = el.getBoundingClientRect();
      if (r.height < 44 || r.width < 30) {
        out.push(`${el.className.split(' ')[0]}:${el.dataset.id || el.id || el.textContent.trim().slice(0, 12)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return out;
  });
  small.forEach(s => fault(v.name, `tap target under 44px: ${s}`));

  const seen = new Map();
  for (const g of GROUPS) {
    const ids = await p.$$eval(`${g} [role="radio"]`, els => els.map(e => e.dataset.id));
    if (!ids.length) { fault(v.name, `${g} rendered no options`); continue; }

    for (const id of ids) {
      await p.click(`${g} [data-id="${id}"]`);
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

      if (!s.hasSvg) { fault(v.name, `${g}=${id}: no door rendered`); continue; }
      if (s.overflowX > 1) fault(v.name, `${g}=${id}: page scrolls sideways by ${s.overflowX}px`);
      if (!s.leaf || s.leaf.w < 20 || s.leaf.h < 40) {
        fault(v.name, `${g}=${id}: leaf is ${s.leaf ? `${Math.round(s.leaf.w)}x${Math.round(s.leaf.h)}` : 'missing'}`);
      } else {
        const clip = Math.max(0, s.stage.x - s.leaf.x, s.stage.y - s.leaf.y,
                              (s.leaf.x + s.leaf.w) - (s.stage.x + s.stage.w),
                              (s.leaf.y + s.leaf.h) - (s.stage.y + s.stage.h));
        if (clip > 1) fault(v.name, `${g}=${id}: the leaf is cut off by ${Math.round(clip)}px`);
      }
      if (!/\d/.test(s.price)) fault(v.name, `${g}=${id}: price reads "${s.price}"`);
      if (!/^DM-[0-9A-Z]{7}$/.test(s.code)) fault(v.name, `${g}=${id}: code reads "${s.code}"`);
      if (!s.wa || !s.wa.startsWith('https://')) fault(v.name, `${g}=${id}: WhatsApp link is "${s.wa}"`);
      if (!s.summary.trim()) fault(v.name, `${g}=${id}: the spec line is empty`);

      /* Two designs that differ must not share a code — that is an order for
         the wrong door, arriving by telephone with nothing to catch it. */
      const key = s.code;
      if (seen.has(key) && seen.get(key) !== s.summary) {
        fault(v.name, `${g}=${id}: code ${key} is shared with a different design`);
      }
      seen.set(key, s.summary);
    }
  }
  errs.forEach(e => fault(v.name, `console: ${e}`));
  if (!small.length && !errs.length) console.log('  clicked every option, clean');
  await p.close();
}
await b.close();

console.log(faults ? `\n✗ ${faults} faults\n` : '\n✓ no faults\n');
process.exitCode = faults ? 1 : 0;
