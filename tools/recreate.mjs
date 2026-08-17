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

/* Each recreation is the closest the CURRENT catalogue can get. Where nothing
   is close the gap is the finding, and it is named here rather than hidden. */
const CASES = [
  { id: 'd026', label: 'basic ₪3,750',
    q: 'c=rb-7080d&w=none&g=none&n=coral&d=plain&f=brass&s=standard&h=right-in',
    gap: 'window grey added this round; exact match' },
  { id: 'd097', label: 'luxury ₪7,500',
    q: 'c=rb-9016d&w=tallwin&g=grid-light&n=coral&d=panel&f=steel&s=standard&h=right-in',
    gap: 'grid-light added; photo also has scroll motifs inside the grid' },
  { id: 'd062', label: 'designed ₪5,000',
    q: 'c=rb-5103d&w=none&g=none&n=grab&d=panel2&f=steel&s=standard&h=right-in',
    gap: 'the applied-moulding rewrite was measured on this door and d048/d076' },
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

for (const c of CASES) {
  const rec = JSON.parse(readFileSync(`research/works/data2/${c.id}.json`, 'utf8'));

  /* Handing comes from the measurement, not from me. I typed it by hand on
     eight recreations and got it wrong on four, which means half those
     comparisons were testing a mirrored door. handle.x is the grip's position
     as a fraction of leaf width from the LEFT: grip left => hinges right. */
  const hand = rec.handle && rec.handle.x != null
    ? (rec.handle.x < 0.5 ? 'left-in' : 'right-in') : null;
  const q = hand ? c.q.replace(/h=[a-z-]+/, `h=${hand}`) : c.q;

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
