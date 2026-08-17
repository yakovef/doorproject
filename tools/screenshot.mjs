/**
 * The page, at the sizes people actually hold it.
 *
 * Every shot goes through the real page rather than `bare`, because half of
 * what goes wrong here is layout: a swatch list that pushes the door off
 * screen, a stage that letterboxes, a room that stops in a rectangle.
 *
 * The queries used to name colours and handles that no longer exist. They kept
 * working — every one of them is an alias — so the sheet quietly went on
 * photographing eight doors out of a catalogue that had grown to far more, and
 * one of them was the inside view, a feature that had been removed.
 *
 * Run: npm run shot
 */
import { chromium } from 'playwright';

const SHOTS = [
  { name: 'phone',    w: 390,  h: 844, full: true,
    q: '?c=rb-9016d&w=rect&g=lattice&n=idan&d=panel&f=steel&s=standard&h=right-in' },
  { name: 'laptop',   w: 1280, h: 720,
    q: '?c=rb-9005d&w=none&g=none&n=channel&d=groove&f=black&s=standard&h=right-in' },
  { name: 'desktop',  w: 1680, h: 950,
    q: '?c=rb-6459d&w=tallwin&g=grid&n=idan&d=panel&f=steel&s=standard&h=right-in' },
  { name: 'panel',    w: 1280, h: 720,
    q: '?c=rb-rb09d&w=tallwin&g=bars&n=ella&d=both&f=brass&s=standard&h=right-in' },
  { name: 'grey',     w: 1280, h: 720,
    q: '?c=rb-7110d&w=rect&g=lattice&n=coral&d=panel&f=steel&s=standard&h=right-in' },
  { name: 'plate',    w: 1280, h: 720,
    q: '?c=rb-9016d&w=none&g=none&n=plate&d=plain&f=brass&s=standard&h=right-in' },
  { name: 'strips',   w: 1280, h: 720,
    q: '?c=rb-0097d&w=none&g=none&n=shiran&d=strips&f=black&s=standard&h=right-in' },
  { name: 'halfleaf', w: 1280, h: 720,
    q: '?c=rb-9001d&w=duo&g=bars&n=nitzan&d=groove&f=steel&s=half&h=left-in' },
  { name: 'tablet',   w: 834,  h: 1112, full: true,
    q: '?c=rb-2030d&w=strip&g=scroll&n=luna&d=panel2&f=brass&s=tall&h=left-in' },
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let bad = 0;
for (const s of SHOTS) {
  const p = await b.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html' + s.q);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `screenshots/${s.name}.png`, fullPage: !!s.full });
  if (errs.length) bad++;
  console.log(s.name.padEnd(9), errs.length ? 'ERRORS: ' + errs.join(' | ') : 'clean');
  await p.close();
}
await b.close();
process.exitCode = bad ? 1 : 0;
