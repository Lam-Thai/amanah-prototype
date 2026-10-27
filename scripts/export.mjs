// Static export: crawls the running local WordPress (logged out) and writes a
// self-contained static copy to dist/, ready for GitHub Pages.
//
//   node scripts/export.mjs [--base=/repo-name] [--origin=http://127.0.0.1:9400]
//
// --base is the sub-path the site will be served from ("" for a domain root).
// Every absolute URL of the local site is rewritten to that base.

import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
const ORIGIN = (args.origin || 'http://127.0.0.1:9400').replace(/\/$/, '');
// Default base: package.json → config.pagesBase (e.g. "/amanah-prototype" for user.github.io/amanah-prototype/).
const BASE = (args.base ?? pkg.config?.pagesBase ?? '').replace(/\/$/, '');
const OUT = path.resolve('dist');

const SKIP = /^\/(wp-admin|wp-login\.php|wp-json|xmlrpc\.php|feed|comments\/feed|wp-cron\.php)|\/feed\/?$|[?&](replytocom|p|page_id)=|^\/zz-/;
const ASSET = /\.(css|js|mjs|woff2?|ttf|png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|json|txt)$/i;

const pages = new Set();
const assets = new Set();
const broken = [];
let saved = 0;

const rel = (u) => {
  try {
    const url = new URL(u, ORIGIN + '/');
    return url.origin === ORIGIN ? url : null;
  } catch {
    return null;
  }
};

// Absolute site URLs → base path; covers plain, JSON-escaped and HTML-entity forms.
function rewrite(text) {
  const esc = ORIGIN.replace(/\//g, '\\/');
  return text
    .split(ORIGIN).join(BASE)
    .split(esc).join(BASE.replace(/\//g, '\\/'))
    .split(ORIGIN.replace('http://', 'http:&#x2F;&#x2F;')).join(BASE);
}

// Drop head links that only make sense on a live WordPress (REST API, feeds, RSD, shortlinks).
function stripDynamicHead(html) {
  return html
    .replace(/<link[^>]+rel=["'](https:\/\/api\.w\.org\/|EditURI|shortlink|pingback)["'][^>]*>\s*/g, '')
    .replace(/<link[^>]+type=["'](application\/rss\+xml|application\/json|application\/json\+oembed|text\/xml\+oembed)["'][^>]*>\s*/g, '')
    .replace(/<link[^>]+href=["'][^"']*\/wp-json\/[^"']*["'][^>]*>\s*/g, '')
    .replace(new RegExp(`<link[^>]+rel=["']dns-prefetch["'][^>]+href=["']//${new URL(ORIGIN).hostname.replace(/\./g, '\\.')}["'][^>]*>\\s*`, 'g'), '');
}

function collect(text, baseUrl) {
  const found = new Set();
  for (const m of text.matchAll(/(?:href|src)=["']([^"']+)["']/g)) found.add(m[1]);
  // content= / data-*= hold all sorts of values; only absolute site URLs among them are links.
  for (const m of text.matchAll(/(?:content|data-[\w-]+)=["'](https?:\/\/[^"']+)["']/g)) found.add(m[1]);
  for (const m of text.matchAll(/srcset=["']([^"']+)["']/g)) m[1].split(',').forEach((s) => found.add(s.trim().split(/\s+/)[0]));
  for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) found.add(m[1]);
  for (const m of text.matchAll(/https?:\\?\/\\?\/[^"'\s<>)]+/g)) found.add(m[0].replace(/\\\//g, '/'));
  for (const raw of found) {
    if (raw.startsWith('data:') || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) continue;
    let url;
    try {
      url = new URL(raw.replace(/&amp;/g, '&').replace(/&#0?38;/g, '&'), baseUrl);
    } catch {
      continue;
    }
    if (url.origin !== ORIGIN || SKIP.test(url.pathname + url.search)) continue;
    if (ASSET.test(url.pathname)) assets.add(url.pathname);
    else if (url.pathname.endsWith('/') || !path.extname(url.pathname)) pages.add(url.pathname);
  }
}

async function save(file, data) {
  const dest = path.join(OUT, decodeURIComponent(file));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, data);
}

async function crawlPage(p) {
  const res = await fetch(ORIGIN + p, { redirect: 'manual' });
  if (res.status >= 300 && res.status < 400) {
    const to = rel(res.headers.get('location') || '');
    if (to && !SKIP.test(to.pathname)) (ASSET.test(to.pathname) ? assets : pages).add(to.pathname);
    return;
  }
  if (res.status !== 200) {
    broken.push(`${res.status} ${p}`);
    return;
  }
  const html = await res.text();
  if (/(Warning|Notice|Deprecated|Fatal error)<\/b>:/.test(html)) broken.push(`PHP warning on ${p}`);
  collect(html, ORIGIN + p);
  await save(path.join(p, 'index.html'), rewrite(stripDynamicHead(html)));
  saved++;
}

async function crawlAsset(a) {
  const res = await fetch(ORIGIN + a);
  if (res.status !== 200) {
    broken.push(`${res.status} ${a}`);
    return;
  }
  if (/\.(css|js|mjs|json|svg|txt)$/i.test(a)) {
    const text = await res.text();
    if (a.endsWith('.css')) collect(text, ORIGIN + a);
    await save(a, rewrite(text));
  } else {
    await save(a, Buffer.from(await res.arrayBuffer()));
  }
}

async function main() {
  await fs.rm(OUT, { recursive: true, force: true });

  // Seeds: the front page plus every published page and post the REST API knows about.
  pages.add('/');
  for (const type of ['pages', 'posts']) {
    const res = await fetch(`${ORIGIN}/wp-json/wp/v2/${type}?per_page=100&_fields=link,slug`);
    if (!res.ok) throw new Error(`Is WordPress running at ${ORIGIN}? (${type}: HTTP ${res.status})`);
    for (const item of await res.json()) {
      const u = rel(item.link);
      if (u && !item.slug.startsWith('zz-')) pages.add(u.pathname);
    }
  }

  const done = new Set();
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const p of [...pages]) if (!done.has('P' + p)) { done.add('P' + p); progressed = true; await crawlPage(p); }
    for (const a of [...assets]) if (!done.has('A' + a)) { done.add('A' + a); progressed = true; await crawlAsset(a); }
  }

  // GitHub Pages serves dist/404.html for unknown URLs.
  const nf = await fetch(ORIGIN + '/this-page-does-not-exist-404/');
  await save('404.html', rewrite(stripDynamicHead(await nf.text())));
  await save('.nojekyll', '');
  await save('robots.txt', 'User-agent: *\nDisallow: /\n');

  console.log(`Exported ${saved} pages and ${assets.size} assets to dist/ (base "${BASE || '/'}").`);
  if (broken.length) {
    console.log(`\n${broken.length} problem(s):\n  ` + broken.join('\n  '));
    process.exitCode = 1;
  } else {
    console.log('0 broken links.');
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
