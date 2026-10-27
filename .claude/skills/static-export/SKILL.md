---
name: static-export
description: Publish the prototype — export the running WordPress site to static files and deploy them to GitHub Pages, plus the Playground admin link. User-invoked when it's time to share.
disable-model-invocation: true
---

# Export and publish

Two deliverables for the client, both free:

1. **Website link** — the WordPress site crawled into plain HTML/CSS/JS (`dist/`) and hosted on GitHub Pages.
2. **Admin link** — `blueprint.public.json` opened on playground.wordpress.net: a real WordPress in the client's browser with the theme and content installed from the GitHub repo.

## Steps

1. Local server is up and every page passes the `run-local-wp` checks.
2. `npm run export` → writes `dist/`. Done when the script reports 0 broken links and every page in `CLAUDE.md`'s table exists in `dist/`.
3. Preview `dist/` with `npm run preview` and click through the main flow (home → colocation → plan picker → quote form; home → book a tour).
4. Publishing is outward-facing: confirm with the user before the first push to a public GitHub repo, then `npm run deploy`.
5. Open the admin link and confirm the home page renders and wp-admin → Pages lists every page.

## Gotchas

- GitHub Pages serves under `/<repo-name>/`; the export rewrites URLs for that base, so open the deployed site, not files from disk.
- The static site has no PHP: forms are demo-only (by design), and search/comments are absent.
- The site is `noindex` (WordPress "discourage search engines" is on) so the prototype never shows up in Google under the client's name.
