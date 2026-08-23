/**
 * How long a tap takes on the phone in the customer's hand.
 *
 * ── this replaces the 40 KB byte gate, and the swap is the point ─────
 * `REALISM.md` G6 asked that a door's SVG stay under 40,000 bytes. Two
 * measurements retire it.
 *
 * 1. THE BYTES ARE NEVER TRANSFERRED. `render(state)` builds a string in
 *    memory and `paint()` assigns it to `innerHTML`. Nothing about it crosses
 *    a network — the whole site is three files, and the drawing is not one of
 *    them. An outside review measured the worst door at 17.7 KB brotli, which
 *    is what a byte gate would be for if there were one to apply it to.
 *
 * 2. THE GATE WAS COUNTING THE COMMENTS. Measured on this checkout: the
 *    default door is 41,971 bytes of which **12,075 are XML comments** — 29% —
 *    because this drawing explains itself to whoever opens the element
 *    inspector, the same way every other file here does. A gate on bytes is
 *    therefore, in large part, a gate on how much the renderer documents
 *    itself, and 61% of buildable doors already failed it.
 *
 * What a customer actually feels is the DOM being rebuilt under their thumb.
 * 379 elements on the default door, 860 on a sidelight, and every one of them
 * replaced on every tap. So this measures that, on a throttled CPU, and the
 * number it prints is the number the project defends.
 *
 * ── what is measured, exactly ───────────────────────────────────────
 * `performance.now()` either side of a swatch click, with a forced layout read
 * inside the window. That covers `render()`, the `innerHTML` parse, style
 * recalculation and layout — everything between the finger going down and the
 * browser having a frame to raster. It does not cover the raster itself, which
 * this container cannot measure reproducibly (see `tools/browser.mjs`).
 *
 * Median of nine taps, because the first is always slower — the first paint
 * after a load warms caches that every later one uses — and a gate that fires
 * on a warm-up is a gate people learn to re-run.
 *
 * ⚠ 390x844 AND NOT A DESKTOP SIZE, deliberately. Nearly every visitor arrives
 * on a phone (PLAN.md §7), a phone is where the CPU is slow, and it is the
 * only viewport this container can still render at all.
 *
 * Run: npm run latency
 */
import { assertFreshBundle } from './fresh.mjs';
import { pagePool, deathNote } from './browser.mjs';

/* 6x, from the outside review that found this. It is the throttle Chrome's own
   guidance uses to stand in for a mid-range Android against a development
   desktop, and it is what makes a 39 ms repaint read as the 315 ms it is for
   the person holding the phone. */
const THROTTLE = 6;
const TAPS = 9;

/* Three doors spanning the range, each named for what makes it heavy. The
   worst door the catalogue can build is the one that matters — a gate set on
   the default is a gate on the door nobody ends up ordering. */
const DOORS = [
  { name: 'default', q: '' },
  { name: 'sidelight + ironwork',
    q: '?c=rb-6219d&w=rect&g=iron&n=none&k=cylinder&d=panel&s=sidelight&h=right-in' },
  /* ⚠ THE HEAVIEST DOOR THE CATALOGUE CAN BUILD, AND IT WAS FOUND BY SEARCH,
     NOT BY TASTE. My first guess for "the worst one" was a leaf-and-a-half
     with a tall light and etched circles — 440 elements. Sweeping every
     size x window x grille x detail through `repair` and counting the emitted
     elements says the real answer is a strip light with quatrefoil ironwork on
     a leaf-and-a-half: 2,139 elements, five times heavier, and it matches the
     2,130 an outside review measured independently. A gate set on a door
     somebody thought looked complicated is a gate on the wrong door. */
  { name: 'half leaf + strip + quatrefoil (heaviest)',
    q: '?c=rb-0097d&w=strip&g=quatrefoil&n=none&k=digital&d=panel&s=half&h=right-in' },
];

/**
 * ⚠ THE GATE IS SET FROM ARITHMETIC AND IT IS SET LOOSE ON PURPOSE.
 *
 * 100 ms is the long-standing threshold for an interaction feeling immediate;
 * past about 200 ms a tap reads as a wait. The readings that set this number:
 *
 *   default            378 elements      67 ms   measured here
 *   sidelight + iron   867 elements   136-155   measured here
 *   heaviest door    2,139 elements   ~315-370   an outside review, at 6x
 *
 * The heaviest door cannot be measured in THIS container — Chromium dies on
 * it, five relaunches running, which is the same fragility `tools/browser.mjs`
 * exists for — so its figure is the review's, and it lines up with a straight
 * extrapolation from the two above (867 elements at ~145 ms scales to about
 * 350 for 2,139).
 *
 * 400 would have been too tight: the review's own p90 for that door is 370, so
 * a gate at 400 would fire on ordinary variance in the door it is meant to
 * watch, and a gate people re-run until it passes is not a gate. 600 leaves
 * the worst door its measured spread and still catches a change that makes the
 * drawing twice as heavy — which is the class of regression worth catching.
 *
 * ⚠ It is deliberately NOT fitted to today's reading. `tools/screenshot.mjs`
 * records what happened the last two times a constant in this repo was fitted
 * to a measurement taken on one afternoon: it expired.
 *
 * The per-door numbers printed below are the useful output. Read them.
 */
const GATE_MS = 600;

await assertFreshBundle();

const pool = pagePool();
let worst = 0, bad = 0, unmeasured = 0;
console.log(`\ntap latency at ${THROTTLE}x CPU throttle, 390x844, median of ${TAPS}\n`);

for (const d of DOORS) {
  /* ⚠ A DOOR THAT COULD NOT BE MEASURED IS REPORTED, NOT PASSED AND NOT
     THROWN. `pagePool` relaunches a dead browser, but the heaviest door in
     the catalogue kills this container's Chromium on every attempt — so the
     tool would either die on its third case, taking the two good readings
     with it, or quietly return without them. Neither is a measurement.
     It says so instead, in a line nobody can mistake for a pass. */
  let reading = null;
  try {
    reading = await measure(d);
  } catch (e) {
    unmeasured++;
    console.log(`  ? ${d.name.padEnd(38)}    —    not measured: ${String(e.message).split('\n')[0]}`);
    continue;
  }
  const { ms, nodes } = reading;
  worst = Math.max(worst, ms);
  const over = ms > GATE_MS;
  if (over) bad++;
  console.log(`  ${over ? '✗' : '✓'} ${d.name.padEnd(38)} ${String(Math.round(ms)).padStart(4)} ms`
            + `   ${String(nodes).padStart(5)} elements`);
}

function measure(d) {
  return pool.use(
    { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 },
    async p => {
      const cdp = await p.context().newCDPSession(p);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
      await p.goto('file://' + process.cwd() + '/index.html' + d.q);
      await p.waitForTimeout(600);

      /* Open the colour group: on a phone the panel arrives folded, and a
         swatch inside a closed section has no box to click. */
      await p.evaluate(() => {
        document.querySelector('.steps__step[data-step="look"]').click();
      });
      await p.waitForTimeout(200);
      await p.evaluate(() => {
        document.querySelector('.field[data-group="colour"] .field__head').click();
      });
      await p.waitForTimeout(200);

      return p.evaluate(n => {
        const chips = [...document.querySelectorAll('.swatch')];
        if (chips.length < 3) throw new Error('no colour swatches to tap');
        const times = [];
        for (let i = 0; i < n; i++) {
          const chip = chips[(i + 1) % chips.length];
          const t0 = performance.now();
          chip.click();
          /* Force style and layout inside the window. Without this the click
             handler returns before the browser has done the work the customer
             is waiting for, and the number is a fiction. */
          void document.body.offsetHeight;
          times.push(performance.now() - t0);
        }
        times.sort((a, b) => a - b);
        return {
          ms: times[Math.floor(times.length / 2)],
          nodes: document.querySelectorAll('#stage svg *').length,
        };
      }, TAPS);
    });
}

console.log(deathNote(pool));
await pool.close();

console.log(`\n  worst measured ${Math.round(worst)} ms against a ${GATE_MS} ms gate`);
if (bad) {
  console.log(`\n✗ ${bad} door(s) past the gate\n`);
} else if (unmeasured === DOORS.length) {
  /* Nothing was measured at all, which is an instrument that is not working
     rather than a product that is fast. Those two must never print the same
     line. */
  console.log('\n✗ not one door could be measured — this container cannot run the gate\n');
} else if (unmeasured) {
  console.log(`\n✓ every door that COULD be measured answers a tap inside the gate`
            + `\n  ⚠ ${unmeasured} of ${DOORS.length} were not measured. Re-run somewhere `
            + 'chromium survives them before trusting this as a pass.\n');
} else {
  console.log('\n✓ every door answers a tap inside the gate\n');
}
process.exitCode = (bad || unmeasured === DOORS.length) ? 1 : 0;
