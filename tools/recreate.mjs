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
  { id: 'd030', label: 'basic ₪3,850',
    q: 'c=ral-8019&w=none&g=none&n=cadoor&d=groove&f=steel&s=standard&h=left-in',
    gap: 'leaf #82756C warm mid taupe; RAL 8019 #6B6362 is the nearest, a shade darker' },
  { id: 'd048', label: 'designed ₪4,800',
    q: 'c=ral-5011&w=none&g=none&n=coral&d=panel&f=steel&s=standard&h=right-in',
    gap: 'photo contrast is 10.6:1 — a very dark leaf in hard light' },
  { id: 'd092', label: 'luxury ₪6,950',
    q: 'c=ral-7033&w=tallwin&g=scroll&n=cadoor&d=panel&f=brass&s=standard&h=left-in',
    gap: 'sage green added this round; exact match' },
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

  const p = await b.newPage({ viewport: { width: 620, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto(`file://${process.cwd()}/index.html?bare=1&v=4&${c.q}`);
  await p.waitForTimeout(500);
  const box = await p.evaluate(() => {
    const s = document.querySelector('.door-svg').getBoundingClientRect();
    return { x: s.x, y: s.y, width: s.width, height: s.height };
  });
  const shot = `/tmp/rec-${c.id}.png`;
  await p.screenshot({ path: shot, clip: box });
  await p.close();

  /* Match on LEAF height: the photo's leaf and ours must be the same number of
     pixels tall, or every proportion below is read against a different ruler. */
  const photo = load(`research/works/doors/${c.id}.jpeg`);
  const ours  = load(shot);
  const H = 1100;
  const photoScale = H / rec.leaf.h;
  const pw = Math.round(photo.w * photoScale), ph = Math.round(photo.h * photoScale);
  // our leaf is ~0.74 of the render's height for a standard door
  const oursScale = H / (ours.h * 0.735);
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
