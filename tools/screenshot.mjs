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
   the notice, nobody was reading it.

   The retired KEYS are gone from every query too: `z` (the glazing axis), `f`
   (handle finish) and `a` (add-ons). `fromQuery` still ignores them, so the
   old lines went on producing valid doors — which is exactly why they sat
   there for three rounds describing choices the site no longer offers. A tool
   that reads as documentation should not be documenting a dead vocabulary.

   Between them the twelve queries now name all four window sizes and seven of
   the fourteen window designs, so the sheet is a look at the rebuilt list and
   not only at the layout. */
const SHOTS = [
  { name: 'phone',    w: 390,  h: 844, full: true,
    /* `k=coral` until the bar-versus-lever refusal was withdrawn. A bar now has
       to stand clear of whatever the lever reaches, which on a glazed leaf
       leaves it nowhere to go — so a bar beside a WINDOW keeps its cylinder,
       which is what eight of the ten installed bar doors carry anyway. */
    q: '?c=rb-9016d&w=rect&g=mesh&n=idan&k=cylinder&d=panel&s=standard&h=right-in' },
  { name: 'laptop',   w: 1280, h: 720,
    q: '?c=rb-9005d&w=none&g=none&n=channel&k=plate&d=plain&s=standard&h=right-in' },
  { name: 'desktop',  w: 1680, h: 950,
    /* The other way round from `phone`, deliberately: this one keeps the lever
       and gives up the bar, so the sheet carries both halves of that trade.
       `broad` is the widest opening, which is where the panel below has least
       room and the architrave least stile — the shot to look at first when
       something has moved. */
    q: '?c=rb-6459d&w=broad&g=grid&n=none&k=coral&d=panel&s=standard&h=right-in' },
  { name: 'panel',    w: 1280, h: 720,
    /* The Almog swan-neck reaches 220 mm inboard — the deepest fitting we sell
       — so it is the one that leaves a bar least room beside a light. */
    q: '?c=rb-rb09d&w=tallwin&g=iron&n=none&k=almog&d=plain&s=standard&h=right-in' },
  { name: 'grey',     w: 1280, h: 720,
    /* Worked GLASS rather than ironwork: the rings are etched in the pane, so
       nothing here casts a shadow or takes a highlight. */
    q: '?c=rb-7110d&w=rect&g=circles&n=none&k=coral&d=panel&s=standard&h=right-in' },
  { name: 'plate',    w: 1280, h: 720,
    /* The two-panel face lives here now, because it needs a SOLID leaf: a
       window takes the upper panel's place, and the sheet's only panel2 shot
       used to carry a strip light, so it photographed a one-panel door under a
       name and a price for two. That is the defect this round fixed, and the
       shot that was hiding it. */
    q: '?c=rb-9016d&w=none&g=none&n=none&k=plate&d=panel2&s=standard&h=right-in' },
  { name: 'strips',   w: 1280, h: 720,
    q: '?c=rb-0097d&w=none&g=none&n=shiran&k=cadoor&d=strips&s=standard&h=right-in' },
  /* Round five: the two new axes and the new hardware, each on a door that
     shows it plainly. */
  { name: 'stripsv',  w: 1280, h: 720,
    q: '?c=rb-7322d&w=none&g=none&n=blade&k=square&d=stripsv&s=standard&h=right-in' },
  { name: 'digital',  w: 1280, h: 720,
    q: '?c=rb-9302d&w=none&g=none&n=idan&k=digital&d=plain&s=standard&h=left-in' },
  { name: 'sidelight', w: 1280, h: 720,
    /* Reeded glass used to ride in on `z=reeded` over a SOLID leaf, which drew
       nothing at all — there was no pane for it to be in. It is a window
       design now, so this shot needs a window to show it — and a window is
       what takes the Coral lever's place: a bar and a lever cannot both have
       the stile once glass has the middle of the leaf, so this is the cylinder
       eight of the ten installed bar doors carry. d122, the real sidelight
       door, is one of them. */
    q: '?c=rb-6219d&w=rect&g=reeded&n=idan&k=cylinder&d=plain&s=sidelight&h=right-in' },
  { name: 'halfleaf', w: 1280, h: 720,
    q: '?c=rb-9001d&w=rect&g=quatrefoil&n=none&k=sapir&d=plain&s=half&h=left-in' },
  { name: 'tablet',   w: 834,  h: 1112, full: true,
    q: '?c=rb-2030d&w=strip&g=scroll&n=none&k=knobplate&d=panel&s=tall&h=left-in' },
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
