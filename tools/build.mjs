/**
 * Build. Authoring-time only — nothing here ships to a visitor.
 *
 * Its one job today: bundle the ES modules into a single CLASSIC script, so
 * index.html can be opened by double-clicking it. Browsers block
 * `type="module"` over file://, and Peretz needs to be able to open the folder
 * on his own laptop with nothing installed (PLAN.md §3, §8.1).
 */
import { build, context } from 'esbuild';

const options = {
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

if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('watching…');
} else {
  await build(options);
  console.log('built assets/bundle.js');
}
