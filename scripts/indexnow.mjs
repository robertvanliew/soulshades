/* IndexNow: tells Bing (and Yandex, Naver, Seznam, Yep) that pages changed, so
   they recrawl within hours instead of weeks. Bing's index also feeds
   Microsoft Copilot and ChatGPT search, so this is how new pages reach those
   answers quickly. Google does not use IndexNow; it reads the sitemap.

   Ownership is proven by public/<KEY>.txt, whose content is the key.

   Run after a deploy is live:
     npm run indexnow -- --all                 every URL in the sitemap
     npm run indexnow -- /privacy /terms       specific pages
   Only submit pages that actually changed. */
import { readFileSync } from 'node:fs';

const KEY = 'd02d1576a5fa3c02ca1e9fcd5a7236de';
const HOST = 'soulshadesmusic.com';
const args = process.argv.slice(2);

let urls;
if (args.includes('--all')) {
  const xml = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
} else {
  urls = args.map(a => (a.startsWith('http') ? a : `https://${HOST}${a.startsWith('/') ? '' : '/'}${a}`));
}
if (!urls.length) { console.error('indexnow: pass paths/URLs or --all'); process.exit(1); }

const keyCheck = await fetch(`https://${HOST}/${KEY}.txt`);
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
  console.error(`indexnow: key file https://${HOST}/${KEY}.txt is not live yet. Deploy first.`);
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
// 200 = accepted, 202 = accepted (key check pending); anything else is a problem
console.log(`indexnow: HTTP ${res.status} for ${urls.length} URL(s)`);
urls.forEach(u => console.log('  ' + u));
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
