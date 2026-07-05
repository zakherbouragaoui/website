# ecoacoustic.net

Personal website of Zakher Bouragaoui — conservation biologist & National Geographic Explorer.

Static site hosted on GitHub Pages at [ecoacoustic.net](https://ecoacoustic.net).

## Structure

- `index.html`, `About.dc.html`, `Experience.dc.html`, `Research.dc.html`,
  `Publications.dc.html`, `Blog.dc.html`, `Media.dc.html`, `Gallery.dc.html`,
  `Contact.dc.html`, `Article-*.dc.html` — page templates (Design Fable format)
- `support.js` — client-side runtime that renders the `<x-dc>` templates
- `assets/`, `uploads/` — images and design assets
- `.github/workflows/deploy.yml` — GitHub Actions workflow that publishes the
  repository contents to GitHub Pages on every push to `main`

## Local preview

Serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

then visit http://localhost:8000/.
