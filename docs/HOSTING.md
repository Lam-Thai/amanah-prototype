# Hosting the prototype for free

You get two links to send the client. Neither costs anything.

| Link | What the client sees | Where it lives |
|---|---|---|
| **Website** | The finished site: fast, all animations, all pages. | GitHub Pages — `https://lam-thai.github.io/amanah-prototype/` |
| **Try the admin** | A real WordPress in their browser. They can open wp-admin, edit pages, move blocks. Their changes vanish when they close the tab, so they can't break anything. | playground.wordpress.net, loading the theme from your GitHub repo |

## Why two links?

WordPress needs a server running PHP. Free PHP hosts are slow, show ads, and sometimes suspend sites, which isn't a good look in front of a client. So:

- the **website** link is WordPress's output saved as plain files. That makes it fast and free forever, and it looks identical.
- the **admin** link proves it's real WordPress, without paying for a server.

When the client signs, the same theme folder installs on their real hosting (any WordPress host) in minutes.

## Steps

All commands run in a terminal in this project folder.

1. **Start WordPress locally** and leave it running:
   ```bash
   npm run dev
   ```
2. **Export** the site to the `dist/` folder (in a second terminal):
   ```bash
   npm run export
   ```
   It should end with `0 broken links.`
3. **Preview the export** exactly as GitHub Pages will serve it:
   ```bash
   npm run preview
   ```
   Open http://127.0.0.1:8080/amanah-prototype/ and click around.
4. **Publish**:
   ```bash
   npm run deploy
   ```
   This pushes `dist/` to the `gh-pages` branch of your GitHub repo. GitHub Pages serves it about a minute later.
5. **Admin link** — open this once it's published:
   `https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/Lam-Thai/amanah-prototype/main/blueprint.public.json`

## Updating after changes

Repeat steps 2–4. Commit and push your code to `main` so the admin link picks up the latest theme too.

## Good to know

- The repo must be **public** for free GitHub Pages and for the admin link.
- The site tells search engines not to index it, so the prototype won't show up in Google under the client's name.
- Forms are demo-only: they validate and show a thank-you message but send nothing.
