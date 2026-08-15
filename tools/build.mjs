/**
 * Build. Authoring-time only — nothing here ships to a visitor.
 *
 * Its one job today: bundle the ES modules into a single CLASSIC script, so
 * index.html can be opened by double-clicking it. Browsers block
 * `type="module"` over file://, and Chava needs to be able to open the folder
 * on his own laptop with nothing installed (PLAN.md §3, §8.1).
 */
import { build, context } from 'esbuild';

const options = {
  entryPoints: ['js/app.js'],
  bundle: true,
  format: 'iife',          // classic script: works from file://
  target: ['es2019'],
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
