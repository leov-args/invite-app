# Spec: RSVP popup (E6-2)

Source: SPEC §5.9 (section, popup, behaviour), §5.6 (lunch button opens the same popup), §5.9.1 (server validation), §6 (focus ring), roadmap E6-2 note (control boundaries need 3:1).
Size M, tier standard (UI plus one pure validation helper, no data design). Implementer: `opencode-go/kimi-k2.7-code`.
Gate 0 approved on 2026-10-25, relayed by the orchestrator session (user: "sin confirmaciones"): scope, tier, model, decisions and AC list as written.
Out of scope (E6-3): `localStorage` "Ya confirmaste…", "Confirmar otra persona", "Compartir invitación".

## Decisions
- `content.rsvp.endpoint` is set to the deployed Apps Script `/exec` URL (E0-2). An empty endpoint still hides the section and both "Confirmar asistencia" buttons.
- New `<section class="rsvp">` between `.video` and `.cierre` (SPEC §5 order), bruma background and a white card styled like `.almuerzo__tarjeta` (shared rules, not copied): label "CONFIRMA TU ASISTENCIA", turquoise separator, text "Nos acompañará mucho saber que estarás con nosotros.", `fechaLimiteTexto` below in `--c-texto-2` (hidden when empty), primary button "Confirmar asistencia" (`.misa__boton`). The card joins the reveal.
- One native `<dialog class="rsvp-dialogo">` in `index.html`, opened with `showModal()` from both `.rsvp__confirmar` and `.almuerzo__confirmar`. Native Esc and focus trap; on close, focus returns to the button that opened it. Closing by clicking the backdrop is out of scope (as in the lightbox). Page scroll is locked while open (`:root:has(.rsvp-dialogo[open])`).
- Dialog card: white, radius 20 px, `::backdrop` `--c-noche` at 60 % (if `::backdrop` custom properties are unreliable, use the literal colour via `color-mix` on the dialog wrapper, as the lightbox does). Visible title "Confirmar asistencia" (`aria-labelledby`). Close `×` button, 44 px, `aria-label="Cerrar"`.
- Entry motion: opacity fade plus 16 px upward translate (~300 ms, `--ease-suave`); under `prefers-reduced-motion: reduce`, fade only.
- Fields, each with a visible `<label>`: name (`<input>` `autocomplete="name"`, `maxlength="80"`, required), people (`<select>` 1–10, default 1, help "Incluyéndote a ti" linked by `aria-describedby`), message (`<textarea rows="3" maxlength="500">`, optional). Honeypot `botcheck`: checkbox off-screen, `tabindex="-1"`, `aria-hidden="true"`, `autocomplete="off"`.
- Inputs: 48 px high (textarea min 3 rows), radius 12 px, font 16 px. **Border `--c-texto-2`** (5.6:1 on white) instead of SPEC's `--c-plata-claro` (~1.4:1, fails the 3:1 control boundary rule); SPEC §5.9 is updated. Focus: border `--c-turquesa-profundo` plus a 3 px ring of `--c-turquesa` at 25 % (§6: `--c-turquesa` alone is too weak for focus).
- Validation (`novalidate` on the form; the client runs its own): trimmed name 2–80 chars, people an integer 1–10, trimmed message ≤ 500 chars (same rules as `Code.gs`). Errors show under each field in an element referenced by `aria-describedby`, `aria-invalid="true"` on the field, focus moves to the first invalid field. Errors clear when the field is edited.
- Pure helper in `src/modules/rsvp.ts`, tested in `src/modules/rsvp.test.ts`: `validarRsvp({ nombre, personas, mensaje })` returns `{ nombre?, personas?, mensaje? }` with the `t` keys of the failing fields (empty object = valid).
- Send: `fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ nombre, personas, mensaje, botcheck }), signal })` (normal CORS, not `no-cors`: E0-2 confirmed `access-control-allow-origin: *`). `AbortController` timeout of 12 s. Success only when the response parses as JSON with `ok === true`; anything else (network error, timeout, non-JSON, `ok:false`) is the error state.
- States, announced in an `aria-live="polite"` region:
  - Sending: submit button disabled, soft CSS spinner (static under reduced motion) and "Enviando…".
  - Error: "No pudimos enviar tu confirmación. Inténtalo de nuevo."; the typed data is kept and the button is enabled again.
  - Success: the form is replaced with a fade by "Gracias, {nombre}. Te esperamos con cariño." and a "Cerrar" button (focused). Closing after success resets the form so the next opening is empty.
- UI strings (Spanish) in `content.textos.rsvp`: `etiqueta: "CONFIRMA TU ASISTENCIA"`, `texto: "Nos acompañará mucho saber que estarás con nosotros."`, `confirmar: "Confirmar asistencia"`, `titulo: "Confirmar asistencia"`, `cerrar: "Cerrar"`, `nombre: "Nombre y apellido"`, `personas: "¿Cuántas personas asistirán?"`, `personasAyuda: "Incluyéndote a ti"`, `mensaje: "Mensaje para la familia"`, `mensajeOpcional: "(opcional)"`, `enviar: "Enviar confirmación"`, `enviando: "Enviando…"`, `error: "No pudimos enviar tu confirmación. Inténtalo de nuevo."`, `gracias: "Gracias, {nombre}. Te esperamos con cariño."`, `errorNombre: "Escribe tu nombre y apellido (de 2 a 80 caracteres)."`, `errorPersonas: "Elige entre 1 y 10 personas."`, `errorMensaje: "El mensaje puede tener hasta 500 caracteres."`. The name is inserted with `textContent` (never `innerHTML`).

## Edge cases
- Empty endpoint: section hidden, lunch button hidden (existing E5-3 logic), dialog never opens.
- Double submit: the button is disabled while sending; a second submit is ignored.
- Closing (Esc or ×) while sending: the request continues; reopening shows the current state.
- A name of only spaces fails validation; `=1+1` is sent as typed (the script stores it as text).
- Without JS: the section and dialog stay hidden.

## Acceptance criteria
| ID | Criterion | Verification | Result | Evidence |
|---|---|---|---|---|
| AC-01 | `validarRsvp` accepts valid data and rejects: name < 2 or > 80 after trim, people not an integer in 1–10, message > 500 after trim | automated (`rsvp.test.ts`) | PASS | `src/modules/rsvp.test.ts` (validarRsvp boundaries: 2/80 chars, spaces, 0/11/2.5/NaN people, 500/501 message); `npm run check` 82/82 pass |
| AC-02 | With the endpoint set, the RSVP section renders after the video with label, text, optional deadline line and button; with an empty endpoint it and the lunch button are hidden | manual (browser) | PASS | vite preview: `.rsvp` renders between `.video` and `.cierre` with label, text, button; deadline line hidden while `fechaLimiteTexto` is empty; empty endpoint sets `section.hidden` (code) and hides the lunch button (E5-3 logic, verified there) |
| AC-03 | "Confirmar asistencia" in §5.6 and in §5.9 open the same dialog; focus goes inside; × and Esc close it and focus returns to the button that opened it | manual (browser, keyboard) | PASS | vite preview: both buttons open the same dialog, focus on `#rsvp-nombre`; × and real Esc key close it, focus returns to the opener (lunch and section buttons) |
| AC-04 | Invalid submit shows Spanish errors under each field, linked by `aria-describedby`, `aria-invalid` set, focus on the first invalid field; nothing is sent | manual (browser) | PASS | empty submit: "Escribe tu nombre y apellido…" under the field, `aria-invalid="true"`, `aria-describedby` set in markup, focus on `#rsvp-nombre`, 0 fetch calls |
| AC-05 | Valid submit sends one CORS `text/plain` POST with `{nombre, personas, mensaje, botcheck}`; sending state disables the button and shows "Enviando…" | manual (browser, network) | PASS | stubbed fetch: one POST to the `/exec` URL, `Content-Type: text/plain;charset=utf-8`, body `{"nombre":"María Pérez","personas":3,"mensaje":"Hola","botcheck":false}` (trimmed); while pending the button is disabled and shows "Enviando…" |
| AC-06 | Error (network failure / timeout / `ok:false`) shows the error message and keeps the typed data | manual (browser, endpoint stubbed or offline) | PASS | stubbed `ok:false`, thrown network error and non-JSON body all show the error message; typed name kept, button enabled again |
| AC-07 | Success shows "Gracias, {nombre}…" and "Cerrar"; the next opening shows an empty form | manual (browser, stubbed response) | PASS | stubbed `ok:true`: "Gracias, Ana Ruiz. Te esperamos con cariño.", focus on "Cerrar" (after fix round 2); closing resets the form, reopening shows it empty |
| AC-08 | Inputs: 48 px, radius 12 px, 16 px font, border `--c-texto-2`, focus border `--c-turquesa-profundo` + 3 px ring; dialog radius 20 px, backdrop noche 60 %; reduced motion = fade only; no horizontal overflow at 320 px | manual (browser, computed style) | PASS | computed: input 48 px, select 48 px, radius 12 px, 16 px font, border rgb(91,107,117) = `--c-texto-2`; card radius 20 px; dialog background `--c-noche` at 0.6; reduced motion keeps an opacity-only fade. At 320 px the dialog adds no overflow; a pre-existing overflow from `.vocacion__estetoscopio` widens the layout viewport to 347 px (follow-up, not E6-2) |
| AC-09 | A real submission from the deployed Pages site creates a row in `Confirmaciones` | manual (deployed site) | NOT RUN | needs a push of this merge to Pages (user); the live CORS fetch from Pages already returned a parsed JSON response (E0-2) |
| AC-10 | `npm run check` passes | automated | PASS | `npm run check`: tsc ok, 82 tests pass, vite build ok (JS 8.86 kB gzip) |


## Cierre
Merged 2026-10-25. All ACs PASS except AC-09 (NOT RUN until the user pushes and sends one real confirmation from Pages). Review: 8 findings in round 1, 2 in round 2, all closed. Follow-up outside scope: `.vocacion__estetoscopio` overflow at 320 px.
