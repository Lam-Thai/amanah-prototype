# Core block markup cheat sheet

Exact shapes WordPress saves. The comment carries attributes as JSON; the HTML must match what that JSON produces. Class order matters: WordPress classes first, then `className`. Omit attributes you don't need.

## Group (section / div wrapper)

```html
<!-- wp:group {"tagName":"section","className":"sec paper","anchor":"plans"} -->
<section class="wp-block-group sec paper" id="plans"><!-- wp:group {"className":"wrap"} -->
<div class="wp-block-group wrap"> … </div>
<!-- /wp:group --></section>
<!-- /wp:group -->
```
No `layout` attribute: the theme turns off WordPress's layout spacing so the design CSS rules.

## Heading

```html
<!-- wp:heading {"className":"x"} -->
<h2 class="wp-block-heading x">Pick the footprint that fits today.</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Redundant power</h3>
<!-- /wp:heading -->
```
`<em>` inside is allowed. An anchor adds `"anchor":"plans-h"` and `id="plans-h"`.

## Paragraph

```html
<!-- wp:paragraph -->
<p>Every plan sits on the same power, cooling, security and network.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"cap"} -->
<p class="cap">Also at 151 Front</p>
<!-- /wp:paragraph -->
```

## List

```html
<!-- wp:list {"className":"chips"} -->
<ul class="wp-block-list chips"><!-- wp:list-item -->
<li>N+1 UPS</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Generator failover</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
```
Ordered: `{"ordered":true}` and `<ol class="wp-block-list …">`.

## Buttons

Block styles map to the design system: `is-style-red`, `is-style-ghost`, `is-style-ink`, `is-style-line`, `is-style-ai`. Red buttons get the arrow automatically.

```html
<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-red"} -->
<div class="wp-block-button is-style-red"><a class="wp-block-button__link wp-element-button" href="{{home}}/contact/">Get a quote</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-ghost"} -->
<div class="wp-block-button is-style-ghost"><a class="wp-block-button__link wp-element-button" href="{{home}}/contact/#tour">Book a tour</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
```

## Image

```html
<!-- wp:image {"sizeSlug":"full","linkDestination":"none"} -->
<figure class="wp-block-image size-full"><img src="{{theme}}/assets/images/power.avif" alt="Closed grey UPS cabinets with green status displays."/></figure>
<!-- /wp:image -->
```
Decorative image: `alt=""`. Add `"className":"x"` → `class="wp-block-image size-full x"`.

## Details (FAQ item)

```html
<!-- wp:details -->
<details class="wp-block-details"><summary>Can I visit before signing?</summary><!-- wp:paragraph -->
<p>Yes. Book a tour and walk TOR1 and TOR2.</p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->
```

## Columns

```html
<!-- wp:columns {"className":"x"} -->
<div class="wp-block-columns x"><!-- wp:column -->
<div class="wp-block-column"> … </div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"> … </div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
```

## Custom HTML

```html
<!-- wp:html -->
<div class="stack" aria-hidden="true"><span>Space <b>your rack</b></span></div>
<!-- /wp:html -->
```

## Custom (amanah) blocks

Dynamic, so self-closing; all content is in the JSON attributes:

```html
<!-- wp:amanah/page-hero {"title":"Rack your GPUs at <em>25 kW</em> a cabinet.","primaryUrl":"/contact/?plan=gpu"} /-->
```
In attribute JSON, `<` `>` must be written as `<` `>` and `"` as `"` (what WordPress itself writes). Attribute URLs are site paths (`/contact/`), not `{{home}}` tokens: `render.php` passes them through `amanah_url()`.
