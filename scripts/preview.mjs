// Serves dist/ locally the way GitHub Pages will, including the sub-path.
//   node scripts/preview.mjs [--base=/repo-name] [--port=8080]
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
const BASE = (args.base ?? pkg.config?.pagesBase ?? '').replace(/\/$/, '');
const PORT = Number(args.port || 8080);
const ROOT = path.resolve('dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain' };

http
  .createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (BASE && !p.startsWith(BASE + '/') && p !== BASE) { res.writeHead(302, { location: BASE + '/' }); return res.end(); }
    p = p.slice(BASE.length) || '/';
    let file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(await fs.readFile(file));
    } catch {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      res.end(await fs.readFile(path.join(ROOT, '404.html')).catch(() => 'Not found'));
    }
  })
  .listen(PORT, () => console.log(`Previewing dist/ at http://127.0.0.1:${PORT}${BASE}/`));
