# Roadmap: Invitación misa Juana Neyi

Fuente de verdad: [`SPEC.md`](../SPEC.md). Cada tarea `E<n>-<m>` es un PR pequeño contra `main` que se valida en el sitio desplegado.
Revisión y decisiones de arquitectura: `~/Documents/spec/2026-10-25-misa-juana-neyi/` (README: hallazgos F1–F15, decisiones D1–D4; summary: BR1–BR8, FD1–FD9).

**Reglas para quien ejecute:** solo cambiar los archivos de la tarea; sin dependencias nuevas (solo `vite` y `typescript`); reutilizar `asset()`, `content.ts` y los tokens antes de escribir algo nuevo; sin helpers especulativos; no hacer commit, merge ni push sin aprobación.

**Meta:** sitio **completo** antes de compartir el link (no se publica por partes a los invitados). Fecha del evento: **16/01/2027, 11:00 (Lima)**. El link debe salir lo antes posible.

Estado: `[ ]` pendiente · `[~]` en curso · `[x]` hecho

---

## E0. Preparación manual (familia / Leo, sin código)

E0-1 y E0-3 pueden hacerse en paralelo con E1. E0-2 necesita E6-1 (el script) y E1-3 (el sitio desplegado, para la prueba CORS). E6-2 depende de E0-2.

- [ ] **E0-1 Repo y Pages.** El repo público [`leov-args/invite-app`](https://github.com/leov-args/invite-app) ya existe. Falta, en *Settings → Pages → Source*, elegir **GitHub Actions**.
  *Hecho cuando:* el primer push de E1-3 despliega.
- [ ] **E0-2 Google Sheet + Apps Script** (SPEC §5.9.1). Crear la hoja con las pestañas `Confirmaciones` y `Resumen`, pegar `apps-script/Code.gs` (de E6-1) y publicar como aplicación web. Pegar la URL `/exec` en `content.rsvp.endpoint`.
  *Hecho cuando* `curl -L -X POST -H 'Content-Type: text/plain' -d '<json>' <url>` cumple todo esto:
  - con datos válidos, crea una fila;
  - con datos inválidos, devuelve `ok:false`;
  - con el honeypot relleno, no crea fila;
  - `=1+1` se guarda como texto.

  **Prueba CORS (R1):** desde la consola del sitio desplegado en Pages, `fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({nombre:'Prueba CORS',personas:1})}).then(r=>r.json())` devuelve `{ok:true}`. Si falla, E6-2 usa `mode:'no-cors'` y trata la respuesta opaca como éxito; anotarlo en el README de la revisión. Después, borrar las filas de prueba.
  *Depende de:* E6-1, E1-3.
- [ ] **E0-3 Datos pendientes** (SPEC §11): dirección textual de la iglesia, link de Maps del local comunal, fecha límite para confirmar, firma de la familia y pies de foto.
  *Hecho cuando:* no quedan `TODO` en `content.ts` antes de E8-3.

## E1. Base y despliegue (RF-03)

- [x] ~~**E1-1 Scaffold.** Vite + TS sin framework (devDependencies: solo `vite` y `typescript`), `vite.config.ts` con `base`, helper `asset()`, `public/.nojekyll` y `package-lock.json` versionado (lo necesita `npm ci`). Assets: `git mv assets public/assets` y luego `git mv public/assets/paleta.png docs/` (FD7: mover, no copiar).
  `tsconfig`: `allowImportingTsExtensions` + `noEmit`, para que `node --test` ejecute los `*.test.ts` sin compilar.
  *Hecho cuando:* `npm run build` genera `dist/` sin `paleta.png`, `npm run dev` sirve una página vacía y `git ls-files assets` no devuelve nada.~~ **Hecho (2026-10-25)**
  Decisions: `vite.config.ts` is not type-checked (`include: ["src"]`; `process.env` would need `@types/node`); `*.test.ts` are excluded from `tsc` for the same reason (`node:test` types) and run only under `node --test`; `verbatimModuleSyntax` + `erasableSyntaxOnly` keep `src` loadable by Node type stripping; `npm run check` = `tsc && node --test && vite build`; `asset()` has no test (`import.meta.env` does not exist under `node --test`).
  Follow-ups for E1-3: replace the placeholder `<title>Invite App</title>` in `index.html` instead of injecting a second one; consider Node 24 in `deploy.yml` (Node 20 is EOL since 2026-04; Vite 8 still accepts `^20.19`).
- [x] ~~**E1-2 Tokens, fuentes y `content.ts`.** `tokens.css` (§4.1, §4.4), `fonts.css` con `font-display: swap`, `base.css` (columna de 480 px, fondo de ambiente, grano), y `content.ts` con los datos ya confirmados (§3).
  *Hecho cuando:* una página de prueba muestra Cormorant y Montserrat autoalojadas y los colores de la paleta.~~ **Hecho (2026-10-25)**
  Decisions (2026-10-25, design review): `tokens.css` also carries §4.3 (radii, tinted shadow, section spacing) and the font-family stacks; `base.css` paints the ambient background on a `position: fixed` pseudo-element (iOS ignores `background-attachment: fixed`), the grain is an SVG data URI changed by `opacity` only (no blend modes or live filters), plus the mobile baseline (tap highlight, `text-size-adjust`, `touch-action: manipulation`, `color-scheme: light`); running text is Montserrat 400 (300 only for large data lines). Font URLs in CSS are `/assets/fonts/...` so Vite prefixes `base` (exception to §2.1: a relative URL would resolve against `dist/assets/`). `content.ts` holds the §3 data only; `textos` and `galeria` are added by the steps that render them.
  Closing notes: `--c-blanco` (#FFFFFF) was added to the palette (SPEC §4.1). `main.ts` renders a temporary type/palette test page that E2-1 replaces. Mobile baseline effects (tap highlight, text-size-adjust) still need a real-device check in E8-3.
- [ ] **E1-3 Metadatos y workflow.** Plugin en línea `transformIndexHtml` en `vite.config.ts` que importa `src/content.ts` y escribe `<title>`, `description` y `og:*` absolutos en el HTML compilado (FD1: el rastreador de WhatsApp no ejecuta JS). Además `noindex`, favicon SVG, `theme-color` y `.github/workflows/deploy.yml`.
  *Verificar:* `grep 'og:image' dist/index.html` muestra la URL absoluta.
  *Hecho cuando:* el push a `main` despliega, sin 404 en la consola bajo `/invite-app/`, y la vista previa en WhatsApp muestra `og-image.jpg`.
  *Depende de:* E0-1.

## E2. Apertura y música

- [ ] **E2-1 Pantalla de apertura** (§5.0): overlay noche, halo, frase, botón "Abrir invitación", disolución en luz, bloqueo de scroll y `sessionStorage`.
  *Hecho cuando:* al recargar no se repite, y el teclado y `prefers-reduced-motion` funcionan.
  From the E1-2 design review: `theme-color` is marfil while the opening screen is noche (status bar mismatch); add a short press-feedback token (~150 ms) with the first button.
- [ ] **E2-2 Música + botón flotante** (§ "Elemento persistente"): fades con Web Audio `GainNode` (FD2: nunca animar `audio.volume`, que es de solo lectura en iOS) y `AudioContext` creado en el gesto de apertura. Bucle con crossfade de 1.5 s, `visibilitychange`, `aria-label` dinámico y precarga solo tras abrir.
  *Hecho cuando:* nunca suena antes del gesto y se pausa y reanuda bien en iOS Safari y en Chrome Android.
  From the E1-2 design review: `env(safe-area-inset-*)` needs `viewport-fit=cover` in the viewport meta; the blurred button needs a `prefers-reduced-transparency` variant.

## E3. Hero y "Su vocación"

- [ ] **E3-1 Hero** (§5.1): retrato con doble aro y zoom lento, nombre en dos líneas (el elemento más grande), separador y chevron.
  From the E1-2 design review: the name needs tight leading (~1.05–1.1), not the body's 1.6.
- [ ] **E3-2 Su vocación** (§5.2): fondo turquesa suave, estetoscopio, cruz médica, par de fotos de graduación rotadas y las fotos 04 y 05. Exportar `estetoscopio-desenfocado.webp` de ~440 px, que hoy es un PNG de 207 KB (F11). `alt` en español para 02–05, a partir de las fotos (F10).
- [ ] **E3-3 Reveal on-scroll** (`reveal.ts`, §4.4): fade + 16 px y escalonado; fotos con blur y escala; versión reducida con `prefers-reduced-motion`.
  *Hecho cuando:* E3-1 y E3-2 aparecen con reveal y no hay saltos de layout (las imágenes tienen `width`/`height`).
  From the E1-2 design review: with 1400 ms reveals and 200–300 ms stagger, a block of four takes ~2.3 s; trigger before the element enters the viewport so text is never revealed after the reader has passed it.

## E4. Mensaje, misa y cuenta regresiva

- [ ] **E4-1 Mensaje** (§5.3): luz diagonal y flores al pie.
- [ ] **E4-2 Tarjeta de misa** (§5.4): fecha, hora y lugar con iconos (cada línea solo si existe su dato).
- [ ] **E4-3 Cuenta regresiva**: función pura `estado(ahora, inicio)` con tres estados (BR6): antes de las 11:00 de Lima, cuenta regresiva (también esa misma mañana); de 11:00 a 14:00, "Hoy nos reunimos…"; después, "Gracias…".
  *Hecho cuando:* `node --test src/modules/countdown.test.ts` y `TZ=Europe/Madrid node --test src/modules/countdown.test.ts` pasan, cubriendo 10:59:59, 11:00, 13:59:59 y 14:00 de Lima.
- [ ] **E4-4 Calendario** (`calendar.ts`): `.ics` en UTC (`DTSTART:20270116T160000Z`, 1 h, sin VTIMEZONE; FD5) y enlace a Google Calendar con las mismas horas. `calendar.test.ts` comprueba DTSTART y DTEND.
  *Hecho cuando:* se importa con la hora de Lima en Google Calendar y en Apple Calendar.

## E5. Ubicación y almuerzo (RF-01)

- [ ] **E5-1 Mapa embebido** (§5.5, `src/modules/location.ts`, FD6): prioridad embedUrl → lat/lng → placeQuery, 4:3 / 16:9, filtro, pin decorativo y `loading="lazy"`.
- [ ] **E5-2 Botones de ruta**: "Cómo llegar", "Abrir en Waze" y "Copiar dirección" con aviso.
  *Hecho cuando:* en el móvil abren la app de Maps y la de Waze.
- [ ] **E5-3 Tarjeta del almuerzo** (§5.6): Local Comunal, "Cómo llegar" solo con `mapsUrl` y botón "Confirmar asistencia" (de momento sin acción; se conecta en E6-2).

## E6. Confirmación de asistencia (RF-02)

- [ ] **E6-1 `apps-script/Code.gs`** (§5.9.1, copiar tal cual de la SPEC): validación, honeypot, `safe()` con `= + - @ \t \r` y `waitLock` dentro del `try`. Sin dependencias: se puede hacer en cualquier momento después de E1-1.
  *Hecho cuando:* el archivo coincide con SPEC §5.9.1. Las pruebas reales se hacen en E0-2.
- [ ] **E6-2 Popup `<dialog>`** (`rsvp.ts`, §5.9): campos, validación en el cliente con `aria-describedby`, `fetch` con `text/plain`, timeout de 12 s y estados.
  *Hecho cuando:* desde el sitio desplegado se crea una fila; el error conserva los datos; el foco y Esc funcionan; se abre desde §5.6 y desde §5.9.
  *Depende de:* E0-2 (incluida la prueba CORS) y E5-3. `rsvp.test.ts` cubre la validación de nombre, personas y mensaje.
  From the E1-2 design review: an input border in `--c-plata-claro` on white is ~1.4:1; control boundaries need 3:1.
- [ ] **E6-3 Persistencia y compartir**: `localStorage` "Ya confirmaste…", "Confirmar otra persona", y Web Share con fallback de copiar enlace.

## E7. Galería, video y cierre

- [ ] **E7-1 Galería** (§5.7): grilla de 2 columnas en el orden de la spec y fade escalonado. Forma de cada elemento de `galeria`: `{ src, alt, w, h }`. Escribir el `alt` en español de 06–09 a partir de las fotos; la familia lo revisa (F10).
- [ ] **E7-2 Lightbox**: fondo noche al 92 %, swipe, flechas, Esc y ×, y foco gestionado.
- [ ] **E7-3 Video homenaje** (§5.8): `preload="none"`, póster, y pausa la música con fade de 600 ms (no se reanuda sola).
- [ ] **E7-4 Cierre** (§5.10): frase, cruz de luz lenta y firma opcional.

## E8. Pulido y lanzamiento

- [ ] **E8-1 Accesibilidad y movimiento** (§6): contraste AA, `alt` en español, foco visible, zoom al 200 % y reduced motion.
- [ ] **E8-2 Rendimiento** (§7): primera carga < 1 MB y Lighthouse móvil ≥ 90 en Performance y Accesibilidad.
- [ ] **E8-3 Datos finales y prueba en dispositivos**: sin `TODO` en `content.ts`; recorrer los criterios de SPEC §9 en iOS Safari, Chrome Android y el navegador interno de WhatsApp; hacer una confirmación real y borrarla de la hoja. Comprobar también que el fade de la música se oye en un iPhone real (R2) y que el mapa embebido carga (R3).
  *Depende de:* E0-3 y todas las anteriores.
- [ ] **E8-4 Compartir el link.** 🎉

---

### Orden y dependencias

```
E0-1 ─► E1 ─► E2 ─► E3 ─► E4 ─► E5 ─► E6 ─► E7 ─► E8
E6-1 + E1-3 ─► E0-2 (deploy + curl + CORS) ─┘ (E6-2)
E0-3 ─────────────────────────────────────────────┘ (E8-3)
```
E2–E5 y E7 no dependen entre sí más allá de E1, así que se pueden reordenar si conviene. E6 es el corazón práctico (dimensionar el almuerzo) y no debería quedar para el final.
