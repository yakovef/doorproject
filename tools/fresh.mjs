/**
 * Is the bundle the browser will load actually built from the source on disk?
 *
 * ── why this exists ──────────────────────────────────────────────────
 * Every tool that opens `index.html` — the audit, the collision sweep, the
 * recreations, the screenshots, the fuzzer — measures `assets/bundle.js`, and
 * that file is only rewritten by `npm run build`. Change the renderer, run any
 * of them, and they photograph the PREVIOUS commit while reporting on the
 * current one.
 *
 * It is the project's oldest failure mode in yet another costume (CLAUDE.md
 * §5): nothing throws, nothing is missing, the page works — and it is the
 * wrong page. It cost a wrong conclusion during the ring-pitch measurement:
 * the drawing was changed, the comparison came back byte-identical, and the
 * obvious reading was "the change did nothing".
 *
 * `npm test` already catches a stale bundle, because it asserts the `?v=` hash
 * in index.html against the file's contents. But the browser tools are exactly
 * the ones people run WITHOUT the suite, in a tight loop, while changing the
 * drawing.
 *
 * ── why it rebuilds instead of comparing timestamps ──────────────────
 * An mtime comparison is the cheap version and it lies after `git checkout`,
 * which rewrites every file to the same moment in no useful order — and the
 * bundle is committed, because GitHub Pages serves it. So the source is built
 * into MEMORY and compared byte for byte. esbuild does it in tens of
 * milliseconds, which is nothing beside launching Chromium.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';

/**
 * Make sure `assets/bundle.js` is exactly what the current `js/` builds to,
 * REBUILDING it if it is not. Call it before launching a browser, not after.
 *
 * It rebuilds rather than scolding, and that is deliberate. The failure this
 * guards against is a person forgetting a step; a guard that only refuses
 * still costs them the whole tool run, and the second time it happens they
 * will reach for `npm run build && npm run whatever` and stop thinking about
 * it. Rebuilding cannot measure the wrong version either way, so the strict
 * version buys nothing but friction. It says so out loud when it acts, because
 * a tool that silently edits the working tree is its own kind of surprise.
 */
/**
 * ── the same problem, one level out: the comparison SHEETS ──────────
 *
 * `assertFreshBundle` stops a tool measuring the previous version of the
 * drawing. Nothing stopped the IMAGES those tools write from doing the same,
 * and the recurring agent caught it: the threshold was made bare aluminium,
 * `npm run shot`'s twelve sheets were regenerated and `npm run recreate`'s ten
 * were not, so the sheets a human opens to judge our door against a photograph
 * — the artefact behind REALISM.md §6, *compare against a photograph, every
 * time* — were showing a threshold the site had stopped drawing. It measured
 * the band: rgb(59,57,60) to rgb(132,130,124), more than double the luminance.
 * That is the whole failure mode of this project in miniature. Nothing throws,
 * every file is present, the picture is the wrong picture — and the next
 * person to open it may "fix" something already fixed.
 *
 * The stamp is a hash of what the DRAWING is — and not of the tool that drew
 * the sheet. A tool's own comments changing is not a reason to spend three
 * minutes regenerating thirty PNGs; the drawing changing is.
 *
 * ⚠ `js/colour.js` is in the list because it was MISSING from it. It exports
 * `darken`, `lighten` and `mix`, and `renderer.js` calls them at 23 gradient
 * sites — so editing one of those three functions moves every gradient in the
 * drawing while all 110 committed sheets go on claiming to be current, because
 * the hash they are stamped against never saw the file that changed them. A
 * staleness check blind to one of the drawing's own inputs is the same class
 * of fault as the staleness it exists to catch.
 */
const SHEET_DEPS = ['js/renderer.js', 'js/catalog.js', 'js/colour.js'];
/**
 * ⚠ AND `npm run shot` DEPENDS ON MORE THAN THE DRAWING.
 *
 * The note above is right for three of the four families: `recreate`, `corpus`
 * and `against` crop the door and nothing else, so the drawing's own files are
 * exactly their inputs. `shot` photographs the WHOLE PAGE — twelve full-page
 * screenshots — so the stylesheet, the markup and the wiring are its inputs
 * too, and none of them were hashed.
 *
 * It had already gone wrong when this was written: the sheets were last made
 * at `4d017df`, five commits then changed `css/app.css`, `js/app.js` and
 * `js/share.js`, and all twelve went on claiming to be current. Regenerating
 * twice gave byte-identical output both times and differed from the committed
 * copy both times, which is what rules out a flaky renderer and leaves only
 * "the pictures are old". Exactly the fault this file exists to catch, through
 * the one door it was not watching — the same shape as `js/colour.js` missing
 * from the list above, one level out.
 *
 * DERIVED, not listed. `assets/bundle.js` is every line of JavaScript the page
 * actually runs, so hashing it covers the drawing, the wiring and the message
 * without a list of files anybody has to remember to extend — and
 * `assertFreshBundle` has already guaranteed it matches the source before any
 * browser tool gets this far.
 */
const PAGE_DEPS = ['assets/bundle.js', 'css/app.css', 'index.html'];
const DEPS_FOR = name => (name === 'shot' ? PAGE_DEPS : SHEET_DEPS);
const STAMP_FILE = 'screenshots/.stamps.json';

const depHash = name => createHash('sha256')
  .update(DEPS_FOR(name).map(f => readFileSync(f)).join('\n')).digest('hex').slice(0, 12);

const readStamps = () => {
  try { return JSON.parse(readFileSync(STAMP_FILE, 'utf8')); } catch { return {}; }
};

/** Called by a sheet-writing tool once it has finished writing them. */
export function stampSheets(name) {
  const all = readStamps();
  all[name] = depHash(name);
  writeFileSync(STAMP_FILE, JSON.stringify(all, null, 2) + '\n');
}

/**
 * Which sheet families are stale, as a list of names. Empty means all current.
 * Returns `{ stale, unknown }` — `unknown` is a family that has never been
 * stamped at all, which is the same problem wearing a different hat.
 */
export function staleSheets(names) {
  const all = readStamps();
  return {
    /* Per family, because they no longer share one set of inputs. */
    stale: names.filter(n => all[n] && all[n] !== depHash(n)),
    unknown: names.filter(n => !all[n]),
  };
}

export async function assertFreshBundle() {
  const options = {
    entryPoints: ['js/app.js'],
    bundle: true,
    format: 'iife',
    target: ['es2020'],
    legalComments: 'none',
    charset: 'utf8',
  };
  const out = await build({ ...options, write: false });
  const built = out.outputFiles[0].text;
  let onDisk = null;
  try { onDisk = readFileSync('assets/bundle.js', 'utf8'); } catch { /* absent */ }
  if (built === onDisk) return false;

  console.log('  ⟳ assets/bundle.js was stale — rebuilding, so this run measures js/ '
            + 'and not the previous version of the drawing');
  writeFileSync('assets/bundle.js', built);
  /* And the hash in index.html, or `npm test` fails on a stamp that is now a
     lie — the same check that catches this staleness in the suite. */
  const html = readFileSync('index.html', 'utf8');
  const stamp = f => createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 8);
  const next = html
    .replace(/(href=")(css\/app\.css)(\?v=[0-9a-f]+)?(")/, `$1$2?v=${stamp('css/app.css')}$4`)
    .replace(/(src=")(assets\/bundle\.js)(\?v=[0-9a-f]+)?(")/, `$1$2?v=${stamp('assets/bundle.js')}$4`);
  if (next !== html) writeFileSync('index.html', next);
  return true;
}
