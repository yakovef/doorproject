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
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import { MOULD_BAND, REBATE } from '../js/renderer.js';
import { SIZES } from '../js/catalog.js';
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
 */
const CASES = [
  { id: 'd003', label: 'basic 3195 - waisted plate',
    q: 'c=rb-7110d&w=none&g=none&n=none&k=plate&d=plain&s=standard&h=right-in',
    gap: 'the plate is BRASS in the photograph; the finish is withdrawn, so ours is nickel' },
  { id: 'd012', label: 'basic 3450 - Rotem plate',
    q: 'c=rb-7080d&w=none&g=none&n=none&k=plate&d=plain&s=standard&h=right-in',
    gap: 'leaf is #B2BAC8, a pale blue-grey the Rav Bariach chart has no entry for' },
  { id: 'd026', label: 'basic 3750 - lever and cylinder',
    q: 'c=rb-7080d&w=none&g=none&n=none&k=coral&d=plain&s=standard&h=left-in',
    gap: 'brass lever in the photograph, nickel in ours; also missing the ribbed aluminium sill' },
  { id: 'd048', label: 'designed 4800 - two panels',
    q: 'c=rb-5103d&w=none&g=none&n=none&k=coral&d=panel2&s=standard&h=left-in',
    gap: 'the photo has a peephole set inside a ring knocker (both withdrawn); its '
       + `moulding is the corpus's HEAVY stock at 0.084 of leaf width and ours is ${ours} `
       + '— see MOULD_BAND' },
  { id: 'd078', label: 'designed 5900 - eleven strips',
    /* `k=cadoor` — a KNOB — until the records were read back against the
       queries. d078's `lock.kind` is "round-escutcheon" and its `handle.type`
       is "pull-bar": a bar with a cylinder beside it and no knob or lever
       anywhere, which is what eight of the ten installed bar doors carry. */
    q: 'c=rb-0096d&w=none&g=none&n=nitzan&k=cylinder&d=strips&s=standard&h=left-in',
    gap: 'the bar is 0.32 of leaf height; our shortest is 0.39' },
  { id: 'd087', label: 'designed 8000 - smart lock, long bar',
    q: 'c=rb-9005d&w=none&g=none&n=shahar&k=digital&d=panel2&s=standard&h=left-in',
    gap: 'the bar is 0.73 of leaf height (our longest is 0.56) and BLACK, which we no '
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
    q: 'c=rb-9016d&w=tallwin&g=scroll-light&n=none&k=coral&d=panel&s=standard&h=right-in',
    gap: 'the grid is the door colour but the medallions inside it are BLACK, and '
       + '`light` is one switch over the whole grille, so ours makes both pale; the '
       + 'real ornament is denser scrollwork where ours is a single opposed pair' },
  { id: 'd106', label: 'luxury 8500 - interlocking rings',
    q: 'c=rb-7080d&w=broad&g=circles&n=none&k=plate&d=panel&s=standard&h=right-in',
    gap: 'the motif is right and the PITCH is not — side by side ours reads finer, '
       + 'because the ring cell is capped at 96 mm and this opening is 425 mm wide. '
       + 'Its plate is brass' },
  { id: 'd113', label: 'luxury 9500 - smart lock, glazed slot',
    q: 'c=rb-9001d&w=strip&g=grid-light&n=idan&k=digital&d=plain&s=standard&h=left-in',
    gap: 'the bar and the lock body are black in the photograph; ours are nickel' },
  { id: 'd122', label: 'luxury 13900 - sidelight, reeded behind a grid',
    /* `k=coral` here too, and it was doing more damage: a lever leaves a bar
       nowhere to go on a glazed leaf, so `repair` silently dropped the Idan
       bar and this sheet stood a bar-less door beside a photograph of one with
       a 1056 mm bar down it. `lock.kind` is "round-escutcheon". The check
       below is there so the next one of these is not silent. */
    q: 'c=rb-6219d&w=rect&g=grid-light&n=idan&k=cylinder&d=panel&s=sidelight&h=left-in',
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

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let bad = 0;

for (const c of CASES) {
  const rec = JSON.parse(readFileSync(`research/works/data2/${c.id}.json`, 'utf8'));

  /* Handing comes from the measurement, not from me. I typed it by hand on
     eight recreations and got it wrong on four, which means half those
     comparisons were testing a mirrored door. handle.x is the grip's position
     as a fraction of leaf width from the LEFT: grip left => hinges right. */
  const hand = rec.handle && rec.handle.x != null
    ? (rec.handle.x < 0.5 ? 'left-in' : 'right-in') : null;
  const q = hand ? c.q.replace(/h=[a-z-]+/, `h=${hand}`) : c.q;

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
