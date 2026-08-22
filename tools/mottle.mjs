/**
 * How uneven is a real door's paint, sideways?
 *
 * Written to settle an argument with my own eye. Beside the photograph our leaf
 * looked blotchy and the obvious move was to turn the drift down. It said the
 * opposite — the photographs run 0.089 and 0.155 and we had far less tonal
 * unevenness than a real door, not more — and that conclusion still holds.
 *
 * ⚠ THE FIGURE FOR OURS IS MEASURED EACH RUN, and it is no longer the 0.032
 * this line used to quote. That number was right the afternoon it was written;
 * `drift` was halved afterwards and the comment was not, so it sat here — and
 * in CLAUDE.md §6 — describing a leaf we had stopped drawing. A plain leaf
 * measures about 0.016. The tool asks the page rather than remembering, which
 * is the rule §7 states and the third tool here to have broken it.
 *
 * Coarse 24x24 grid over the leaf's interior, each row divided by its own mean
 * so the vertical falloff (measured separately, see FALLOFF) drops out and only
 * the horizontal unevenness is left. Sigma of what remains.
 *
 * Run: npm run mottle -- <a png of our leaf>
 */
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
const lum=(d,i)=>0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];
function mottle(img,x,y,w,h){
  const N=24, cell=[];                       // 24 x 24 coarse grid
  for(let r=0;r<N;r++){ const row=[];
    for(let c=0;c<N;c++){
      let s=0,n=0;
      const y0=Math.round(y+h*(0.10+0.80*r/N)), y1=Math.round(y+h*(0.10+0.80*(r+1)/N));
      const x0=Math.round(x+w*(0.18+0.64*c/N)), x1=Math.round(x+w*(0.18+0.64*(c+1)/N));
      for(let j=y0;j<y1;j++) for(let i=x0;i<x1;i++){s+=lum(img.d,(j*img.w+i)*4);n++;}
      row.push(s/n);
    } cell.push(row); }
  // divide each row by its own mean, so only the HORIZONTAL unevenness is left
  let s=0,ss=0,n=0;
  for(const row of cell){ const m=row.reduce((a,b)=>a+b,0)/row.length;
    for(const v of row){ const r=v/m; s+=r; ss+=r*r; n++; } }
  return Math.sqrt(ss/n-(s/n)**2);
}
const j=jpeg.decode(readFileSync('research/works/doors/d062.jpeg'),{useTArray:true});
console.log('d062 photo ', mottle({w:j.width,h:j.height,d:j.data},210,52,592,1519).toFixed(4));
const k=jpeg.decode(readFileSync('research/works/doors/d048.jpeg'),{useTArray:true});
console.log('d048 photo ', mottle({w:k.width,h:k.height,d:k.data},317,214,533,1226).toFixed(4));
if (process.argv[2]) {
  const p = PNG.sync.read(readFileSync(process.argv[2]));
  console.log('ours       ', mottle({w:p.width,h:p.height,d:p.data},0,0,p.width,p.height).toFixed(4));
} else {
  /* ⚠ IT USED TO SAY "pass a PNG of our leaf" — and nobody ever did, so the
     only figure for OURS was the one written into the header the afternoon it
     was measured. `drift` was halved afterwards and the header was not, so the
     0.032 quoted here and in CLAUDE.md §6 outlived the drawing by a wide
     margin: a plain leaf measures 0.016. Exactly the failure §7 names, and the
     third tool in this repo to hold a number about our own drawing rather than
     ask for one. It opens the page now, like glass.mjs.
     Two of ours, because this metric is plainly sensitive to what is ON the
     face — it divides out the vertical fall and nothing else, so a moulding is
     unevenness as far as it is concerned. Printing only a plain leaf against
     d048, which is a two-panel door, compares two different things. Both are
     shown and labelled; which comparison is the fair one is not this tool's
     call to make silently. */
  const { chromium } = await import('playwright');
  const { assertFreshBundle } = await import('./fresh.mjs');
  await assertFreshBundle();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 1 });
  for (const [label, q] of [
    ['ours, plain', 'c=rb-5103d&w=none&g=none&n=none&k=coral&d=plain&s=standard&h=right-in'],
    ['ours, panels', 'c=rb-5103d&w=none&g=none&n=none&k=coral&d=panel2&s=standard&h=left-in'],
  ]) {
    await pg.goto(`file://${process.cwd()}/index.html?bare=1&${q}`);
    await pg.waitForTimeout(400);
    const clip = await pg.evaluate(() => {
      const r = document.querySelector('#stage svg #leaf rect').getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y),
               width: Math.round(r.width), height: Math.round(r.height) };
    });
    const shot = PNG.sync.read(await pg.screenshot({ clip }));
    console.log(label.padEnd(11), '',
      mottle({ w: shot.width, h: shot.height, d: shot.data }, 0, 0, shot.width, shot.height).toFixed(4));
  }
  await b.close();
  console.log('\nd048 is a TWO-PANEL door; d062 was measured for the moulding study.');
  console.log('Compare like with like, and see REDESIGN.md §2.3 on how much of a');
  console.log('photograph\'s figure is the scene rather than the paint.');
}
