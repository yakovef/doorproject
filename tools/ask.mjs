/**
 * The two pictures ASK-CHAVA.md question 1 depends on, plus the handle sheet
 * for question 2. A picture gets these answered; a definition does not.
 *
 * Run: npm run ask
 */
import { chromium } from 'playwright';

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const shot = async (name, q, clip) => {
  const p = await b.newPage({ viewport: { width: 760, height: 1120 }, deviceScaleFactor: 2 });
  await p.goto(`file://${process.cwd()}/index.html?bare=1&v=4&${q}`);
  await p.waitForTimeout(450);
  const box = await p.locator('#stage svg').boundingBox();
  await p.screenshot({ path: `screenshots/${name}.png`, clip: clip ? clip(box) : box });
  await p.close();
};

// Question 1: the same door hung both ways, nothing else different.
const base = 'c=ral-7016&w=none&g=none&d=plain&s=standard&f=steel&n=plate';
await shot('handing-a', `${base}&h=right-in`);
await shot('handing-b', `${base}&h=left-in`);
console.log('handing-a / handing-b');
await b.close();
