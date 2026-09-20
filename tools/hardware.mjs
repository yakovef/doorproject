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
/* ⚠ `f=steel` AND `f=brass` WERE ON EVERY CASE AND `f` IS A RETIRED PARAMETER.
   The handle-finish axis was withdrawn and `fromQuery` ignores `f=` outright,
   so every crop here was steel whatever it said — and the two cases whose
   whole subject was brass (`pair-shahar-almog`, `lock-plate-brass`) were
   byte-identical to their steel neighbours while claiming otherwise. Brass
   comes from the פרזול now, so they ask for it: `pz=pz-gold`.
   ⚠ And `almog` is a withdrawn id that resolves to `sapir`, so the case is
   named for the fitting it actually photographs. */
const CASES = [
  ...HANDLES.filter(h => h.style !== 'none').map(h => [`grip-${h.id}`, `n=${h.id}&k=coral`]),
  ...LOCKSETS.map(k => [`lock-${k.id}`, `n=none&k=${k.id}`]),
  ['pair-idan-plate',  'n=idan&k=plate'],
  ['pair-nitzan-sapir', 'n=nitzan&k=sapir&pz=pz-gold'],
  ['lock-plate-brass', 'n=none&k=plate&pz=pz-gold'],
  ['lock-plate-left',  'n=none&k=plate&h=left-in'],
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, opts] of CASES) {
  const q = `?bare=1&c=rb-0097d&w=none&g=none&d=plain&s=standard&h=right-in&${opts}`
    .replace(/h=right-in&(?=.*\bh=)/, '');   // a per-case h= wins
  const p = await b.newPage({ viewport: { width: 900, height: 1100 }, deviceScaleFactor: 2 });
  await p.goto('file://' + process.cwd() + '/index.html' + q);
  await p.waitForTimeout(600);

  /* ⚠ CROP AGAINST THE FITTINGS THEMSELVES, AND THE FRACTIONS THIS REPLACES
     WERE PHOTOGRAPHING THE HINGE SIDE OF THE DOOR.
     It cropped `leaf.x + leaf.w * 0.42` rightward — the right-hand 58% of the
     leaf — which is where the lock is on a LEFT-handed door. Every case here
     but one is `h=right-in`, and on a right-in door, viewed from the street,
     the cylinder is on the LEFT (see HANDINGS: "a left door is a keyhole on
     the right"). So **20 of these 21 crops were bare paint**, on the sheet
     whose docstring says it exists "so that failure is visible without hunting
     for it in a full-door screenshot" — and the loop printed `ok` for every
     one. The single case that worked, `lock-plate-left`, is the single case
     that passes `h=left-in`, which is what made it findable.
     The cure is §7's standing rule rather than a mirrored fraction: ASK THE
     PAGE. A union of the drawn fitting boxes cannot be wrong about handing,
     about a fitting that moves, or about one added later — and it throws
     rather than photographing paint if it finds nothing, because a crop of
     bare leaf that reports `ok` is how this survived. */
  const box = await p.evaluate(() => {
    /* ⚠ `[data-hw]`, NOT A LIST OF ITS VALUES. There are five in the drawing —
       `handle`, `grab`, `lockset`, `lockset-art` and `lock` (the cylinder and
       the extra lock) — and the first version of this named two of them and
       threw on `lock-plate`, whose furniture is `lockset`. Which is the guard
       below working, and the reason it is a throw. Any fitting the drawing
       marks is a fitting this sheet should frame. */
    const els = [...document.querySelectorAll('#stage svg [data-hw]')];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
    }
    return x1 > x0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
  });
  if (!box) throw new Error(`${name}: no [data-hw] fitting on the page — the crop would be bare leaf`);
  /* Air around it, so the fitting is seen ON the door rather than cut out of
     it: a quarter of its own size, and never less than 40 px. */
  const padX = Math.max(40, box.w * 0.25), padY = Math.max(40, box.h * 0.25);
  await p.screenshot({
    path: `screenshots/${name}.png`,
    clip: { x: box.x - padX, y: box.y - padY, width: box.w + padX * 2, height: box.h + padY * 2 },
  });
  console.log(`${name} ok  (${Math.round(box.w)}x${Math.round(box.h)} of fitting)`);
  await p.close();
}
console.log(`${CASES.length} crops, ${HANDLES.length} grips, ${LOCKSETS.length} locksets, ` +
            'one finish each');
await b.close();
