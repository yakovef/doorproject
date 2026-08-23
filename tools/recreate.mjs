/**
 * Recreate a measured door in the configurator and stand it beside the
 * photograph, leaf height matched.
 *
 * The point is not to prove we can match a photo — it is to see, at the same
 * size, which differences are the renderer's and which are the catalogue's.
 *
 * Run: npm run recreate
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { assertFreshBundle, stampSheets } from './fresh.mjs';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import { MOULD_BAND, REBATE } from '../js/renderer.js';
import { HANDLES, SIZES } from '../js/catalog.js';
import { fromQuery } from '../js/url-state.js';

/* Our applied moulding as a fraction of the standard leaf, DERIVED. The gap
   notes below compare the photographs' measured stock against ours, and this
   side of that comparison used to be typed in: it read "the slim one at 0.043"
   from when MOULD_BAND was 40 mm, and stayed there when the band moved to 70
   and closed the gap it was reporting. Same fault as glass.mjs holding our own
   pane numbers (CLAUDE.md §5 item 9) — a tool that remembers what the drawing
   does will eventually be describing a drawing that no longer exists. */
const OURS_BAND = MOULD_BAND / (SIZES.standard.w - REBATE * 2);
const ours = OURS_BAND.toFixed(3);

/* And the same for the bar range, for exactly the same reason. Two gap notes
   below said "our shortest is 0.39" and "our longest is 0.56" — both typed in,
   both wrong by the time anybody read them again, because the bar widths and
   lengths were re-measured a round later and neither figure followed. Asked of
   the catalogue every run. */
const LEAF_H = SIZES.standard.h - REBATE * 2;
const barLens = HANDLES.filter(h => h.style === 'bar').map(h => h.len / LEAF_H);
const shortestBar = Math.min(...barLens).toFixed(2);
const longestBar = Math.max(...barLens).toFixed(2);

/**
 * Ten doors, chosen to span the vocabulary rather than to flatter it: plain,
 * two kinds of backplate, two panelled faces, metal strips, a glazed light
 * with muntins, obscured glazing, a smart lock, and a sidelight.
 *
 * Every query is built from the hand-measured record — handing from `lock.x`,
 * colour from the sampled hex, the window from the measured rect, the hardware
 * from what the record names — and NOT adjusted afterwards to whatever looks
 * closest. Where the catalogue has nothing near, `gap` says so: the difference
 * is the finding, not something to tune away.
 *
 * ⚠ NO `h=` IN THESE QUERIES ANY MORE, and the reason is worth the paragraph.
 *
 * On 23.8.2026 `HANDINGS` was corrected — seen from outside, a שמאל door
 * carries its keyhole on the RIGHT, and both `hinge` values had been the other
 * way round. Every consumer of the convention had to move with it. I flipped
 * the ten `h=` values written here, regenerated, and the sheets did not change
 * by a single byte.
 *
 * Because these queries never decided the handing. The loop below OVERWRITES
 * `h=` on every run from `rec.handle.x`, the measured grip position — all ten
 * records carry one, so the typed value was dead in all ten cases. It was a
 * SECOND statement of a fact the loop already derived, and it had been wrong
 * and invisible for however long, in a file whose own header says handing must
 * come from the measurement and not from me. CLAUDE.md §5, in the tool that
 * exists to catch drift.
 *
 * So the second statement is gone rather than corrected. The handing is
 * appended from the record, once, and a record without `handle.x` is now an
 * error instead of a silent fall back to whatever somebody typed.
 *
 * Caught by cropping `recreate-d003.png` and looking: the photograph has its
 * lock on the right and our door had it on the left. Nothing failed — the
 * suite was green and the sheets regenerated cleanly. Three separate places
 * derived this one fact; `tools/corpus.mjs` had the identical bug in
 * `handingOf`.
 */
const CASES = [
  { id: 'd003', label: 'basic 3195 - waisted plate',
    q: 'c=rb-7110d&w=none&g=none&n=none&k=plate&d=plain&s=standard',
    gap: 'the plate is BRASS in the photograph; the finish is withdrawn, so ours is nickel' },
  { id: 'd012', label: 'basic 3450 - Rotem plate',
    q: 'c=rb-7080d&w=none&g=none&n=none&k=plate&d=plain&s=standard',
    gap: 'leaf is #B2BAC8, a pale blue-grey the Rav Bariach chart has no entry for' },
  { id: 'd026', label: 'basic 3750 - lever and cylinder',
    q: 'c=rb-7080d&w=none&g=none&n=none&k=coral&d=plain&s=standard',
    gap: 'brass lever in the photograph, nickel in ours; also missing the ribbed aluminium sill' },
  { id: 'd048', label: 'designed 4800 - two panels',
    q: 'c=rb-5103d&w=none&g=none&n=none&k=coral&d=panel2&s=standard',
    gap: 'the photo has a peephole set inside a ring knocker (both withdrawn); its '
       + `moulding is the corpus's HEAVY stock at 0.084 of leaf width and ours is ${ours} `
       + '— see MOULD_BAND' },
  { id: 'd078', label: 'designed 5900 - eleven strips',
    /* `k=cadoor` — a KNOB — until the records were read back against the
       queries. d078's `lock.kind` is "round-escutcheon" and its `handle.type`
       is "pull-bar": a bar with a cylinder beside it and no knob or lever
       anywhere, which is what eight of the ten installed bar doors carry. */
    q: 'c=rb-0096d&w=none&g=none&n=nitzan&k=cylinder&d=strips&s=standard',
    gap: `the bar is 0.32 of leaf height; our shortest is ${shortestBar}` },
  { id: 'd087', label: 'designed 8000 - smart lock, long bar',
    q: 'c=rb-9005d&w=none&g=none&n=shahar&k=digital&d=panel2&s=standard',
    gap: `the bar is 0.73 of leaf height (our longest is ${longestBar}) and BLACK, which we no `
       + `longer offer; its moulding measures 0.070 of leaf width against our ${ours}, `
       + 'so ours is now the heavier of the two' },

  /* The four glazed ones. Their windows and grilles were re-derived from the
     measured rects and the works page after the window/grille rebuild, and
     three of the gaps below closed outright: `strip` is now the 0.33-wide slot
     d113 has, `broad` is d106's near-square light, and `scroll` draws
     medallions IN the grid rather than instead of it. Comparing `window.rects`
     against WINDOWS is half the reason these ten exist — and the old queries
     all said `tallwin` because that was once the only tall opening we had, not
     because the doors agreed. */
  { id: 'd097', label: 'luxury 7500 - tall light, medallions',
    q: 'c=rb-9016d&w=tallwin&g=scroll-light&n=none&k=coral&d=panel&s=standard',
    gap: 'the grid is the door colour but the medallions inside it are BLACK, and '
       + '`light` is one switch over the whole grille, so ours makes both pale; the '
       + 'real ornament is denser scrollwork where ours is a single opposed pair' },
  { id: 'd106', label: 'luxury 8500 - interlocking rings',
    q: 'c=rb-7080d&w=broad&g=circles&n=none&k=plate&d=panel&s=standard',
    /* ⚠ This note claimed the ring cell was "capped at 96 mm", and there has
       been no such cap since the glass patterns were redrawn — a tool
       describing a drawing that no longer exists, which is CLAUDE.md §5 in its
       purest form. It also had the direction backwards: ours read COARSER than
       the photograph, not finer. The pitch is a measurement now (54 mm, from
       d106's own pane two ways), so what is left is the finish. */
    gap: 'its plate is brass in the photograph, and the finish is withdrawn, so '
       + 'ours is nickel' },
  { id: 'd113', label: 'luxury 9500 - smart lock, glazed slot',
    q: 'c=rb-9001d&w=strip&g=grid-light&n=idan&k=digital&d=plain&s=standard',
    gap: 'the bar and the lock body are black in the photograph; ours are nickel' },
  { id: 'd122', label: 'luxury 13900 - sidelight, reeded behind a grid',
    /* `k=coral` here too, and it was doing more damage: a lever leaves a bar
       nowhere to go on a glazed leaf, so `repair` silently dropped the Idan
       bar and this sheet stood a bar-less door beside a photograph of one with
       a 1056 mm bar down it. `lock.kind` is "round-escutcheon". The check
       below is there so the next one of these is not silent. */
    q: 'c=rb-6219d&w=rect&g=grid-light&n=idan&k=cylinder&d=panel&s=sidelight',
    gap: 'this door carries BOTH — a pale grid over reeded glass — and one list means '
       + 'one choice, so the reeded pane is the half we drop (see GRILLES); the bar '
       + 'is black in the photograph and ours is nickel' },
];

const load = f => f.endsWith('.png')
  ? (p => ({ w: p.width, h: p.height, d: p.data }))(PNG.sync.read(readFileSync(f)))
  : (p => ({ w: p.width, h: p.height, d: p.data }))(jpeg.decode(readFileSync(f), { useTArray: true }));

/** Nearest-neighbour scale — good enough for a visual comparison sheet. */
function scale(src, w, h) {
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.min(src.w - 1, (x * src.w / w) | 0);
    const sy = Math.min(src.h - 1, (y * src.h / h) | 0);
    const s = (sy * src.w + sx) * 4, d = (y * w + x) * 4;
    out.data[d] = src.d[s]; out.data[d+1] = src.d[s+1]; out.data[d+2] = src.d[s+2]; out.data[d+3] = 255;
  }
  return out;
}

await assertFreshBundle();

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let bad = 0;

for (const c of CASES) {
  const rec = JSON.parse(readFileSync(`research/works/data2/${c.id}.json`, 'utf8'));

  /* Handing comes from the measurement, not from me. I typed it by hand on
     eight recreations and got it wrong on four, which means half those
     comparisons were testing a mirrored door. `handle.x` is the grip's
     position as a fraction of leaf width from the LEFT.

     ⚠ INVERTED 23.8.2026, WITH THE CONVENTION. This read
     `x < 0.5 ? 'left-in' : 'right-in'` under a comment saying "grip left =>
     hinges right", which was the correct INFERENCE paired with the wrong NAME:
     ימין/שמאל follows the hinge, and a door whose grip is on the left is
     hinged right, so it is `right-in`. Both `hinge` values in `js/catalog.js`
     were the other way round and this line agreed with them.

     ⚠ AND THE FALLBACK IS GONE. It used to drop back to whatever `h=` was
     typed into the case above. All ten records carry `handle.x`, so that
     fallback never ran — which is exactly why the typed values could sit there
     wrong and invisible. A record without a measurement is now a stop, not a
     quiet substitution of somebody's guess. */
  if (!rec.handle || rec.handle.x == null) {
    throw new Error(`${c.id}: no handle.x in the record, so the handing cannot be `
                  + 'derived — and it must never be typed. Measure it first.');
  }
  const hand = rec.handle.x < 0.5 ? 'right-in' : 'left-in';
  const q = `${c.q}&h=${hand}`;

  /* DID THE RULES HAVE TO CHANGE THIS DOOR ON THE WAY IN?
     `npm run shot` has asked this for two rounds and this tool did not, which
     is backwards: a shot that arrives repaired is a layout photographed under
     the wrong name, but a RECREATION that arrives repaired is a comparison
     against a door nobody built, and the whole output of this tool is the list
     of differences between the two halves. d122 was standing bar-less beside a
     photograph of a door with a 1056 mm bar down it, and the sheet said
     nothing, because a lever had quietly taken the bar's place away.
     Reported and counted rather than thrown: the sheet is still worth looking
     at, and the exit code says it was not clean. */
  const { notice } = fromQuery('?' + q);
  if (notice) {
    bad++;
    console.log(`${c.id}  ⚠ arrives repaired (${notice}) — this is NOT the door it names`);
  }

  const p = await b.newPage({ viewport: { width: 620, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto(`file://${process.cwd()}/index.html?bare=1&${q}`);
  await p.waitForTimeout(500);
  /* Ask the page how tall the leaf came out, rather than multiplying the shot
     by a constant. The constant was 0.735 — the leaf's share of the drawing's
     height — and it silently stopped being true the moment the air around the
     door changed, which put every proportion below on a different ruler
     without anything looking broken. */
  const geo = await p.evaluate(() => {
    const svg = document.querySelector('.door-svg');
    const s = svg.getBoundingClientRect();
    const l = svg.querySelector('#leaf rect').getBoundingClientRect();
    return { box: { x: s.x, y: s.y, width: s.width, height: s.height }, leafH: l.height };
  });
  const shot = `/tmp/rec-${c.id}.png`;
  await p.screenshot({ path: shot, clip: geo.box });
  await p.close();

  /* Match on LEAF height: the photo's leaf and ours must be the same number of
     pixels tall, or every proportion below is read against a different ruler. */
  const photo = load(`research/works/doors/${c.id}.jpeg`);
  const ours  = load(shot);
  const H = 1100;
  const photoScale = H / rec.leaf.h;
  const pw = Math.round(photo.w * photoScale), ph = Math.round(photo.h * photoScale);
  const oursScale = H / (geo.leafH * 2);        // 2 = deviceScaleFactor
  const ow = Math.round(ours.w * oursScale), oh = Math.round(ours.h * oursScale);

  const A = scale(photo, pw, ph), B = scale(ours, ow, oh);
  const W = pw + ow + 24, HH = Math.max(ph, oh);
  const sheet = new PNG({ width: W, height: HH });
  sheet.data.fill(255);
  const blit = (img, ox) => {
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      const s = (y * img.width + x) * 4, d = (y * W + x + ox) * 4;
      sheet.data[d] = img.data[s]; sheet.data[d+1] = img.data[s+1];
      sheet.data[d+2] = img.data[s+2]; sheet.data[d+3] = 255;
    }
  };
  blit(A, 0); blit(B, pw + 24);
  writeFileSync(`screenshots/recreate-${c.id}.png`, PNG.sync.write(sheet));
  console.log(`${c.id}  ${c.label}   photo left, ours right   -> screenshots/recreate-${c.id}.png`);
  console.log(`      catalogue gap: ${c.gap}`);
}
await b.close();
process.exitCode = bad ? 1 : 0;

/* The sheets are current as of this drawing. `npm test` checks the stamp, so
   a change to the renderer or the catalogue that is not followed by a
   regeneration is caught rather than left for somebody to read as a finding. */
stampSheets('recreate');
