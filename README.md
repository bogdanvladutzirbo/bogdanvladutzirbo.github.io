# Codru Lemne — presentation site

A single-page presentation website for a firewood and timber yard. Plain HTML, CSS and
JavaScript — no build step, no dependencies. Open `index.html` in a browser and it works.

## Contents

```
index.html              all sections and markup
assets/css/styles.css   design tokens, layout, components
assets/js/i18n.js       all site copy, in Romanian and English
assets/js/main.js       language switch, nav, gallery lightbox, order form
assets/img/*.svg        logo, icons and illustrations
```

## Sections

Hero, products, services, about, gallery, pricing, testimonials, order form, contact and
a closing call to action.

## Running it

Double-click `index.html`, or serve the folder if you prefer a local server:

```powershell
python -m http.server 8000
# then open http://localhost:8000
```

## Editing the content

**All visible text lives in `assets/js/i18n.js`**, keyed by the `data-i18n` attributes in
`index.html`. Each key appears twice — once under `ro`, once under `en`. Change the text
in both places and the site updates; the HTML itself doesn't need touching.

Prices in the pricing table and the "from" prices on the product cards are the exception:
those numbers sit directly in `index.html` because they are identical in both languages.

### Things to replace before going live

| What | Where |
| --- | --- |
| Company name "Codru" | `index.html` (header and footer `.brand`) |
| Phone numbers | `index.html` (`tel:` links) and `CONTACT.whatsapp` in `main.js` |
| Email addresses | `index.html` (`mailto:` links) and `CONTACT.orderEmail` in `main.js` |
| Address and map | `index.html` contact section — swap the OpenStreetMap `bbox` and `marker` coordinates |
| Registration details | footer, `footer.legal` key in `i18n.js` |
| Prices | pricing table in `index.html` |

### Using real photos

The gallery and hero currently use hand-drawn SVG illustrations. To use photographs
instead, drop them into `assets/img/` and update the `src` and `data-src` attributes in the
gallery section, plus `assets/img/hero-yard.svg` in the hero. Everything is already sized
with `object-fit: cover`, so any aspect ratio will crop cleanly.

## How the order form works

The site is static, so there is no server to receive submissions. On submit the form
validates the fields and then opens the visitor's email client with the order already
written out. There's also a WhatsApp button that sends the same summary as a message.

If you later want submissions to land in an inbox automatically, point the form at a
service like Formspree or Netlify Forms — the markup is standard, so it's a small change
in `main.js`.

## Language switching

The RO/EN toggle in the header swaps every string and updates `<html lang>`. The choice is
remembered in `localStorage`. First-time visitors get Romanian if their browser is set to
Romanian, English otherwise.

## Browser support

Works in all current browsers. Scroll animations and nav highlighting use
`IntersectionObserver` and degrade gracefully without it. Animations are disabled for
visitors who ask for reduced motion.
