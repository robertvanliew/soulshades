/* Runs after `vite build`. Writes real HTML for every page into dist/.

   Why: the site is a React app, so the built index.html is an empty shell
   that fills in once JavaScript runs. Google runs JavaScript; most AI search
   crawlers (ChatGPT, Perplexity, Claude) and every link-preview service do
   not, so to them the site was blank. This renders each page to a string at
   build time (no browser needed) and saves it as a static file:

     /            -> dist/index.html
     /privacy     -> dist/privacy.html      (Vercel cleanUrls serves it at /privacy)
     any other    -> dist/404.html          (served with a real 404 status)

   The browser still loads the same app on top and takes over the page, so
   nothing changes for visitors. If any page fails to render, the build fails
   rather than shipping a site with missing pages. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createServer } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
// Stamp the commit being built (Vercel sets VERCEL_GIT_COMMIT_SHA) so the
// IndexNow workflow can tell when this version is the one serving the site.
const BUILD = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
const template = readFileSync(join(dist, 'index.html'), 'utf8')
  .replace('</head>', `    <meta name="soulshades-build" content="${BUILD}" />
  </head>`);

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });

/** React puts <title>, <meta> and <link> ahead of the page markup; split them off for <head>. */
function split(rendered) {
  const at = rendered.search(/<(?!title|meta|link)[a-z]/i);
  return { head: rendered.slice(0, at), body: rendered.slice(at) };
}

function page(rendered) {
  let { head, body } = split(rendered);
  // Page-specific tags are marked so the app removes them before adding its
  // own (src/main.tsx); image preload hints are left alone.
  head = head.replace(/<(title|meta|link rel="canonical")/g, '<$1 data-rh="true"').replace(/<title data-rh="true">/, '<title data-rh="true">');
  // Scroll-reveal sections render hidden until JavaScript animates them in.
  // In the static file they are shown, so the text is visible without scripts.
  body = body.replace(/style="opacity:0(?:;transform:[^";]+)?"/g, '');
  return template
    // drop the home page's static tags; this page brings its own
    .replace(/\s*<(?:title|meta|link) data-rh="true"[^>]*>(?:[^<]*<\/title>)?/g, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

let failed = false;
try {
  const { render, PRERENDER_PATHS } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const targets = [...PRERENDER_PATHS.map(p => [p, p === '/' ? 'index.html' : `${p.slice(1)}.html`]), ['/this-page-does-not-exist', '404.html']];
  for (const [path, file] of targets) {
    const html = page(render(path));
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const titles = (html.match(/<title/g) || []).length;
    if (titles !== 1 || !html.includes('<h1') || text.length < 300) {
      throw new Error(`${path}: unexpected output (titles=${titles}, text=${text.length} chars)`);
    }
    mkdirSync(dirname(join(dist, file)), { recursive: true });
    writeFileSync(join(dist, file), html);
    console.log(`prerendered ${path.padEnd(28)} -> dist/${file.padEnd(16)} ${(html.length / 1024).toFixed(0)} KB, ${text.split(' ').length} words`);
  }
} catch (err) {
  failed = true;
  console.error('\nprerender failed:', err?.stack || err);
} finally {
  await vite.close();
}
process.exit(failed ? 1 : 0);
