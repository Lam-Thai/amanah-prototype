// Checks every seed file: header JSON parses, every block comment's attribute JSON parses,
// block open/close comments balance, and no root-relative links slipped in.
//   node scripts/check-seeds.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('theme/amanah/seed');
const files = ['pages', 'posts'].flatMap((d) =>
  fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.html')).map((f) => path.join(root, d, f)) : []
);

let problems = 0;
const report = (file, msg) => {
  problems++;
  console.log(`${path.relative(process.cwd(), file)}: ${msg}`);
};

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const head = src.match(/^\s*<!--\s*amanah:(?:page|post)\s+(\{.*?\})\s*-->/s);
  if (!head) report(file, 'missing <!-- amanah:page {...} --> header');
  else {
    try { JSON.parse(head[1]); } catch (e) { report(file, `header JSON: ${e.message}`); }
  }

  const stack = [];
  // Block comment: <!-- wp:name {attrs} --> , <!-- wp:name {attrs} /--> , <!-- /wp:name -->
  for (const m of src.matchAll(/<!--\s+(\/)?wp:([a-z0-9\-/]+)(?:\s+(\{.*?\}))?\s+(\/)?-->/gs)) {
    const [, closing, name, attrs, selfClosing] = m;
    const line = src.slice(0, m.index).split('\n').length;
    if (attrs) {
      try { JSON.parse(attrs); } catch (e) { report(file, `line ${line}: wp:${name} attributes are not valid JSON (${e.message})`); }
    }
    if (closing) {
      const open = stack.pop();
      if (open !== name) report(file, `line ${line}: </wp:${name}> closes ${open ? 'wp:' + open : 'nothing'}`);
    } else if (!selfClosing) stack.push(name);
  }
  if (stack.length) report(file, `unclosed blocks: ${stack.join(', ')}`);

  for (const m of src.matchAll(/(?:href|src)="(\/[^"/][^"]*)"/g)) {
    report(file, `root-relative link "${m[1]}" — use {{home}}${m[1]} (see CLAUDE.md)`);
  }
}

console.log(problems ? `\n${problems} problem(s) in ${files.length} seed files.` : `All ${files.length} seed files OK.`);
process.exitCode = problems ? 1 : 0;
