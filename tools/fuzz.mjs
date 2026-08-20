/**
 * The fuzzer. Combinations, not options.
 *
 * ── why this exists beside `npm run audit` ───────────────────────────
 * The audit clicks every option ONCE, each time from the default door, and
 * that is a different question from the one a customer asks. A customer picks
 * a colour, then a size, then a window, then changes their mind about the
 * size — and every rule in `js/rules.js` is a rule about a PAIR. The audit
 * never gets two non-default choices onto the same door, so the whole
 * interaction surface between them is unvisited.
 *
 * The suite has the opposite blind spot: it renders SVG strings, so it sees
 * every combination and none of the page.
 *
 * ── two phases ───────────────────────────────────────────────────────
 * A. In node, no browser: random designs across ALL nine axes at once, plus a
 *    random handle position. Fast enough to run tens of thousands.
 * B. In a real browser: RANDOM CLICK WALKS. Thirty clicks in a row on random
 *    tiles at a random viewport, checking after every one of them. This is the
 *    only thing here that exercises `repair`'s `intent` argument the way a
 *    person does — as a sequence, where each repair lands on the result of the
 *    last one.
 *
 * Deterministic: the seed is printed and can be passed back as `--seed=N`, so
 * a failure found on run 400 can be replayed. `Math.random` would make every
 * finding unreproducible, which is the difference between a fuzzer and a
 * rumour.
 *
 * Run: npm run fuzz            (default budget)
 *      npm run fuzz -- --walks=200 --cases=50000 --seed=12345
 */
import { chromium } from 'playwright';
import { assertFreshBundle } from './fresh.mjs';
import { COLOURS, DETAILS, GRILLES, HANDINGS, HANDLES, LOCKSETS, SIZES, WINDOWS }
  from '../js/catalog.js';
import { conflicts, repair } from '../js/rules.js';
import { render } from '../js/renderer.js';
import { priceAgorot } from '../js/price.js';
import { DEFAULTS, decodeCode, encodeCode, fromQuery, toQuery } from '../js/url-state.js';

const arg = (name, dflt) => {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : dflt;
};
const SEED  = arg('seed', 20260820);
const CASES = arg('cases', 30000);
const WALKS = arg('walks', 60);
const STEPS = arg('steps', 30);

/* mulberry32 — three lines, no dependency, and the same sequence on every
   machine. That last part is the whole point. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let faults = 0;
const seen = new Set();
/** Report each DISTINCT fault once, with a count. A fuzzer that prints the
 *  same line 4,000 times has buried its other findings. */
const fault = (kind, detail) => {
  faults++;
  if (seen.has(kind)) return;
  seen.add(kind);
  console.log(`  ✗ ${kind}`);
  if (detail) console.log(`      ${detail}`);
};

const KEYS = ['colour', 'size', 'handing', 'window', 'grille', 'handle', 'lockset', 'detail'];
const sizeKeys = Object.keys(SIZES);
const buildable = st => {
  const c = conflicts(st);
  return KEYS.every(k => !(c[k] || {})[st[k]]);
};

/* Attribute values only. The prose in this file's own comments is full of
   words like "none", and matching the whole string would flag the drawing for
   describing itself. */
const BAD_VALUE = /="[^"]*\b(NaN|Infinity|undefined|null)\b[^"]*"/;

// ── A. designs ────────────────────────────────────────────────────

console.log(`seed ${SEED}\n\nA. ${CASES} random designs, all nine axes at once`);
{
  const r = rng(SEED);
  const pick = list => list[Math.floor(r() * list.length)];
  let rendered = 0, repaired = 0;

  for (let i = 0; i < CASES; i++) {
    const raw = {
      colour:  pick(COLOURS).id,
      size:    pick(sizeKeys),
      handing: pick(HANDINGS).id,
      window:  pick(WINDOWS).id,
      grille:  pick(GRILLES).id,
      handle:  pick(HANDLES).id,
      lockset: pick(LOCKSETS).id,
      detail:  pick(DETAILS).id,
    };
    /* A dragged handle, a quarter of the time, anywhere on a 950 x 2100 leaf
       including well outside it — a link can carry any two numbers. */
    if (r() < 0.25) raw.grip = { x: Math.round(r() * 1200 - 100),
                                 y: Math.round(r() * 2400 - 150),
                                 rot: r() < 0.3 ? 90 : 0 };

    const { state: fixed } = repair(raw);
    const again = repair(fixed);
    if (again.changed.length) {
      fault('repair does not settle in one pass',
            `${JSON.stringify(raw)} -> ${again.changed.join(',')}`);
    }
    if (JSON.stringify(fixed) !== JSON.stringify(again.state)) {
      fault('repair is not idempotent', JSON.stringify(raw));
    }
    if (!buildable(fixed)) {
      fault('repair produced a door the rules refuse', JSON.stringify(fixed));
    }
    repaired++;

    /* The link and the code must both bring back exactly this door. */
    const back = fromQuery(toQuery(fixed)).state;
    for (const k of KEYS) {
      if (back[k] !== fixed[k]) {
        fault(`the link loses "${k}"`, `${fixed[k]} came back as ${back[k]}`);
      }
    }
    const code = decodeCode(encodeCode(fixed));
    if (!code) fault('a code would not decode', encodeCode(fixed));
    else for (const k of KEYS) {
      if (code[k] !== fixed[k]) {
        fault(`the code loses "${k}"`, `${fixed[k]} came back as ${code[k]}`);
      }
    }

    const p = priceAgorot(fixed);
    if (!Number.isInteger(p) || p <= 0) fault('the price is not a positive integer', String(p));
    if (p % 500) fault('the price is not rounded to ₪5', String(p));

    /* Rendering is the expensive part, so a slice of the sample gets it — but
       a big enough slice that a fault in one grille on one size still turns
       up. Every design that carries a dragged handle is rendered, because that
       is where the arithmetic is. */
    if (raw.grip || i % 4 === 0) {
      const svg = render(fixed);
      rendered++;
      const bad = BAD_VALUE.exec(svg);
      if (bad) fault('a number reached the drawing as NaN/undefined',
                     `${bad[0].slice(0, 60)} in ${JSON.stringify(fixed)}`);
      if (!/<svg/.test(svg)) fault('render produced no svg', JSON.stringify(fixed));
    }
  }
  console.log(`  ${repaired} repaired and round-tripped, ${rendered} drawn`);
}

// ── B. click walks ────────────────────────────────────────────────

const VIEWS = [
  { name: 'phone',  w: 390,  h: 844 },
  { name: 'tablet', w: 834,  h: 1112 },
  { name: 'laptop', w: 1280, h: 720 },
];

console.log(`\nB. ${WALKS} random click walks of ${STEPS} clicks, in a real browser`);
{
  await assertFreshBundle();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const CODE = new RegExp(`^DM-[0-9A-Z]{${encodeCode(DEFAULTS).length - 3}}$`);
  const r = rng(SEED ^ 0x5EED);
  let clicks = 0;

  for (let wk = 0; wk < WALKS; wk++) {
    const v = VIEWS[wk % VIEWS.length];
    const p = await b.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1 });
    const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.waitForTimeout(250);

    /* Every body open at both levels, once, and then clicked through the DOM.
       A walk that had to open the right section before every click would spend
       its whole budget on the fold, which `npm run audit` already drives. What
       is being fuzzed here is the SEQUENCE of choices, not the cabinet. */
    await p.evaluate(() => document.querySelectorAll('.sect__body,.field__body')
      .forEach(el => { el.hidden = false; }));

    const tiles = await p.$$eval('.field[data-group] [role="radio"]',
      els => els.map(e => ({ group: e.closest('.field').dataset.group, id: e.dataset.id })));
    if (!tiles.length) { fault('no option tiles on the page'); await p.close(); continue; }

    const trail = [];
    for (let s = 0; s < STEPS; s++) {
      const t = tiles[Math.floor(r() * tiles.length)];
      trail.push(`${t.group}=${t.id}`);
      /* el.click(), not page.click(): a blocked tile carries aria-disabled and
         Playwright refuses those, but a person can still press Enter on one —
         they are deliberately buttons and not `disabled` buttons — and what it
         does then is exactly what this is here to fuzz. */
      const hit = await p.$(`.field[data-group="${t.group}"] [data-id="${t.id}"]`);
      if (!hit) continue;                       // a group can re-render its list
      await hit.evaluate(el => el.click());
      await p.waitForTimeout(12);
      clicks++;

      const s2 = await p.evaluate(() => {
        const doc = document.documentElement;
        const svg = document.querySelector('#stage svg');
        const leaf = svg && svg.querySelector('#leaf rect');
        const lb = leaf && leaf.getBoundingClientRect();
        const stage = document.getElementById('stage').getBoundingClientRect();
        return {
          overflowX: doc.scrollWidth - doc.clientWidth,
          markup: svg ? svg.outerHTML : '',
          leaf: lb && { x: lb.x, y: lb.y, w: lb.width, h: lb.height },
          stage: { x: stage.x, y: stage.y, w: stage.width, h: stage.height },
          price: document.getElementById('price').textContent,
          code: document.getElementById('code').textContent,
          wa: document.getElementById('wa-btn').getAttribute('href'),
          summary: document.getElementById('summary').textContent.trim(),
          url: location.search,
          checked: [...document.querySelectorAll('[role="radio"][aria-checked="true"]')]
            .map(e => `${e.closest('.field').dataset.group}=${e.dataset.id}`),
        };
      });

      const where = `${v.name} step ${s + 1}: ${trail.slice(-4).join(' → ')}`;
      if (!s2.markup) { fault('the door vanished', where); break; }
      if (BAD_VALUE.test(s2.markup)) fault('NaN/undefined in the live drawing', where);
      if (s2.overflowX > 1) fault('the page scrolls sideways', `${where} (${s2.overflowX}px)`);
      if (!s2.leaf || s2.leaf.w < 20 || s2.leaf.h < 40) fault('the leaf is missing or tiny', where);
      else {
        const clip = Math.max(0, s2.stage.x - s2.leaf.x, s2.stage.y - s2.leaf.y,
                              (s2.leaf.x + s2.leaf.w) - (s2.stage.x + s2.stage.w),
                              (s2.leaf.y + s2.leaf.h) - (s2.stage.y + s2.stage.h));
        if (clip > 1) fault('the leaf is cut off by the stage', `${where} (${Math.round(clip)}px)`);
      }
      if (!/\d/.test(s2.price)) fault('the price is not a number', `${where} — "${s2.price}"`);
      if (!CODE.test(s2.code)) fault('the code is malformed', `${where} — "${s2.code}"`);
      if (!s2.wa || !s2.wa.startsWith('https://')) fault('the WhatsApp link is broken', where);
      if (!s2.summary) fault('the spec line is empty', where);

      /* EXACTLY ONE TILE CHECKED PER GROUP. Two would mean the customer and
         Peretz can read two different doors off the same page, and none would
         mean a repair moved the design and never told the panel. */
      const perGroup = new Map();
      for (const c of s2.checked) {
        const g = c.split('=')[0];
        perGroup.set(g, (perGroup.get(g) || 0) + 1);
      }
      for (const [g, n] of perGroup) {
        if (n !== 1) fault(`${n} tiles checked at once in "${g}"`, where);
      }

      /* And the page and its own link must agree: reload the URL and the same
         door has to come back. Asked once per walk rather than per click —
         it is a navigation, and thirty of them per walk would dominate.
         ⚠ The wait is not padding. `set()` debounces `history.replaceState` by
         300 ms, because WebKit throws above ~100 history writes in 30 seconds
         and clicking through swatches reaches that easily. Reading the address
         bar sooner than that gets the PREVIOUS door, and the first version of
         this check reported the app for it. The debounce is deliberate and the
         harness has to respect it; nothing a customer can reach is affected,
         because both the WhatsApp link and the copy button build their message
         from `state` and never from the URL. */
      if (s === STEPS - 1) {
        await p.waitForTimeout(400);
        const url = p.url();
        await p.goto(url);
        await p.waitForTimeout(200);
        const after = await p.evaluate(() => ({
          code: document.getElementById('code').textContent,
          summary: document.getElementById('summary').textContent.trim(),
        }));
        if (after.code !== s2.code) {
          fault('reloading the page changes the door',
                `${where}\n      ${s2.code} became ${after.code}\n      ${url}`);
        }
      }
    }
    errs.forEach(e => fault('a console error', `${v.name}: ${e}`));
    await p.close();
  }
  await b.close();
  console.log(`  ${clicks} clicks`);
}

console.log(faults
  ? `\n✗ ${faults} faults, ${seen.size} distinct — replay with --seed=${SEED}\n`
  : `\n✓ nothing broke\n`);
process.exitCode = faults ? 1 : 0;
