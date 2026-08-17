/**
 * How uneven is a real door's paint, sideways?
 *
 * Written to settle an argument with my own eye. Beside the photograph our leaf
 * looked blotchy and the obvious move was to turn the drift down. This says the
 * opposite: the photographs run 0.089 and 0.155, ours runs 0.032 — we have less
 * than half the tonal unevenness of a real door, not more.
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
  console.log('ours        pass a PNG of our leaf as the first argument');
}
