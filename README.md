# Juan Paolo Dente, Personal Site

A personal IT/cybersecurity portfolio: real WebGL matrix rain background (depth-of-field,
katakana + binary glyphs), categorized skills/certs, filterable projects, and a branded
404 page. No build step, no framework. Open `index.html` in a browser to preview, or serve
the folder with any static host.

```
site/
├── index.html                    ← the whole site
├── 404.html                      ← branded 404, absolute-pathed (see Notes)
├── robots.txt
├── sitemap.xml
├── LICENSE                       ← all-rights-reserved
├── assets/
│   ├── style.css / style.min.css  ← edit style.css, ship style.min.css (see Notes)
│   ├── main.js   / main.min.js    ← edit main.js,   ship main.min.js   (see Notes)
│   ├── juan.png / juan.webp       ← portrait (transparent cutout)
│   ├── favicon.png
│   ├── og-image.jpg               ← social share preview image
│   ├── badge-google-ai.png
│   ├── badge-google-cybersecurity.png
│   ├── se-aware.jpg / .webp
│   ├── toolkit-dashboard.jpg / .webp
│   ├── ss-dashboard.jpg / .webp
│   ├── ss-systools.jpg / .webp
│   ├── accph-login.jpg / .webp
│   ├── accph-dashboard.jpg / .webp
│   ├── accph-ledger.jpg / .webp
│   ├── accph-copilot.jpg / .webp
│   ├── tropa-landing.jpg / .webp
│   ├── tropa-feed.jpg / .webp
│   └── tropa-profile.jpg / .webp
└── README.md
```

## What changed from your original

Nothing about your design was replaced — the frameless portrait, aurora drift, grid
backdrop, cursor spotlight, scroll-progress bar, count-up stats, word-by-word hero
headline, and self-drawing timeline are all exactly as you built them.

One thing was added on top, real 3D (WebGL via Three.js, not CSS tricks):

- **Matrix rain now has actual depth.** Instead of a flat 2D canvas, columns fall at
  different distances from the camera, with fog dimming the far ones and a very slight
  camera drift on mouse move. Same visual role, same `#matrix` element, same masking —
  just rendered in three dimensions. If the Three.js CDN script ever fails to load, it
  quietly falls back to your original 2D canvas rain, so the effect degrades instead of
  breaking.

This respects `prefers-reduced-motion` exactly like your existing matrix rain did — with
that setting on, it's skipped entirely.

## Putting it online for free

### Option A: Netlify Drop (easiest, ~60 seconds)

1. Go to **https://app.netlify.com/drop**
2. Drag the whole `site` folder onto the page.
3. Done. You get a live URL like `random-name-123.netlify.app`.
4. Click **Site settings → Change site name** to make it something like `juanpaolodente.netlify.app`.

To update later, drag the folder again (or connect it to GitHub as in Option B).

### Option B: GitHub Pages (best if you want version history)

1. Create a free account at **https://github.com** if you don't have one.
2. Create a new repository named exactly:
   ```
   yourusername.github.io
   ```
3. Make it **Public**, then click **uploading an existing file** on the repo page.
4. Drag in `index.html`, `README.md`, and the `assets` folder (drag the *contents* of
   `site`, not the folder itself — `index.html` must sit at the top level of the repo).
5. Click **Commit changes**.
6. Go to **Settings → Pages**. Under *Branch*, pick `main` / `/ (root)` and Save.
7. Wait 1 to 2 minutes. Your site is live at `https://yourusername.github.io`

---

## Editing your content

| What you want to change | Where |
|---|---|
| Your name, tagline, bio | `index.html`, the `<header class="hero">` block |
| Job history | `index.html`, the `#experience` section |
| Projects | `index.html`, the `#projects` section |
| Project screenshots | replace the matching file in `assets/` |
| Skills | `index.html`, the `<ul class="tags">` list |
| Profile photo | replace `assets/juan.png` (transparent PNG, cropped tight) |
| Certifications + verify links | `index.html`, the `<ul class="cert-list">` in `#skills` |
| Email, LinkedIn | `index.html`, the `#contact` section, **and** the footer |
| Colours | `assets/style.css`, the `:root` block at the top |
| Matrix rain colour | `--matrix` in that same `:root` block (both the 2D and 3D rain read it) |
| Matrix rain density / speed | `assets/main.js`, `COLUMNS` / `SPACING` in `initMatrixRain3D()` |

## Notes

- **Two versions of the CSS and JS.** `assets/style.css` / `assets/main.js` are the
  readable source — edit these. `assets/style.min.css` / `assets/main.min.js` are what
  the live pages actually load (built with `cleancss` and `terser`), so the code isn't
  handed to every visitor in fully readable form. **If you edit the source files, you
  need to regenerate the minified ones** or your changes won't show up on the live site:
  ```
  npx terser assets/main.js --compress --mangle --output assets/main.min.js
  npx cleancss -o assets/style.min.css assets/style.css
  ```
  Worth being clear-eyed about what this does and doesn't do: it's a mild deterrent
  against casual copy-pasting, not real protection — anyone can still view the full
  HTML structure and computed CSS in DevTools regardless of minification. The `LICENSE`
  file is what actually gives you legal standing if someone copies the site wholesale.

- **Three.js** loads from `cdnjs.cloudflare.com`. For fully offline use, download
  `three.min.js` and point the `<script src>` in `index.html` at a local copy in `assets/`.
- **Performance:** the 3D matrix rain is pixel-ratio-capped, pauses on a background tab,
  and falls back gracefully — WebGL failure degrades to the 2D canvas rain, and reduced
  motion disables it entirely.
- **Custom domain:** both Netlify and GitHub Pages support them for free (domain itself
  runs roughly 500–900 pesos/year). Netlify: *Domain settings → Add custom domain*.
  GitHub Pages: *Settings → Pages → Custom domain*.
- **Fonts** load from Google Fonts and fall back to system fonts offline.

## Live

Deployed at **https://miggiegeorge.github.io/JP.Dente-Portfolio/** — `og:url`, the JSON-LD
`"url"`, and the `og:image`/`twitter:image`/JSON-LD `"image"` paths are all set to this
real address. If the site ever moves to a different URL, update those same spots in
`index.html`'s `<head>`.

## What else got added

- **Social share image.** `assets/og-image.jpg`, a 1200×630 branded card shown when the
  link is pasted into LinkedIn, Slack, Messenger, etc., wired up via Open Graph and
  Twitter Card meta tags.
- **JSON-LD Person schema** in the `<head>` so Google can potentially show your role and
  employer directly in search results.
- **Images converted to WebP** with the original JPG/PNG kept as a fallback via
  `<picture>` — roughly halves the load weight of the screenshots and portrait with no
  visible quality difference. If you add a new screenshot later, generate a matching
  `.webp` (any online converter or `cwebp` works) if you want the same treatment, or just
  add a plain `<img>` — it'll still work, just slightly heavier.
- **Branded 404 page, robots.txt, sitemap.xml** — see the file tree above.
- **All-rights-reserved LICENSE**, and the live site now loads minified CSS/JS instead of
  the readable source — see the note on that above, including the rebuild command.

Note: there is no résumé download on this site by request — contact is Email and
LinkedIn only, both in the Contact section and the footer.
