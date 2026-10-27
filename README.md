# Amanah — WordPress prototype

A working WordPress website built from the client's sample home page, to answer their question: *can this level of design, animation and simplicity be delivered in WordPress?*

Everything here is free: no hosting bill, no paid plugins, no paid themes.

---

## The 30-second picture

```
 your PC                                   the internet (free)
 ──────────                                ───────────────────
 theme/amanah/   ──►  WordPress running ──► 1. Website link   (GitHub Pages)
 (design + code)      on your PC            2. "Try the admin" link (WordPress Playground)
 seed/ (content)      (Playground)
```

- **WordPress Playground** runs a full WordPress *inside Node.js* on your computer. No PHP, MySQL or XAMPP to install.
- The **theme** (`theme/amanah/`) is the design: colours, fonts, header, footer, and the animated sections.
- The **content** (`theme/amanah/seed/`) is the text of each page, stored as files so every fresh WordPress looks the same.
- To share it, we **export** WordPress to plain files and host them on **GitHub Pages** (free). A second link opens a real WordPress admin in the client's browser via **playground.wordpress.net** (free).

## Words you'll meet

| Word | Meaning |
|---|---|
| Theme | The design of a WordPress site. Ours is a *block theme*: every page is built from blocks. |
| Block | One piece of a page (a heading, a button, the 3D plan picker). You add, move and edit blocks in the editor. |
| Page / Post | Pages are fixed (About, Contact). Posts are dated articles (News). |
| wp-admin | WordPress's back office, at `/wp-admin/`. |
| Menu | The header links. Edit in wp-admin → Appearance → Menus. |

## Run it on your computer

You need [Node.js](https://nodejs.org) (already installed on this PC). In a terminal in this folder:

```bash
npm install
```

```bash
npm run dev
```

Wait for `Ready! WordPress is running on http://127.0.0.1:9400`, then open:

- the site: http://127.0.0.1:9400
- the admin: http://127.0.0.1:9400/wp-admin/ (you're logged in automatically)

Stop it with `Ctrl + C`. Each start is a fresh WordPress; the content is re-imported from `theme/amanah/seed/`.

## Change things

- **Text on a page:** edit `theme/amanah/seed/pages/<page>.html`, save, reload the browser. Or edit in wp-admin → Pages (handy for trying things; the files win on the next restart).
- **Colours / spacing:** `theme/amanah/assets/css/site.css` (global) or `assets/css/pages/<page>.css`.
- **Highlighted words** (yellow, dashed underline) are details I wrote for the prototype that the client should confirm, like prices, dates and names.

## Publish (free)

See `docs/HOSTING.md` for the step-by-step guide.
