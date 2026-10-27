---
name: wp-block-theme
description: How this repo's WordPress block theme is built — seed page files, block markup, custom blocks (no build step), asset loading, escaping. Use before creating or editing anything under theme/amanah/, including seed content.
---

# Amanah block theme conventions

A block theme: pages are made of blocks, the editor (wp-admin → Pages) can change them, and templates in `templates/` + `parts/` frame them. No build step: plain PHP, CSS and browser JS.

## Where things go

```
theme/amanah/
  style.css, theme.json, functions.php     lead-owned
  inc/                                     lead-owned PHP (setup, assets, blocks loader, helpers, seed runner)
  templates/  parts/                       lead-owned (news agent owns home.html, single.html)
  assets/css/site.css                      global design system (= sample CSS, then a "THEME LAYER" section
                                           with WordPress resets, core Button styles, .reveal, .phero)
  assets/css/pages/<slug>.css              auto-loaded on that page only (front page → home.css)
  assets/js/site.js                        global: header, mobile drawer, data-reveal
  assets/js/lines.js                       canvas line animations (handle `amanah-lines`)
  assets/js/vendor/three.min.js, rack3d.js handles `amanah-three`, `amanah-rack3d`
  assets/images/, assets/fonts/
  blocks/<name>/                           one folder per custom block, auto-registered
  seed/pages/<slug>.html, seed/posts/<slug>.html, seed/seed.php
```

## Seed files (page content)

Each file is one page: a header comment, then block markup.

```html
<!-- amanah:page {"title":"Colocation","order":2,"excerpt":"One sentence for search results."} -->
<!-- wp:amanah/page-hero {"eyebrow":"Colocation · 151 Front Street West","title":"Racks sized to <em>your load.</em>"} /-->
<!-- wp:group {"tagName":"section","className":"sec paper","anchor":"plans"} -->
<section class="wp-block-group sec paper" id="plans"> … </section>
<!-- /wp:group -->
```

- Posts add `"date":"2026-09-14","category":"News"` to the header.
- Tokens: `{{home}}` → site URL, `{{theme}}` → theme URL. Every link and image in a seed file uses them.
- Locally, `seed.php` re-imports a file automatically whenever it changes: save, reload the page, see it. This overwrites edits made in wp-admin on the local site.
- Core block markup must match what WordPress itself saves, or the editor shows "This block contains unexpected or invalid content". Copy shapes exactly from [BLOCK-MARKUP.md](BLOCK-MARKUP.md).

## Choosing core blocks vs a custom block

- Static content (headings, text, lists, images, buttons, cards, FAQs): **core blocks** carrying the design-system classes in `className`. The client can edit these directly.
- Anything with JavaScript, canvas, repeating data or exact markup the core blocks can't produce: a **custom block**.
- `core/html` only for small inert markup (an inline SVG, a decorative stack); it edits as raw HTML.

## Custom blocks

A folder `blocks/<name>/` registers as `amanah/<name>`. Page agents name theirs `<page-slug>-<thing>` (e.g. `contact-form`).

```
block.json   apiVersion 3, "category":"amanah", attributes with defaults = the real content,
             "render":"file:./render.php", optional "style":"file:./style.css",
             optional "viewScript":["amanah-lines","file:./view.js"]
render.php   receives $attributes, $content, $block; outputs the markup
view.js      browser behaviour; loads only on pages containing the block
view.asset.php  required next to view.js: declares its script dependencies and a filemtime
             version, e.g. see blocks/plans/view.asset.php
```

- **Script order:** listing a handle in `viewScript` does not make `view.js` load after it. Dependencies (e.g. `amanah-rack3d`, `amanah-lines`) go in `view.asset.php`'s `dependencies` array, or `window.Rack3D`-style globals are undefined.

- Wrapper: `<section <?php echo get_block_wrapper_attributes( array( 'class' => 'sec' ) ); ?>>` so anchors and extra classes work.
- The editor shows a live server preview of every `amanah/*` block and an auto-generated sidebar: string attributes become text boxes, booleans toggles, numbers number fields. Arrays/objects (lists of plans, quotes) stay as defaults in `block.json`.
- `view.js` is self-guarding and runs once per instance: `document.querySelectorAll('.wp-block-amanah-<name>').forEach(init)`. Scope every query to the instance root, never `document.getElementById`, so one page can hold two copies.
- URLs needed by JS go in `data-*` attributes rendered by PHP.
- Reduced motion and off-screen pausing: see the `amanah-design-system` skill → Motion.

### Helpers (in `inc/helpers.php`)

- `amanah_url( '/contact/#tour' )` → full URL for a site path (leaves `https://…` untouched).
- `amanah_asset( 'images/power.avif' )` → theme asset URL.
- `amanah_inline( $s )` → `$s` with only `<em> <br> <span class> <mark class> <b> <strong> <a href>` allowed, for headlines that carry emphasis.
- `amanah_icon( 'arrow' )` → inline SVG icon (`arrow`, `check`, `lock`, `shield`, `plus`, `minus`).

## Escaping (every echo)

`esc_html()` text, `esc_attr()` attributes, `esc_url()` URLs (wrap `amanah_url()`), `amanah_inline()` for rich headlines, `wp_json_encode()` for data in attributes. Never echo `$attributes[...]` raw.

## Done means

1. The page renders at `http://127.0.0.1:9400/<slug>/` with no PHP warnings in the HTML and no console errors (see `run-local-wp` skill).
2. In wp-admin → Pages → edit, the block validity check from `run-local-wp` returns `[]`.
3. It works at 375px and 1440px wide.
