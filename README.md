# Parker Paints — Static Site (GitHub Pages)

Static export of the Parker Paints PHP site, ready to host on GitHub Pages
(or any static host). Mechanically rendered from the PHP version — see
`../parker-paints-website/README.md` for full page/feature notes.

## Structure
- `index.html`, `about.html`, `products.html`, `colour-catalogue.html`,
  `paint-calculator.html`, `faq.html`, `contact.html` — the 7 main pages,
  flat at the repo root
- `product-<slug>.html` — all 29 individual product detail pages,
  pre-rendered from the PHP template (`product.php?slug=...`) since a
  static host has no server to process query-string routing. Every link
  from the "Wall" grid on `products.html` points straight at the matching
  `product-<slug>.html` file.
- `styles.css`, `main.js` — flat at the repo root
- `images/` — kept as a subfolder (drag the whole folder in when
  uploading so it stays a folder — see "Uploading to GitHub" below)

## Uploading to GitHub
GitHub's web "Upload files" drag-and-drop flattens any folder structure
**unless you drag a whole folder at once** (not individually-picked
files). So:
1. Drag all the `.html` files, `styles.css`, and `main.js` in individually
   (or all at once) — they belong flat at the repo root.
2. Drag the entire `images` folder in as one drag — GitHub preserves it as
   `images/` when you drop a folder, not individual files.
3. In repo Settings → Pages, set the source to the branch/folder you
   uploaded to, and GitHub Pages will serve `index.html` as the homepage.

## Forms
There is no backend on GitHub Pages, so the contact form (Contact page)
and newsletter form (footer, every page) will fail their `fetch()` call
and automatically show a friendly fallback message asking the visitor to
email directly — no broken/silent failure. See `main.js` for the exact
behavior (same file as the PHP version's `js/main.js`).

## Paint Calculator
The calculator is fully client-side JS (no PHP involved), so it works
identically here — live math on every input change, no backend needed.

## Images
Same placeholder situation as the PHP version — see the main README for
the full explanation and the exact filenames to replace in `images/` once
real photography is available.

## Regenerating this folder
This static site is mechanically rendered from the PHP version — never
hand-edit these files directly, since changes will be lost on the next
regeneration. To rebuild: run the PHP site locally (`php -S
localhost:8905` from `parker-paints-website/`), then re-fetch `index.php`,
`about.php`, `products.php`, `colour-catalogue.php`,
`paint-calculator.php`, `faq.php`, `contact.php`, plus `product.php?slug=X`
for every slug in `php/products-data.php`, rewriting `.php` links to
`.html` (and `product.php?slug=X` links to `product-X.html`) and
flattening the `css/`/`js/` asset paths.
