# Juan Paolo Dente, Personal Site (3D edition)

Your original site — frameless portrait, aurora glow, cursor spotlight, count-up stats,
scroll-drawn timeline — now with real WebGL 3D layered in. No build step, no framework.
Open `index.html` in a browser to preview, or serve the folder with any static host.

```
site/
├── index.html            ← the whole site
├── assets/
│   ├── style.css          ← your original styles + a small addition for the hero canvas
│   ├── main.js             ← your original script, matrix rain upgraded to WebGL, hero sphere added
│   ├── juan.png            ← your portrait (transparent cutout — confirmed)
│   ├── se-aware.jpg
│   ├── lakat-results.jpg
│   ├── lakat-itinerary.jpg
│   ├── toolkit-dashboard.jpg
│   ├── ss-dashboard.jpg
│   ├── ss-systools.jpg
│   ├── tropa-feed.jpg
│   ├── tropa-profile.jpg
│   ├── badge-google-ai.png
│   └── favicon.png
└── README.md
```

## What changed from your original

Nothing about your design was replaced — the frameless portrait, aurora drift, grid
backdrop, cursor spotlight, scroll-progress bar, count-up stats, word-by-word hero
headline, and self-drawing timeline are all exactly as you built them.

Two things were added on top, both real 3D (WebGL via Three.js, not CSS tricks):

- **Matrix rain now has actual depth.** Instead of a flat 2D canvas, columns fall at
  different distances from the camera, with fog dimming the far ones and a very slight
  camera drift on mouse move. Same visual role, same `#matrix` element, same masking —
  just rendered in three dimensions. If the Three.js CDN script ever fails to load, it
  quietly falls back to your original 2D canvas rain, so the effect degrades instead of
  breaking.
- **A network sphere behind the hero.** A slowly rotating wireframe icosahedron with
  pulsing nodes, sitting behind your name and bio. It's a nod to the service-desk and
  network-security thread running through the résumé below it. Tilts gently as you move
  the mouse across the hero.

Both respect `prefers-reduced-motion` exactly like your existing matrix rain did — with
that setting on, they're skipped entirely.

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
| Email, LinkedIn, socials | `index.html`, the `#contact` section, **and** the footer |
| Colours | `assets/style.css`, the `:root` block at the top |
| Matrix rain colour | `--matrix` in that same `:root` block (both the 2D and 3D rain read it) |
| Matrix rain density / speed | `assets/main.js`, `COLUMNS` / `SPACING` in `initMatrixRain3D()` |
| Hero sphere size / speed | `assets/main.js`, `radius` and rotation speeds in the hero-net block |

## Notes

- **Three.js** loads from `cdnjs.cloudflare.com`. For fully offline use, download
  `three.min.js` and point the `<script src>` in `index.html` at a local copy in `assets/`.
- **Performance:** both 3D effects are pixel-ratio-capped, pause on a background tab, and
  fall back or disable gracefully — WebGL failure degrades to the 2D rain, and reduced
  motion disables both.
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

- **Résumé PDF.** `assets/Juan_Paolo_Dente_Resume.pdf` — a plain one-page, print-safe
  résumé (not matrix-themed on purpose, so it prints and scans through ATS software
  cleanly) generated from the same content as the site. Linked from a "Download résumé"
  button in the hero. Regenerate it by hand if your experience/certs change — it isn't
  auto-synced with the HTML.
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
