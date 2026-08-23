/**
 * A browser that comes back after it dies.
 *
 * ── why this file exists ─────────────────────────────────────────────
 * Chromium in this container kills its own renderer under raster pressure,
 * and it does it at no fixed threshold. Measured on one afternoon, at the
 * settings the tools already shoot at:
 *
 *   npm run shot     one 390x844 page, then `Target crashed` on the second
 *   npm run audit    five viewports clean, then `Target crashed` at the sixth
 *   a scratch probe  four heavy pages, then the whole browser gone
 *   the same probe with --disable-gpu   three pages
 *
 * The same commands were green on the same commit in a different container an
 * hour earlier, and `--disable-gpu`, `--disable-dev-shm-usage` and a 16 GB
 * `/dev/shm` change nothing. `tools/screenshot.mjs` has already met this once
 * and its long note records the conclusion the hard way: **the ceiling moves
 * with load, and any constant fitted to it is a guess with an expiry date.**
 *
 * So the tools stop trying to stay under a ceiling and learn to survive
 * hitting one.
 *
 * ── what this is NOT ─────────────────────────────────────────────────
 * ⚠ It is not a retry that makes a failing check pass. A crashed renderer is
 * the ABSENCE of a measurement, not a measurement that came out badly: there
 * is no screenshot, no `getBBox`, no computed style — the process holding them
 * is gone. Retrying re-takes the same reading; it cannot turn a red one green.
 *
 * The signature is matched narrowly for exactly that reason. Anything that is
 * not the browser dying — a thrown assertion, a selector that does not match,
 * a timeout waiting for an element, a page error the tool is there to report —
 * is rethrown untouched on the first attempt.
 *
 * And every relaunch PRINTS. A run that needed six of them says so, so nobody
 * reads a sheet regenerated across a dozen crashes as a quiet, healthy run.
 */
import { chromium } from 'playwright';

const LAUNCH = { executablePath: '/opt/pw-browsers/chromium' };

/**
 * The browser died, as distinct from the page misbehaving.
 *
 * Playwright reports the same event under several wordings depending on which
 * call was in flight when it happened — a screenshot in progress says one
 * thing, an `evaluate` another, and a call made after the browser object is
 * already dead a third.
 */
export const crashed = err => /target crashed|target closed|browser has been closed|target page, context or browser has been closed|browser has disconnected/i
  .test(String((err && err.message) || err));

/**
 * A browser you borrow pages from, which relaunches itself when it dies.
 *
 * `use(opts, fn)` opens a page, hands it to `fn`, closes it and returns what
 * `fn` returned. If the browser dies at any point in there, everything from
 * this attempt is discarded — the page and the browser both — and `fn` runs
 * again from the start on a fresh browser. `fn` must therefore be safe to run
 * twice: take the shot, make the measurement, return it. Do not accumulate
 * into an outer array inside `fn`; return the value and let the caller push.
 */
export function pagePool({ tries = 5, args } = {}) {
  let b = null;
  let deaths = 0;

  const boot = async () => (b || (b = await chromium.launch(args ? { ...LAUNCH, args } : LAUNCH)));
  const bury = async () => { const old = b; b = null; await old?.close().catch(() => {}); };

  return {
    async use(opts, fn) {
      let last;
      for (let n = 1; n <= tries; n++) {
        let p = null;
        try {
          await boot();
          p = await b.newPage(opts);
          const out = await fn(p);
          await p.close().catch(() => {});
          return out;
        } catch (e) {
          last = e;
          if (!crashed(e)) { await p?.close().catch(() => {}); throw e; }
          deaths++;
          await bury();
          console.log(`  (chromium died — relaunching, attempt ${n + 1} of ${tries})`);
        }
      }
      throw last;
    },

    /** How many times the browser had to be rebuilt. Worth printing at the end. */
    deaths: () => deaths,

    async close() { await bury(); },
  };
}

/** One line for the foot of a run, or nothing at all when nothing died. */
export const deathNote = pool => (pool.deaths()
  ? `\n  ⚠ chromium died and was relaunched ${pool.deaths()} time(s) during this run.\n`
    + '    The artefacts are still made from this page — a crash destroys a\n'
    + '    reading, it does not falsify one — but a container that does this\n'
    + '    often is a container to distrust for timing measurements.'
  : '');
