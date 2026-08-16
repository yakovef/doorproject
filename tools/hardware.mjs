/**
 * Close crops of the lock stile, one per handle style.
 *
 * The handle and the lock are the only things on the door a visitor looks at
 * from arm's length, and they are where the drawing gets caught: a pull bar
 * running through the keyhole reads as fake instantly. These crops exist so
 * that failure is visible without hunting for it in a full-door screenshot.
 *
 * Run: npm run hardware
 */
import { chromium } from 'playwright';

const CASES = [
  ['lock-bar',     'n=bar-long&f=steel'],
  ['lock-channel', 'n=channel&f=steel'],
  ['lock-lever',   'n=lever&f=steel'],
  ['lock-plate',   'n=plate&f=steel'],
  ['lock-plate-brass', 'n=plate&f=brass'],
  // the inside face flips the handle to the other side, so hang the door the
  // other way round for these two and the crop still lands on the furniture
  ['lock-plate-in', 'n=plate&f=steel&i=1&h=left-in'],
  ['lock-dee',     'n=dee&f=black'],
  ['lock-inside',  'n=lever&f=steel&i=1&h=left-in'],
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, opts] of CASES) {
  const q = `?bare=1&v=3&c=ral-7016&w=none&g=none&d=plain&s=standard&h=right-in&${opts}`
    .replace(/h=right-in&(?=.*\bh=)/, '');   // a per-case h= wins
  const p = await b.newPage({ viewport: { width: 900, height: 1100 }, deviceScaleFactor: 2 });
  await p.goto('file://' + process.cwd() + '/index.html' + q);
  await p.waitForTimeout(600);
  const box = await p.locator('#stage svg').boundingBox();
  await p.screenshot({
    path: `screenshots/${name}.png`,
    clip: {
      x: box.x + box.width * 0.45, y: box.y + box.height * 0.36,
      width: box.width * 0.55, height: box.height * 0.34,
    },
  });
  console.log(name, 'ok');
  await p.close();
}
await b.close();
