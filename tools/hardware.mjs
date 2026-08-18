/**
 * Close crops of the lock stile, one per handle in the catalogue.
 *
 * The handle and the lock are the only things on the door a visitor looks at
 * from arm's length, and they are where the drawing gets caught: a pull bar
 * running through the keyhole reads as fake instantly. These crops exist so
 * that failure is visible without hunting for it in a full-door screenshot.
 *
 * The list comes from the catalogue rather than from a copy of it kept here.
 * The copy had drifted: it still named three handles that no longer exist and
 * two `i=1` inside-view shots for a feature that was removed, and it had never
 * heard of the four handles added since. A sheet that silently stops covering
 * new work is worse than no sheet.
 *
 * Run: npm run hardware
 */
import { chromium } from 'playwright';
import { HANDLES, LOCKSETS } from '../js/catalog.js';

/* Both groups, and one pairing of the two — the combination the split exists
   for is a pull bar with a lever-and-cylinder backplate beside it, and that is
   the crop most worth being able to look at. */
const CASES = [
  ...HANDLES.filter(h => h.style !== 'none').map(h => [`grip-${h.id}`, `n=${h.id}&k=coral&f=steel`]),
  ...LOCKSETS.map(k => [`lock-${k.id}`, `n=none&k=${k.id}&f=steel`]),
  ['pair-idan-plate',  'n=idan&k=plate&f=steel'],
  ['pair-shahar-almog', 'n=shahar&k=almog&f=brass'],
  ['lock-plate-brass', 'n=none&k=plate&f=brass'],
  ['lock-plate-left',  'n=none&k=plate&f=steel&h=left-in'],
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, opts] of CASES) {
  const q = `?bare=1&c=rb-0097d&w=none&g=none&d=plain&s=standard&h=right-in&${opts}`
    .replace(/h=right-in&(?=.*\bh=)/, '');   // a per-case h= wins
  const p = await b.newPage({ viewport: { width: 900, height: 1100 }, deviceScaleFactor: 2 });
  await p.goto('file://' + process.cwd() + '/index.html' + q);
  await p.waitForTimeout(600);

  /* Crop against the LEAF, not against the drawing. Fractions of the whole
     picture move whenever the air around the door changes, and the crop then
     lands somewhere else without anything looking wrong. */
  const leaf = await p.evaluate(() => {
    const r = document.querySelector('#stage svg #leaf rect').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await p.screenshot({
    path: `screenshots/${name}.png`,
    clip: {
      x: leaf.x + leaf.w * 0.42, y: leaf.y + leaf.h * 0.34,
      width: leaf.w * 0.58, height: leaf.h * 0.34,
    },
  });
  console.log(name, 'ok');
  await p.close();
}
console.log(`${CASES.length} crops, ${HANDLES.length} grips, ${LOCKSETS.length} locksets, ` +
            'one finish each');
await b.close();
