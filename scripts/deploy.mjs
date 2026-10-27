// Publishes dist/ to the gh-pages branch of this repo's GitHub remote and makes sure
// GitHub Pages serves that branch. Run `npm run export` first.
//   node scripts/deploy.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
const DIST = path.resolve('dist');

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/ is empty. Run `npm run export` first.');
  process.exit(1);
}

let remote;
try {
  remote = run('git', ['remote', 'get-url', 'origin']);
} catch {
  console.error('This repo has no GitHub remote yet. Create one first (see docs/HOSTING.md).');
  process.exit(1);
}
const repo = remote.replace(/\.git$/, '').match(/github\.com[:/](.+\/.+)$/)?.[1];
if (!repo) {
  console.error(`Remote ${remote} is not a GitHub repository.`);
  process.exit(1);
}

// dist/ is rebuilt from scratch by every export, so a throwaway one-commit history is fine.
const git = (...args) => run('git', args, { cwd: DIST });
fs.rmSync(path.join(DIST, '.git'), { recursive: true, force: true });
git('init', '-q', '-b', 'gh-pages');
git('add', '-A');
git('-c', 'user.name=Amanah prototype deploy', '-c', 'user.email=deploy@users.noreply.github.com', 'commit', '-q', '-m', `Deploy ${new Date().toISOString()}`);
console.log(`Pushing dist/ to ${repo} (branch gh-pages)…`);
git('push', '-q', '--force', remote, 'gh-pages');
fs.rmSync(path.join(DIST, '.git'), { recursive: true, force: true });

// Turn on Pages for the gh-pages branch (no-op if it is already on).
try {
  run('gh', ['api', '-X', 'POST', `repos/${repo}/pages`, '-f', 'source[branch]=gh-pages', '-f', 'source[path]=/']);
  console.log('GitHub Pages enabled.');
} catch (e) {
  if (!/409|already/i.test(String(e.stderr))) console.warn('Could not enable Pages automatically:', String(e.stderr).trim());
}
const [owner, name] = repo.split('/');
console.log(`Done. In about a minute: https://${owner.toLowerCase()}.github.io/${name}/`);
