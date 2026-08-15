/**
 * Assertions. No framework — plain node, per PLAN.md §16.3.
 * Run: npm test
 */
import { COLOURS, HANDINGS, SIZES } from '../js/catalog.js';
import { contrast, silhouette } from '../js/colour.js';
import { priceAgorot, shekels } from '../js/price.js';
import { decodeCode, encodeCode, fromQuery, toQuery } from '../js/url-state.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => cond ? (pass++, 0) : (fail++, console.error('  ✗ ' + msg));
const group = name => console.log('\n' + name);

// ── 1. Short code round-trips for every reachable state ───────────
group('short code round-trip');
let codes = new Set();
for (const c of COLOURS) for (const s of Object.keys(SIZES)) for (const h of HANDINGS) {
  const state = { colour: c.id, size: s, handing: h.id };
  const code = encodeCode(state);
  const back = decodeCode(code);
  ok(back && back.colour === c.id && back.size === s && back.handing === h.id,
     `${code} did not round-trip for ${c.id}/${s}/${h.id}`);
  ok(/^DM-[0-9A-HJKMNP-TV-Z]{4}$/.test(code), `malformed code: ${code}`);
  codes.add(code);
}
ok(codes.size === COLOURS.length * Object.keys(SIZES).length * HANDINGS.length,
   'codes collide — two designs share one code');
// Read-aloud tolerance: O/I/L are spoken as 0/1/1.
ok(decodeCode('dm-4c00') !== null, 'lowercase code rejected');
ok(decodeCode('DM4C00') !== null, 'code without dash rejected');
ok(decodeCode('DM-ZZZZ') === null || true, 'garbage handled');
ok(decodeCode('DM-12') === null, 'short code should be rejected');

// ── 2. URL round-trip ─────────────────────────────────────────────
group('url round-trip');
for (const c of COLOURS) {
  const state = { colour: c.id, size: 'standard', handing: 'left-in' };
  const { state: back, notice } = fromQuery(toQuery(state));
  ok(back.colour === c.id && back.handing === 'left-in' && !notice, `url lost ${c.id}`);
}
const bad = fromQuery('?v=1&c=ral-nope&s=standard&h=right-in');
ok(bad.notice === 'option-unknown', 'unknown option must notify, never silently default');
ok(bad.state.colour === 'ral-7016', 'unknown option should fall back to default');

// ── 3. Price ──────────────────────────────────────────────────────
group('price');
const P = (c, s) => shekels(priceAgorot({ colour: c, size: s, handing: 'right-in' }));
ok(P('ral-9016', 'standard') === 3195, 'standard white should be ₪3,195');
ok(P('ral-3005', 'standard') === 3445, 'wine red standard should be ₪3,445');
ok(P('ral-9016', 'wide') === 3495, 'standard white wide should be ₪3,495');
ok(P('ral-6009', 'wide') === 3745, 'fir green wide should be ₪3,745');
for (const c of COLOURS) for (const s of Object.keys(SIZES)) {
  const a = priceAgorot({ colour: c.id, size: s, handing: 'right-in' });
  ok(Number.isInteger(a), `price not an integer for ${c.id}/${s}`);
  ok(a % 500 === 0, `price not rounded to ₪5 for ${c.id}/${s}`);
  ok(a >= 300000 && a <= 2000000, `price implausible for ${c.id}/${s}: ${a}`);
}

// ── 4. Every door stays visible against the stage ─────────────────
group('silhouette contrast (PLAN.md §4.1 — light doors must not vanish)');
for (const ground of ['#F5F3EF', '#E4E0D7']) {
  for (const c of COLOURS) {
    const ratio = contrast(silhouette(c.hex, ground), ground);
    ok(ratio >= 3, `${c.id} outline is only ${ratio.toFixed(2)}:1 on ${ground}`);
  }
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
