/**
 * Build. Authoring-time only — nothing here ships to a visitor.
 *
 * Two jobs.
 *
 * ── 1. one classic script ────────────────────────────────────────────
 * Bundle the ES modules into a single CLASSIC script, so index.html can be
 * opened by double-clicking it. Browsers block `type="module"` over file://,
 * and Peretz needs to be able to open the folder on his own laptop with
 * nothing installed (PLAN.md §3, §8.1).
 *
 * ── 2. make the browser notice ───────────────────────────────────────
 * index.html referenced `css/app.css` and `assets/bundle.js` by bare name, and
 * those two files ARE the site — every line of behaviour and every rule of
 * layout. A returning browser reuses its cached copies of both, so a deploy
 * that changed the entire interface arrived as a page that looked exactly the
 * same. Reported from the outside, in as many words: "I don't see the changes."
 *
 * Nothing was broken and nothing was stale on the server; GitHub Pages had
 * built and published the new commit within a minute. The old files were
 * simply the ones being asked for. That is the project's oldest failure mode
 * (CLAUDE.md §5) wearing yet another costume: no error, no missing file, a
 * page that works — and the wrong one.
 *
 * So each reference now carries a short hash of the file's own contents. Same
 * bytes, same URL, cache still hit; one byte different, different URL, and the
 * browser has no choice but to fetch it. A QUERY STRING rather than a renamed
 * file, because the file must still be openable at `assets/bundle.js` from a
 * folder on a laptop — and `?v=` survives file:// in every browser the audit
 * drives, which is what `npm run audit` proves on every run.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { build, context } from 'esbuild';

/**
 * ⚠ EXPORTED, because `tools/fresh.mjs` needs exactly these and used to keep
 * its own hand-copy. They agreed — but `fresh.mjs` WRITES `assets/bundle.js`,
 * so the day this file gained `minify`, or moved `target`, every browser tool
 * would have silently overwritten the correct bundle with a differently-built
 * one and re-stamped `index.html` to match. Two definitions of how this
 * project is built, one of them able to overwrite the other's output.
 */
export const options = {
  entryPoints: ['js/app.js'],
  bundle: true,
  format: 'iife',          // classic script: works from file://
  /* es2020, because the short code is built on BigInt (url-state.js: the
     field layout is 35 bits wide and `<<` truncates at 32). Under es2019
     esbuild warned on every BigInt literal and passed it through unchanged —
     the bundle worked, but five standing warnings on every build is exactly
     where a real one hides. BigInt has shipped everywhere since Safari 14. */
  target: ['es2020'],
  outfile: 'assets/bundle.js',
  legalComments: 'none',
  charset: 'utf8',
};

/** Eight hex characters of the file's own contents. */
const stamp = file => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 8);

/**
 * Rewrite index.html's asset references to carry the current hashes.
 *
 * Idempotent by construction: the pattern matches the reference with OR
 * without an existing `?v=`, so running the build twice is a no-op rather than
 * a growing chain of query strings.
 */
function stampHtml() {
  const file = 'index.html';
  const before = readFileSync(file, 'utf8');
  let html = before;
  const refs = [
    [/(href=")(css\/app\.css)(\?v=[0-9a-f]+)?(")/, 'css/app.css'],
    [/(src=")(assets\/bundle\.js)(\?v=[0-9a-f]+)?(")/, 'assets/bundle.js'],
    /* The photographed room. It is referenced from ONE place — the
       `<link rel="preload" id="room-src">` in the head — because the
       stylesheet and `js/app.js` both need it and a filename written twice is
       a second download of the same 82 KB with nothing visibly wrong. See the
       comment above that tag. */
    [/(href=")(assets\/room\.webp)(\?v=[0-9a-f]+)?(")/, 'assets/room.webp'],
  ];
  for (const [re, path] of refs) {
    if (!re.test(html)) throw new Error(`index.html no longer references ${path}`);
    html = html.replace(re, `$1$2?v=${stamp(path)}$4`);
  }
  if (html !== before) {
    writeFileSync(file, html);
    console.log('stamped index.html with the current asset hashes');
  }
  return html;
}

/* ⚠ ONLY WHEN THIS FILE IS THE COMMAND. `tools/fresh.mjs` imports `options`
   from here so the two cannot drift, and a top-level build would then fire —
   writing the bundle and re-stamping index.html — merely because something
   asked what the build options are. `npm run build` and `npm run dev` are
   unaffected: there, this file IS argv[1]. */
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--watch')) {
    const ctx = await context(options);
    await ctx.watch();
    stampHtml();
    console.log('watching…');
  } else {
    await build(options);
    console.log('built assets/bundle.js');
    stampHtml();
  }
}
