// Full-page screenshots + console errors via headless Chrome, independent of the app's browser pane.
// Scrolls the whole page first so lazy images and reveal animations settle, then captures
// viewport-sized slices <prefix>-00.jpg, -01.jpg … into <outdir>.
// Usage: node scripts/shoot.mjs <url> <width> <height> <outdir> <prefix> [mobile]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
const [url, W, H, out, prefix, mobile] = process.argv.slice(2);
const w = +W, h = +H, port = 9333 + Math.floor(Math.random() * 300);
mkdirSync(out, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
	'--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
	`--user-data-dir=${out}/prof-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ver;
for (let i = 0; i < 40 && !ver; i++) { await sleep(250); try { ver = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch {} }
const page = ver.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const logs = [];
ws.addEventListener('message', (e) => {
	const m = JSON.parse(e.data);
	if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
	if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + JSON.stringify(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
	if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('ERR ' + m.params.args.map((a) => a.value || a.description).join(' '));
	if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') logs.push('LOG ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile });
await send('Page.navigate', { url });
await sleep(4000);
const total = await ev(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=300){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,60));}document.querySelectorAll('img').forEach(i=>i.loading='eager');await new Promise(r=>setTimeout(r,1500));document.querySelectorAll('[data-reveal],.reveal').forEach(e=>e.classList.add('is-in'));return document.body.scrollHeight})()`);
const sw = await ev('document.documentElement.scrollWidth');
console.log('height', total, 'scrollWidth', sw, 'innerWidth', w);
let n = 0;
for (let y = 0; y < total; y += h - 100) {
	await ev(`scrollTo({top:${y},behavior:'instant'})`); await sleep(900);
	const s = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
	const f = `${out}/${prefix}-${String(n++).padStart(2, '0')}.jpg`;
	writeFileSync(f, Buffer.from(s.result.data, 'base64'));
}
console.log('shots', n); console.log(logs.join('\n') || 'no console errors');
ws.close(); chrome.kill();
process.exit(0);
