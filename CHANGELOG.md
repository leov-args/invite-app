# Changelog

## Unreleased

### Added
- Vite + TypeScript scaffold: `vite.config.ts` with `VITE_BASE` (default `/invite-app/`), `asset()` helper, `public/.nojekyll`, versioned `package-lock.json` and `npm run check`; assets moved to `public/assets/`, `paleta.png` to `docs/` (E1-1).
- Design tokens (`tokens.css`: SPEC §4.1 palette plus `--c-blanco`, §4.3 shape and spacing, §4.4 motion, font stacks), seven self-hosted `@font-face` rules with `font-display: swap`, `base.css` (480 px column, fixed ambient background and grain, mobile baseline) and `content.ts` with the §3 data and its test; temporary type/palette test page (E1-2).
- Build-time HTML metadata from `content.ts` (`<title>`, description, absolute `og:*` with 1200×630 image) via an inline Vite plugin and `src/meta.ts`; static `noindex`, `theme-color` and SVG favicon; `.github/workflows/deploy.yml` to GitHub Pages running `npm run check` on Node 24 (E1-3).

### Changed
- SPEC §4.1 and §6: corrected contrast notes; `--c-turquesa-tinta` for small text on the "Su vocación" background and `--c-turquesa-profundo` for the focus ring (E1-2).
- SPEC §2 and §2.1: CI runs the tests via `npm run check`, workflow on Node 24 with current action majors, leading-`/` exception for `public/` files in `index.html`; §3 `sitio` gains `titulo` and `descripcion` (E1-3).
