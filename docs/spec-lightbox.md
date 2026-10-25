# Spec: Lightbox (E7-2)

Source: SPEC §5.7 (lightbox), §6 (keyboard, focus ring on `--c-noche`), §8 note (same square in the lightbox).
Size M, tier standard (UI only, no data design). Implementer: `opencode-go/kimi-k2.7-code`.
Gate 0 approved by the user on 2026-10-25 (scope, tier, model, AC list).

## Decisions
- Native `<dialog class="lightbox">` in `index.html`, opened with `showModal()`: top layer (covers the music button), inert background (focus stays inside), native Esc via the `cancel`/`close` events. No library.
- The dialog itself fills the viewport with `color-mix(in srgb, var(--c-noche) 92%, transparent)`; `::backdrop` is transparent (custom properties on `::backdrop` are not reliable in older Safari).
- Each gallery photo is wrapped in a `<button type="button" class="galeria__boton">` (keyboard and screen-reader access). Its accessible name is the photo `alt`.
- Lightbox content: one `<picture>` (webp + jpg, same `asset()` paths, `alt`, `w`/`h`) shown as the same square, `object-fit: cover`, radius `--radio-foto-galeria`, max `min(100%, 520px)`; a close button `×` and previous/next arrow buttons. Buttons are at least 44 px.
- Navigation wraps around (last → first). ArrowLeft / ArrowRight move while open. Swipe: horizontal pointer drag over 50 px that is more horizontal than vertical; vertical drags do nothing.
- Focus: on open, focus moves to the close button; on close (× or Esc; closing by clicking outside the photo is out of scope), focus returns to the gallery button that opened it, for the photo currently shown.
- Page scroll is locked while open: `:root:has(.lightbox[open]) { overflow: hidden; }`.
- Focus ring inside: 2 px `--c-turquesa-noche`. Controls use `--c-texto-noche`.
- Motion: opacity fade on open (~300 ms, `--ease-suave`) only under `prefers-reduced-motion: no-preference`; photo changes are instant.
- UI strings (Spanish) live in `content.textos.galeria`: `cerrar: "Cerrar"`, `anterior: "Foto anterior"`, `siguiente: "Foto siguiente"`, and `dialogo: "Foto ampliada"` (dialog `aria-label`).
- Pure helpers in `src/modules/lightbox.ts`, tested in `src/modules/lightbox.test.ts`: `paso(index, delta, total)` (wrapping index) and `direccionSwipe(dx, dy)` (`-1 | 0 | 1`).

## Edge cases
- One photo: arrows hidden (`hidden`), swipe and arrow keys do nothing.
- Empty gallery: section already hidden (E7-1); lightbox never opens.
- Without JS: photos stay visible, the dialog stays closed.

## Acceptance criteria
| ID | Criterion | Verification | Result | Evidence |
|---|---|---|---|---|
| AC-01 | Tapping/clicking or Enter on a gallery photo opens the lightbox showing that photo (same square, webp+jpg, alt) | manual (browser) | PASS | vite preview 375×812: click on photo 8 and photo 2 opened them; currentSrc `.webp`, 335×335 square after fix round 1 |
| AC-02 | Background is `--c-noche` at 92 % and covers the music button | manual (browser, computed style) | PASS | computed `background-color: color(srgb … / 0.92)` of `--c-noche`; dialog in top layer, music button covered |
| AC-03 | Arrow buttons and ArrowLeft/ArrowRight move to previous/next, wrapping around | automated (`paso`) + manual | PASS | `paso` tests (wrap forward/backward, middle, total 1); browser: ArrowRight from 8 → 1, ArrowLeft ×2 → 7, next button |
| AC-04 | Horizontal swipe > 50 px changes photo; vertical drag does not | automated (`direccionSwipe`) + manual | PASS | `direccionSwipe` tests; browser: −100 px drag moved, vertical 200 px drag did not |
| AC-05 | Esc and × close it; focus returns to the gallery button of the photo shown | manual (browser) | PASS | browser: × and real Esc close; focus returned to the gallery button of the photo shown (index 0 and 2) |
| AC-06 | Focus moves into the dialog on open and stays inside; 2 px `--c-turquesa-noche` ring | manual (browser) | PASS | browser: focus on `.lightbox__cerrar` on open (modal makes the page inert); `:focus-visible` 2px `--c-turquesa-noche` in CSS |
| AC-07 | Page does not scroll while open; reduced motion removes the fade | manual (browser) | PASS | browser: root `overflow: hidden` while open, `visible` after close; fade only inside `prefers-reduced-motion: no-preference` (code review) |
| AC-08 | All new UI strings come from `content.textos`; no inline `style`, no hard-coded colors; `npm run check` passes | review + command | PASS | review: strings in `content.textos.galeria`, no inline style, tokens only; `npm run check` 69 pass, build ok |

## Cierre
Done 2026-10-25. One fix round (local `asset()` duplicate, `[hidden]` overridden by `display`, lightbox photo not square because the `height` attribute beat `aspect-ratio`, low-contrast arrows over bright photos), all closed and re-checked in the browser. Closing by tapping outside the photo stays out of scope. Real-device swipe is left to E8-3.
