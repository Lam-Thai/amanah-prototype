---
name: run-local-wp
description: Start, check and verify the local WordPress site (Playground on port 9400). Use before viewing or testing any page, checking for PHP or console errors, or validating blocks in the editor.
---

# Run and verify the local site

The site runs on WordPress Playground at `http://127.0.0.1:9400` (admin: `/wp-admin/`, auto-logged-in in the browser). The theme folder is mounted live: theme and seed edits show on the next page load, no restart.

## 1. Make sure it is up (one shared server)

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9400/
```

`200` → use it. Anything else → start it in the background with `npm run dev` and wait until the same check returns `200` (first boot downloads WordPress, ~1 minute). Several agents share this one server; never start a second one or stop it.

## 2. Check a page

- **PHP problems**: `curl -s http://127.0.0.1:9400/<slug>/ | grep -E "Warning:|Notice:|Deprecated:|Fatal error"` prints nothing. (Debug display is on locally, so PHP warnings land in the HTML.)
- **Looks and console**: `node scripts/shoot.mjs <url> 1440 900 <scratchpad>/shots <name>` and again with `375 812 … <name>-m mobile`. It scrolls the whole page, saves viewport slices as JPEGs (read them with the Read tool) and prints console errors. Prefer it over the built-in browser pane, which is often hidden and then throttles rendering. Use the pane (own tab via `preview_start`, `tabId` on every call) for clicking through interactions.
- **Links**: every `href` on the page resolves to `200` (internal) or is an intended `tel:`/anchor.

## 3. Check blocks are valid in the editor

Find the page id: `curl -s "http://127.0.0.1:9400/wp-json/wp/v2/pages?slug=<slug>&_fields=id"`. Open `http://127.0.0.1:9400/wp-admin/post.php?post=<id>&action=edit`, wait for the editor, then run in the page:

```js
(function walk(bs){return bs.flatMap(function(b){return (b.isValid===false?[b.name+': '+(b.attributes.className||'')]:[]).concat(walk(b.innerBlocks))})})(wp.data.select('core/block-editor').getBlocks())
```

`[]` = every block is valid. Each entry names a block whose saved HTML doesn't match WordPress's own; fix its shape against `.claude/skills/wp-block-theme/BLOCK-MARKUP.md`.

For every page at once: `node scripts/check-seeds.mjs` (seed JSON/markup) and `npm run export` (crawls every page; reports broken links and PHP warnings).

## Gotchas

- The Write tool can turn `"` in block attribute JSON into a raw `"`, silently breaking the block's attributes. Run `node scripts/check-seeds.mjs` after editing a seed file.

- Seed content re-imports on change only locally; wp-admin edits to a page are replaced the next time its seed file changes.
- If the server is wedged (requests hang > 30s), report it to the lead rather than killing processes.
