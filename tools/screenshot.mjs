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
import { fromQuery } from '../js/url-state.js';

/* Every query here must be a BUILDABLE door. They go through the same rules
   the page does, so one that breaks a rule arrives repaired and the sheet
   quietly photographs a different design than the one named. The old
   `d=both` line is the case in point: panel-plus-groove was retired this
   round, and that query now opens a plain panel.

   That warning was a comment, and a comment is not a check. It has since gone
   wrong twice more without a word: `grey` named a Coral lever while the
   lockset-versus-glazing rule was live, so the sheet photographed a plain
   cylinder for months; and `laptop` named a recessed channel over a groove.
   Both are fixed below, and the loop now ASKS — `fromQuery` already returns
   the notice, nobody was reading it. */
const SHOTS = [
  { name: 'phone',    w: 390,  h: 844, full: true,
    /* `k=coral` until the bar-versus-lever refusal was withdrawn. A bar now has
       to stand clear of whatever the lever reaches, which on a glazed leaf
       leaves it nowhere to go — so a bar beside a WINDOW keeps its cylinder,
       which is what eight of the ten installed bar doors carry anyway. */
    q: '?c=rb-9016d&w=rect&z=clear&g=lattice&n=idan&k=cylinder&d=panel&f=steel&s=standard&h=right-in&a=peep' },
  { name: 'laptop',   w: 1280, h: 720,
    q: '?c=rb-9005d&w=none&z=clear&g=none&n=channel&k=plate&d=plain&f=black&s=standard&h=right-in&a=peep' },
  { name: 'desktop',  w: 1680, h: 950,
    /* The other way round from `phone`, deliberately: this one keeps the lever
       and gives up the bar, so the sheet carries both halves of that trade. */
    q: '?c=rb-6459d&w=tallwin&z=clear&g=grid&n=none&k=coral&d=panel&f=steel&s=standard&h=right-in&a=peep' },
  { name: 'panel',    w: 1280, h: 720,
    /* The Almog swan-neck reaches 220 mm inboard — the deepest fitting we sell
       — so it is the one that leaves a bar least room beside a light. */
    q: '?c=rb-rb09d&w=tallwin&z=clear&g=bars&n=none&k=almog&d=panel&f=brass&s=standard&h=right-in&a=peep,knocker' },
  { name: 'grey',     w: 1280, h: 720,
    q: '?c=rb-7110d&w=rect&z=obscure&g=lattice&n=none&k=coral&d=panel&f=steel&s=standard&h=right-in&a=peep,mail' },
  { name: 'plate',    w: 1280, h: 720,
    /* The two-panel face lives here now, because it needs a SOLID leaf: a
       window takes the upper panel's place, and the sheet's only panel2 shot
       used to carry a strip light, so it photographed a one-panel door under a
       name and a price for two. That is the defect this round fixed, and the
       shot that was hiding it. */
    q: '?c=rb-9016d&w=none&z=clear&g=none&n=none&k=plate&d=panel2&f=brass&s=standard&h=right-in&a=peep,nameplate' },
  { name: 'strips',   w: 1280, h: 720,
    q: '?c=rb-0097d&w=none&z=clear&g=none&n=shiran&k=cadoor&d=strips&f=black&s=standard&h=right-in&a=peep' },
  /* Round five: the two new axes and the new hardware, each on a door that
     shows it plainly. */
  { name: 'stripsv',  w: 1280, h: 720,
    q: '?c=rb-7322d&w=none&z=clear&g=none&n=blade&k=square&d=stripsv&f=steel&s=standard&h=right-in&a=peep' },
  { name: 'digital',  w: 1280, h: 720,
    q: '?c=rb-9302d&w=none&z=clear&g=none&n=idan&k=digital&d=plain&f=steel&s=standard&h=left-in&a=peep,closer' },
  { name: 'sidelight', w: 1280, h: 720,
    q: '?c=rb-6219d&w=none&z=reeded&g=none&n=idan&k=coral&d=plain&f=steel&s=sidelight&h=right-in&a=peep' },
  { name: 'halfleaf', w: 1280, h: 720,
    q: '?c=rb-9001d&w=duo&z=clear&g=bars&n=none&k=sapir&d=plain&f=steel&s=half&h=left-in&a=peep' },
  { name: 'tablet',   w: 834,  h: 1112, full: true,
    q: '?c=rb-2030d&w=strip&z=clear&g=scroll&n=none&k=knobplate&d=panel&f=brass&s=tall&h=left-in&a=peep,mail' },
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
  /* Did the rules have to change this door on the way in? If so the file on
     disk is not the design named above, and every later comparison against it
     is against something nobody chose. */
  const { notice } = fromQuery(s.q);
  if (notice) errs.push(`the query arrives repaired (${notice}) — this shot is not the door it names`);
  if (errs.length) bad++;
  console.log(s.name.padEnd(9), errs.length ? 'ERRORS: ' + errs.join(' | ') : 'clean');
  await p.close();
}
await b.close();
process.exitCode = bad ? 1 : 0;
