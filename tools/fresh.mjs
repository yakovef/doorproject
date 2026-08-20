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
