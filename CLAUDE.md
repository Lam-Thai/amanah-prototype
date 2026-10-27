# Amanah WordPress prototype

A pitch prototype answering the client's question: *can the design, motion and simplicity of `reference/sample-home.html` be delivered in WordPress?* It ships as a custom block theme, runs locally on WordPress Playground, and is shared as (1) a static export on GitHub Pages and (2) a live Playground link with wp-admin.

The user is new to WordPress: explain WordPress concepts in plain words when reporting.

## Map

| Path | What it is |
|---|---|
| `reference/` | The client's sample split into `sample-home.html`, `sample.css`, `sample.js` + `assets/`. Read-only source of truth for look and motion. |
| `theme/amanah/` | The block theme (mounted into WordPress as `wp-content/themes/amanah`). |
| `theme/amanah/seed/` | Content-as-code: page/post files + `seed.php`, which loads them into WordPress on every boot. |
| `blueprint.json` | Local Playground boot recipe (activate theme, run seed). |
| `scripts/` | Node helpers: static export, deploy. |
| `docs/` | Beginner guides for the user (hosting, editing). |
| `.claude/skills/`, `.claude/agents/` | How-to knowledge and the worker agents. |

Commands live in `package.json` → `scripts`.

## Pages (single source of truth for slugs and URLs)

| Page | Slug | Seed file | Page CSS |
|---|---|---|---|
| Home (front page) | `home` | `seed/pages/home.html` | `assets/css/pages/home.css` |
| Colocation | `colocation` | `seed/pages/colocation.html` | `pages/colocation.css` |
| AI and GPU (TOR2) | `high-density` | `seed/pages/high-density.html` | `pages/high-density.css` |
| Services | `services` | `seed/pages/services.html` | `pages/services.css` |
| Data centre | `data-centre` | `seed/pages/data-centre.html` | `pages/data-centre.css` |
| Company | `about` | `seed/pages/about.html` | `pages/about.css` |
| Contact (quote + tour) | `contact` | `seed/pages/contact.html` | `pages/contact.css` |
| News (posts index) | `news` | `seed/pages/news.html` | `pages/news.css` |
| Legal | `legal` | `seed/pages/legal.html` | `pages/legal.css` |

Anchor targets other pages link to: `/colocation/#plans`, `/services/#dedicated-servers`, `#cloud-connect`, `#a-la-carte`, `#cross-connects`, `#remote-hands`, `/contact/#quote`, `/contact/#tour`, `/contact/#support`, `/legal/#acceptable-use`, `#sla`, `#privacy`, `/about/#careers`. Quote links may carry `?plan=<shared|quarter|half|full|suite|gpu>&qty=<n>`; the contact form pre-fills from them.

## Rules every agent follows

- **Links are tokens, never root-relative.** In seed files write `{{home}}/colocation/` and `{{theme}}/assets/images/power.avif`; in PHP use `home_url()` / `get_theme_file_uri()`; in JS read URLs from `data-*` attributes. (The Playground link serves WordPress under a sub-path, so `/colocation/` breaks there.)
- **File ownership keeps parallel work safe.** Shared files (`theme.json`, `functions.php`, `inc/`, `assets/css/site.css`, `assets/js/site.js`, `parts/`, `templates/`, `seed/seed.php`) belong to the lead. A page agent owns only its seed file, its page CSS, and blocks it creates under `blocks/<page-slug>-*`. Need a shared change? Report it; don't make it.
- **Facts come from the sample.** New copy follows the voice in the `amanah-design-system` skill; any invented fact (price, number, name, date) is wrapped as `<mark class="verify">…</mark>` in the seed so the user can confirm it with the client.
- Commit only when the user asks. Agents never commit.
