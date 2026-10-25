# SPEC: Invitación web, Misa en memoria de Juana Neyi Trigueros Balcazar

> Documento para implementar con Claude Code. Todos los recursos (fotos, audio, fuentes, decoración, imagen social, video) están en `assets/` junto a este archivo.
> Idioma del sitio: español (Perú). Zona horaria del evento: `America/Lima` (UTC−5, sin horario de verano).

---

## 1. Objetivo

Una invitación web de una sola página para compartir por WhatsApp y redes. Invita a la misa en memoria de **Juana Neyi Trigueros Balcazar**, enfermera.

El sitio continúa la estética del video homenaje: elegante, sobria, emotiva y cálida. Debe transmitir amor, gratitud y serenidad, sin dramatismo. La referencia a la enfermería es simbólica y ahora **más visible gracias al turquesa**, pero nunca debe dominar. El foco es ella, su recuerdo y la invitación.

**Referencia de formato:** invitaciones tipo *viaven* (p. ej. `invitaciones.viaven.pe/mis-15-marianna`). No se pudo inspeccionar esa página al redactar esta spec. Los patrones de abajo son los habituales de ese formato: pantalla de apertura, música con botón flotante, cuenta regresiva, galería, ubicación con mapa, agregar al calendario y confirmación por WhatsApp. **Antes de implementar, revisa la referencia y ajusta lo que difiera.**

### Alcance (MVP)
- Sitio estático, mobile-first (diseñado a 390 px y probado de 360 a 430 px). En escritorio se ve como una columna centrada de máximo 480 px sobre un fondo de ambiente.
- Todo el contenido editable vive en un único archivo de configuración.

### Requisitos funcionales
| ID | Requisito | Sección |
|---|---|---|
| **RF-01** | Mostrar el **mapa del lugar de la misa** (mapa embebido, botón "Cómo llegar" y dirección en texto) | §5.5 |
| **RF-02** | **Confirmación de asistencia** que llegue por **WhatsApp** (por defecto) y/o por **correo**, sin backend propio | §5.9 |
| **RF-03** | **Despliegue en GitHub Pages** con GitHub Actions en cada push a `main` | §2.1 |

### Fuera de alcance (fase 2, opcional)
- Libro de condolencias o recuerdos con persistencia.
- Panel de administración y analíticas.

---

## 2. Stack y estructura

- **Vite + TypeScript sin framework** (HTML semántico, CSS con custom properties y TS mínimo). Sin librerías de UI.
- Animaciones con CSS y `IntersectionObserver`. Sin GSAP.
- Despliegue en **GitHub Pages** (RF-03, ver §2.1). Nombre de repo sugerido: `misa-juana-neyi`, que da la URL `https://<usuario>.github.io/misa-juana-neyi/`.

```
/
├─ index.html
├─ src/
│  ├─ content.ts          # ÚNICA fuente de contenido editable (ver §3)
│  ├─ main.ts            # arranque: apertura, música, reveal, countdown, lightbox
│  ├─ modules/
│  │  ├─ opening.ts      # pantalla de apertura
│  │  ├─ music.ts        # reproductor (fade in/out, botón flotante)
│  │  ├─ countdown.ts
│  │  ├─ calendar.ts     # .ics + enlace Google Calendar
│  │  ├─ gallery.ts      # grilla + lightbox
│  │  └─ reveal.ts       # animaciones on-scroll
│  └─ styles/
│     ├─ tokens.css      # §4
│     ├─ fonts.css
│     ├─ base.css
│     └─ sections.css
├─ public/assets/         # copiar tal cual la carpeta assets/ entregada
├─ public/.nojekyll       # evita que Pages procese con Jekyll
└─ .github/workflows/deploy.yml
```

### 2.1 Despliegue en GitHub Pages (RF-03)

**Rutas y base del sitio.** Un sitio de proyecto en Pages se sirve bajo `/<repo>/`, no en la raíz. Por eso:
- En `vite.config.ts` se define `base: process.env.VITE_BASE ?? '/misa-juana-neyi/'`. Con dominio propio (`CNAME`), `base` pasa a ser `'/'`.
- **Ninguna ruta empieza por `/`.** En HTML y CSS se usan rutas relativas (`assets/...`). En TS se usa `` `${import.meta.env.BASE_URL}assets/...` `` mediante un helper `asset(path)`.
- Las rutas de `content.ts` se escriben sin barra inicial (`"assets/fotos/01-retrato"`) y siempre pasan por `asset()`.
- Las URL absolutas de `og:image` y `og:url` se construyen con `content.sitio.url` (ver §3), porque WhatsApp no resuelve rutas relativas.
- Es una sola página sin router, así que no hace falta el truco del `404.html`.

**Workflow** `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          VITE_WEB3FORMS_KEY: ${{ vars.VITE_WEB3FORMS_KEY }}   # vacío => el canal email se desactiva solo
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.d.outputs.page_url }}" }
    steps:
      - id: d
        uses: actions/deploy-pages@v4
```

**Pasos manuales (una vez):**
1. En el repo, abrir *Settings → Pages → Build and deployment → Source* y elegir **GitHub Actions**.
2. Si se usa el correo (§5.9), crear en *Settings → Secrets and variables → Actions → Variables* la variable `VITE_WEB3FORMS_KEY`. El workflow ya la pasa al build. Esta clave es pública por diseño, porque acaba en el JS del sitio, así que va como *variable* y no como *secret*.
3. Opcional: dominio propio con `public/CNAME` y `VITE_BASE=/`.

**Comprobaciones tras desplegar:** las fotos, el audio y las fuentes cargan bajo `/<repo>/`, la vista previa de WhatsApp muestra la imagen y el mapa carga dentro de la página.

---

## 3. Contenido configurable (`src/content.ts`)

Todo texto o dato que pueda cambiar vive aquí. Los `TODO` deben mostrarse **ocultos** en la web si están vacíos: nunca se renderiza un placeholder visible ni se inventan datos.

```ts
export const content = {
  sitio: {
    url: "https://<usuario>.github.io/misa-juana-neyi/", // TODO URL pública final (para og:image/og:url absolutos)
  },
  persona: {
    nombre: "Juana Neyi",
    apellidos: "Trigueros Balcazar",
    retrato: "assets/fotos/01-retrato",            // sin "/" inicial ni extensión: se sirve .webp con fallback .jpg vía asset()
  },
  misa: {
    fechaISO: "2027-01-16T12:00:00-05:00",           // TODO confirmar fecha y hora (el video dice 16 de enero; hora pendiente)
    fechaTexto: "16 de enero de 2027",
    horaTexto: "",                                   // TODO p. ej. "12:00 del mediodía". Vacío => no se muestra
    lugarNombre: "",                                 // TODO nombre de la iglesia/parroquia
    lugarDireccion: "",                              // TODO dirección, p. ej. "Santa Cruz de Flores, Cañete"
  },
  mapa: {                                            // RF-01 (§5.5)
    lat: null as number | null,                      // TODO coordenadas de la iglesia, p. ej. -12.62...
    lng: null as number | null,
    zoom: 16,
    placeQuery: "",                                  // TODO alternativa a lat/lng: "Parroquia X, Santa Cruz de Flores, Cañete, Perú"
    embedUrl: "",                                    // opcional: iframe src copiado de Google Maps (Compartir → Insertar un mapa); si existe, tiene prioridad
  },
  rsvp: {                                            // RF-02 (§5.9)
    canal: "whatsapp" as "whatsapp" | "email" | "ambos",
    whatsapp: "",                                    // TODO formato internacional sin "+" ni espacios, p. ej. "51987654321" (Perú) o "34600111222" (España)
    emailDestino: "",                                // solo informativo: el correo real se fija en la cuenta de Web3Forms
    fechaLimiteTexto: "",                            // opcional, p. ej. "Por favor confírmanos antes del 10 de enero"
  },
  despues: {                                         // sección opcional (§5.6). activo:false => no se renderiza
    activo: false,
    titulo: "Después de la misa",
    texto: "",                                       // TODO p. ej. acompañamiento al cementerio
    lugarNombre: "",
    mapsUrl: "",
  },
  contacto: {
    firmaFamilia: "",                                // TODO opcional, p. ej. "Familia Vargas Trigueros"
  },
  textos: { /* ver §5: copiar literalmente */ },
  galeria: [ /* ver §5.7 */ ],
  musica: { mp3: "assets/audio/piano-homenaje.mp3", ogg: "assets/audio/piano-homenaje.ogg", volumen: 0.55 },
};
// La clave de Web3Forms NO va aquí: se lee de import.meta.env.VITE_WEB3FORMS_KEY (§2.1).
```

---

## 4. Sistema visual

### 4.1 Paleta (tokens)

La paleta es la del video, con el **turquesa de enfermería** como color de acento protagonista. El resto sigue siendo blanco, marfil, agua, salvia y plata.

```css
:root {
  /* superficies */
  --c-noche:            #0B1219;  /* solo pantalla de apertura */
  --c-marfil:           #F7F3EC;  /* fondo cálido (hero, mensaje, cierre) */
  --c-bruma:            #F3F9F9;  /* fondo frío claro */
  --c-agua-claro:       #E3F3F3;  /* secciones alternas */
  --c-turquesa-suave:   #CDECEE;  /* lavados, bandas, fondos de tarjeta destacada */

  /* turquesa de enfermería (acento) */
  --c-turquesa:         #2AA6B0;  /* decorativo: aros, iconos, separadores, bordes, texto ≥ 24px */
  --c-turquesa-profundo:#167680;  /* botones (texto blanco 5.3:1), enlaces, etiquetas pequeñas */
  --c-turquesa-tinta:   #14636B;  /* texto pequeño en turquesa sobre fondos claros (6.5:1) */
  --c-turquesa-noche:   #7FD1D6;  /* acento sobre --c-noche (10.8:1) */

  /* acompañantes */
  --c-salvia:           #A7C3B8;  /* hojas */
  --c-plata:            #A6B2BA;  /* líneas finas, aros secundarios */
  --c-plata-claro:      #D5DCE0;  /* bordes de tarjeta */
  --c-luz-calida:       #D9B98C;  /* halos de luz, solo en gradientes */
  --c-luz-calida-suave: #FFF4DF;

  /* texto */
  --c-texto:            #23323D;  /* 11.9:1 sobre marfil */
  --c-texto-2:          #5B6B75;  /* 5.0:1 sobre marfil */
  --c-texto-noche:      #EFE6D8;  /* sobre --c-noche */
}
```

**Reglas de uso del turquesa** (más presente que en el video, pero siempre de acento):
- Aparece en todos los separadores (`separador-turquesa.png`), en el aro del retrato, en las etiquetas en mayúsculas (`MISA EN SU MEMORIA`, títulos de sección), en los botones primarios, en los iconos y en la cruz médica.
- La sección "Su vocación" (§5.2) usa un fondo `--c-turquesa-suave` → `--c-agua-claro`. Es la única sección con fondo turquesa.
- No se usa turquesa saturado en áreas grandes ni como color de texto corrido. No hay rojo en ninguna parte (evitar la estética de "cruz roja").
- `--c-turquesa` (#2AA6B0) **no** cumple AA para texto pequeño sobre blanco (2.9:1). Para texto < 24 px usar `--c-turquesa-profundo` o `--c-turquesa-tinta`.

**Fondos:** son gradientes suaves, no colores planos. Llevan halos radiales de luz (`--c-luz-calida-suave` o blanco) y un grano muy sutil (ruido SVG al 3–4 % de opacidad) para dar textura cinematográfica.

### 4.2 Tipografía

Las fuentes están autoalojadas en `assets/fonts/` (licencia OFL incluida), con `font-display: swap`.

| Uso | Fuente | Peso / estilo | Tamaño móvil |
|---|---|---|---|
| Nombre | Cormorant Garamond | 500 | 52 / 42 px (nombre / apellidos), `clamp()` |
| Frases emotivas | Cormorant Garamond | 400 italic | 28–32 px, interlineado 1.35 |
| Fecha destacada | Cormorant Garamond | 500 | 40 px |
| Etiquetas (`MISA EN SU MEMORIA`, títulos de sección) | Montserrat | 500, MAYÚSCULAS, `letter-spacing: .28em` | 13–14 px |
| Datos y cuerpo | Montserrat | 300 / 400 | 16 px, interlineado 1.6 |
| Botones | Montserrat | 500, `letter-spacing: .08em` | 15 px |

### 4.3 Forma, espacio y sombra
- Radios: tarjetas de 20 px, botones tipo píldora (999 px), fotos de galería de 14 px y retrato circular.
- Sombras muy suaves y teñidas, p. ej. `0 18px 40px -18px rgb(20 70 80 / .25)`. Nunca negro puro.
- Espaciado vertical generoso: 96–120 px entre secciones en móvil. Mucho aire alrededor de cada texto.

### 4.4 Movimiento

```css
--ease-suave: cubic-bezier(.22,.61,.36,1);
--dur-texto: 1400ms;   /* aparición de textos */
--dur-foto:  1800ms;
--dur-escena: 2400ms;  /* transiciones de luz/fondo */
```
- Los elementos aparecen al entrar en pantalla con un fade y un desplazamiento de 16 px hacia arriba. Los elementos hermanos se escalonan cada 200–300 ms.
- Las fotos combinan fade, desenfoque (8 px → 0) y escala (1.04 → 1).
- Los halos de luz de fondo "respiran" muy lento (opacidad ±8 % en ciclos de 8–10 s).
- **Prohibido:** flashes, zooms bruscos, rebotes, parallax agresivo, confeti y partículas abundantes. Se permiten como máximo 5–6 círculos de bokeh desenfocados por sección, con un movimiento casi imperceptible.
- Con `prefers-reduced-motion: reduce` se eliminan los desplazamientos, el blur y los bucles. Solo quedan fades de 300 ms.

---

## 5. Secciones (en orden)

Los textos entre comillas se copian **literalmente**.

### 5.0 Pantalla de apertura (overlay a pantalla completa)
- Fondo `--c-noche` con un halo cálido central que se enciende lentamente en 3 s, igual que la escena 1 del video.
- El texto aparece con fade a 1.2 s: "Con cariño y gratitud, recordamos a..." (Cormorant italic, `--c-texto-noche`).
- Botón a 2.4 s: **"Abrir invitación"**. Es una píldora con borde `--c-turquesa-noche`, texto `--c-texto-noche` y una pequeña nota musical opcional.
- Al pulsar se hacen tres cosas a la vez. (1) Arranca la música, porque los navegadores solo permiten reproducir audio tras un gesto del usuario. (2) El overlay se disuelve en luz: el fondo pasa a marfil y se desvanece en 1.8 s. (3) Se bloquea el scroll hasta que termina la transición.
- Se recuerda la apertura en `sessionStorage` para no repetirla al recargar. Las lecturas y escrituras van en `try/catch`.

### 5.1 Hero
- Fondo marfil → bruma con halo blanco detrás del retrato.
- **Retrato circular** (`01-retrato`, 240–280 px). Lleva un aro interior turquesa de 3 px y un aro exterior plateado de 1 px separado 10 px, más una sombra suave. Al entrar hace un zoom lento de 1.0 a 1.06 durante 12 s.
- Etiqueta: "EN MEMORIA DE" (Montserrat, `--c-turquesa-profundo`).
- Nombre en dos líneas: "Juana Neyi" / "Trigueros Balcazar". Es el elemento principal de la página.
- Debajo, `separador-turquesa.png` (línea con rombo).
- Indicador de scroll discreto: chevron fino en plata con un pulso lento.

### 5.2 Su vocación (enfermería)
- Fondo `--c-turquesa-suave` → `--c-agua-claro`. `estetoscopio-desenfocado.png` sangra desde la esquina inferior derecha (máx. 45 % del ancho) y `cruz-medica-turquesa.png` queda pequeña (48 px) sobre el texto.
- Título de sección: "SU VOCACIÓN".
- Frase: "Una mujer que dedicó parte de su vida a cuidar y servir a los demás."
- Composición de fotos: las dos fotos de su graduación (`02-graduacion-diploma`, `03-graduacion-cofia`) en un par ligeramente superpuesto. Cada una con marco blanco de 8 px y rotación −2° / +2°, como fotos impresas. Después, `04-enfermera-colegas` y `05-hospital-abrazo` a ancho completo o en par.
- Pies de foto opcionales en Cormorant italic de 15 px. Se dejan vacíos por defecto (`TODO` si la familia quiere añadir años o lugares).

### 5.3 Mensaje
- Fondo marfil con luz cálida entrando en diagonal (rayos suaves con gradiente lineal, opacidad ≤ 25 %) y `flores-borde` al pie de la sección.
- Texto: "Con amor, familiares y amigos nos reuniremos para honrar su memoria y elevar una oración por su eterno descanso."

### 5.4 Misa en su memoria (detalles + cuenta regresiva)
- Tarjeta central sobre fondo bruma: fondo blanco al 85 %, borde `--c-plata-claro`, radio 20 px. Lleva `cruz-luz.png` pequeña arriba.
- "MISA EN SU MEMORIA" (etiqueta turquesa) y luego `separador-turquesa`.
- Fecha: "16 de enero de 2027" (de `content.misa.fechaTexto`).
- Hora, lugar y dirección: cada línea **solo si su valor existe**, con iconos lineales finos en turquesa (reloj, iglesia, pin). Hay que reservar el espacio en el diseño, pero sin dejar huecos visibles cuando falten datos.
- **Cuenta regresiva** con días, horas, minutos y segundos. Los números van en Cormorant 500 de 36 px y las etiquetas en Montserrat de 11 px en mayúsculas. Se calcula contra `fechaISO`, que ya incluye `-05:00`.
  - Antes del evento: cuenta regresiva normal.
  - Mismo día y hasta 3 h después: "Hoy nos reunimos en su memoria".
  - Después: se oculta la cuenta regresiva y se muestra "Gracias por acompañarnos".
- Botones (píldora `--c-turquesa-profundo` con texto blanco y variante contorno):
  - "Agregar al calendario": genera un `.ics` (duración 1 h, `TZID=America/Lima` o UTC) y ofrece también el enlace a Google Calendar.
  - "Ver ubicación": hace scroll suave hasta §5.5.

### 5.5 Ubicación de la misa (RF-01)
**Objetivo:** que cualquier invitado sepa dónde es la misa y pueda abrir la ruta en su móvil con un toque.

- Título: "DÓNDE NOS REUNIREMOS" (etiqueta turquesa), con `lugarNombre` debajo en Cormorant 500 de 28 px y `lugarDireccion` en Montserrat 300.
- **Mapa embebido sin API key ni cuenta de Google Cloud.** Prioridad de la fuente del iframe:
  1. `mapa.embedUrl`, si existe (el `src` copiado de Google Maps → Compartir → *Insertar un mapa*).
  2. Si hay `lat`/`lng`: `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=es&output=embed`.
  3. Si hay `placeQuery`: `https://maps.google.com/maps?q=${encodeURIComponent(placeQuery)}&z=${zoom}&hl=es&output=embed`.
  4. Si no hay nada: no se renderiza el mapa, pero sí el texto de la dirección cuando exista.
- Contenedor con proporción 4:3 en móvil y 16:9 a partir de 600 px, radio 20 px, borde `--c-plata-claro` y sombra suave. El iframe lleva `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"` y `title="Mapa: lugar de la misa"`.
- Para integrarlo en la paleta: `filter: saturate(.7) contrast(.96)`. Encima del mapa va un pin decorativo en turquesa (`aria-hidden`).
- **Botones bajo el mapa** (en fila; en pantallas de menos de 360 px, en columna):
  - **"Cómo llegar"** (primario): `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, o con `destination=${encodeURIComponent(placeQuery)}`. En móvil abre la app de Maps.
  - **"Abrir en Waze"** (secundario, solo con lat/lng): `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`.
  - **"Copiar dirección"** (enlace de texto): copia `lugarNombre + ", " + lugarDireccion` con `navigator.clipboard` y muestra el aviso "Dirección copiada".
- Si `despues.activo`, el bloque §5.6 va justo debajo con su propio botón "Cómo llegar".
- **Cómo obtener los datos (para la familia):** en Google Maps, buscar la iglesia → mantener pulsado el pin → copiar las coordenadas en `lat`/`lng`. O bien *Compartir → Insertar un mapa → copiar solo el `src`* y pegarlo en `embedUrl`.

### 5.6 Después de la misa (opcional)
- Solo si `despues.activo`. Tarjeta sencilla con título, texto y botón "Cómo llegar".

### 5.7 Momentos (galería)
- Título: "MOMENTOS". Subtítulo en Cormorant italic: "Su sonrisa, su familia, su vocación."
- Grilla de 2 columnas con fotos cuadradas, radio 14 px y hueco de 10 px. Las fotos aparecen con fade escalonado.
- Al tocar una foto se abre un lightbox: fondo `--c-noche` al 92 %, swipe y flechas, cierre con Esc o con ×, y foco gestionado.
- Orden por defecto: `06-celebracion-grupo`, `07-baile`, `08-fiesta-familiar`, `09-terraza`, `04-enfermera-colegas`, `05-hospital-abrazo`, `02-graduacion-diploma`, `03-graduacion-cofia`.

### 5.8 Video homenaje
- Título: "UN RECUERDO". `<video>` 9:16 con controles, `preload="none"` y póster `video-homenaje-poster.jpg`, de ancho máximo 320 px y centrado.
- Al reproducir el video, **la música de fondo se pausa** con un fade de 600 ms. Al pausar o terminar el video, la música no se reanuda sola.

### 5.9 Confirmar asistencia (RF-02)
**Objetivo:** que el invitado confirme en menos de 20 segundos y que la familia reciba la confirmación por WhatsApp y/o por correo, sin servidor propio (compatible con GitHub Pages).

**Canales**, elegidos con `content.rsvp.canal`:

| Canal | Cómo funciona | Configuración | Recibe |
|---|---|---|---|
| `whatsapp` (**por defecto, el más simple**) | Abre WhatsApp con el mensaje prellenado (`https://wa.me/<numero>?text=...`); el invitado solo pulsa *Enviar* | Solo el número en `rsvp.whatsapp` | Chat de WhatsApp de ese número |
| `email` | `POST` a **Web3Forms** (`https://api.web3forms.com/submit`), que reenvía el formulario al correo | Entrar en web3forms.com, escribir el correo destino y copiar la *access key* que llega por email a la variable `VITE_WEB3FORMS_KEY` (§2.1). Plan gratuito: 250 envíos al mes | Bandeja de entrada |
| `ambos` | Mismo formulario con dos botones: "Enviar por WhatsApp" y "Enviar por correo" | Las dos configuraciones | Ambos |

Si el canal requiere `email` pero falta `VITE_WEB3FORMS_KEY`, se usa WhatsApp. Si tampoco hay número, la sección no se renderiza.

**Formulario** (tarjeta blanca, igual estética que §5.4):
- Texto de entrada: "Nos acompañará mucho saber que estarás con nosotros." Si existe `fechaLimiteTexto`, va debajo en `--c-texto-2`.
- Campos:
  - **Nombre y apellido** (obligatorio, 2–80 caracteres).
  - **¿Cuántas personas asistirán?**: selector del 1 al 10, por defecto 1.
  - **Mensaje o recuerdo para la familia** (opcional, máx. 500 caracteres, `textarea` de 3 filas).
- Los inputs tienen 48 px de alto, radio 12 px y borde `--c-plata-claro`. Con foco, el borde pasa a `--c-turquesa` con anillo de 3 px de turquesa al 25 %. Las etiquetas son visibles (no solo `placeholder`).
- Botón primario: **"Confirmar asistencia"** (o los dos botones si el canal es `ambos`). Usa iconos de WhatsApp y de sobre, de línea fina y en blanco.

**Comportamiento:**
- **WhatsApp:** se valida el formulario y, dentro del mismo `click` (para que el navegador no lo bloquee como popup), se abre `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`. En móvil va en la misma pestaña; en escritorio, en una pestaña nueva. Mensaje:
  ```
  Hola 🤍 Confirmo mi asistencia a la misa en memoria de Juana Neyi Trigueros Balcazar (16 de enero de 2027).
  Nombre: {nombre}
  Personas: {n}
  Mensaje: {mensaje}        ← línea omitida si está vacío
  ```
  La fecha del mensaje sale de `misa.fechaTexto`.
- **Correo:** `fetch` con `Content-Type: application/json` y este cuerpo:
  `{ access_key, subject: "Confirmación misa Juana Neyi: {nombre} ({n})", from_name: "Invitación misa Juana Neyi", nombre, personas, mensaje, botcheck: "" }`.
  - Antispam: campo honeypot `botcheck` oculto (checkbox) y botón desactivado durante el envío.
  - Estados: *enviando* (spinner suave y "Enviando…"), *éxito* y *error*. En el error aparece "No pudimos enviar tu confirmación. Inténtalo de nuevo" y, si hay número, el botón alternativo "Confirmar por WhatsApp".
  - Tiempo máximo de 12 s con `AbortController`.
- **Éxito** (tras enviar el correo, o tras abrir WhatsApp): el formulario se sustituye con un fade por el mensaje "Gracias, {nombre}. Te esperamos con cariño." y un enlace "Confirmar otra persona" que reinicia el formulario.
  - Se guarda `{ nombre, fecha }` en `localStorage` (con `try/catch`) para mostrar ese estado si la persona vuelve. En el caso de WhatsApp, el texto es "Si aún no lo hiciste, pulsa *Enviar* en WhatsApp", porque no se puede saber si llegó a enviarlo.
- Validación en el cliente, con mensajes en español bajo cada campo (`aria-describedby`) y región `aria-live="polite"` para los estados.

**Debajo del formulario:** botón de texto "Compartir invitación". Usa la Web Share API y, si no está disponible, copia el enlace con el aviso "Enlace copiado".

### 5.10 Cierre
- Fondo luminoso (blanco con halo cálido) y `flores-borde` al pie.
- Texto: "Su recuerdo permanece en nuestros corazones." (Cormorant italic, 32 px).
- Debajo, `cruz-luz.png` con una aparición muy lenta (2.4 s).
- Firma opcional `contacto.firmaFamilia` en Montserrat 300 de 14 px, `--c-texto-2`.

### Elemento persistente: botón de música
- Botón circular flotante de 44 px abajo a la derecha (respetando `safe-area-inset`). Fondo blanco al 80 % con `backdrop-filter: blur(8px)`, borde e icono turquesa. Muestra unas barras animadas suaves mientras suena.
- Alterna reproducir y pausar con fades de volumen de 800 ms. `aria-label` dinámico: "Pausar música" / "Reproducir música".
- La pista dura 45 s y se reproduce en bucle. Antes de reiniciar se hace un fade-out y un fade-in de 1.5 s para disimular el corte.
- La música se pausa sola con `visibilitychange` cuando la pestaña queda oculta y se reanuda al volver solo si estaba sonando.

---

## 6. Accesibilidad
- Contraste AA en todo el texto (ver las reglas del turquesa en §4.1).
- Las fotos llevan `alt` descriptivos en español, p. ej. "Juana Neyi el día de su graduación como enfermera, con cofia y uniforme blanco". Las decoraciones llevan `alt=""` y `aria-hidden`.
- Se puede navegar con teclado: apertura, botones y lightbox, con un foco visible en anillo turquesa de 2 px.
- La música nunca suena sin una acción del usuario y siempre se puede detener.
- Funciona con `prefers-reduced-motion` y con zoom de texto al 200 % sin solapamientos.

## 7. Rendimiento y metadatos
- Las imágenes se sirven en `<picture>` con WebP y fallback JPG, con `width`/`height` explícitos y `loading="lazy"` salvo el retrato. Se usa `decoding="async"`.
- La primera carga (sin video ni audio) pesa menos de 1 MB. El audio se precarga solo después de abrir la invitación. Lighthouse móvil ≥ 90 en Performance y Accesibilidad.
- Metadatos para la vista previa en WhatsApp:
  - `og:title` = "Misa en memoria de Juana Neyi Trigueros Balcazar"
  - `og:description` = "Con cariño y gratitud, te invitamos a acompañarnos. 16 de enero de 2027."
  - `og:image` = `content.sitio.url + "assets/social/og-image.jpg"` (URL absoluta, 1200×630); `og:url` = `content.sitio.url`
  - `og:type` = "website" y `theme-color` = `#F7F3EC`
- `<meta name="robots" content="noindex">`, porque es un evento familiar privado.
- Favicon: la cruz médica turquesa en SVG sobre marfil.

## 8. Inventario de recursos (`assets/`)

| Ruta | Contenido |
|---|---|
| `fotos/01-retrato.{webp,jpg}` | Retrato principal, cuadrado 830 px (del video) |
| `fotos/02-graduacion-diploma.{webp,jpg}` | **Nueva:** graduación, recibiendo el diploma, cuadrada 660 px |
| `fotos/03-graduacion-cofia.{webp,jpg}` | **Nueva:** graduación, sentada con cofia, cuadrada 840 px |
| `fotos/04-enfermera-colegas` … `09-terraza` | Resto de fotos, todas cuadradas (581–1200 px) |
| `audio/piano-homenaje.{mp3,ogg}` | Música original del video (45 s, piano y cuerdas, libre de derechos) |
| `video/video-homenaje.mp4` + `-poster.jpg` | Video de invitación 9:16 (3.9 MB) |
| `fonts/*.woff2` + licencias OFL | Cormorant Garamond (400, 500, 400i, 300i), Montserrat (300, 400, 500) |
| `decoracion/flores-borde.{png,webp}` | Racimo de flores blancas con hojas salvia, transparente (1600×760), para el pie de secciones |
| `decoracion/flor-{1,2,3}.{png,webp}` | Flores sueltas para esquinas |
| `decoracion/cruz-medica-{turquesa,plata}.png` | Cruz médica de contorno fino con halo |
| `decoracion/cruz-luz.png` | Cruz latina fina con halo de luz (cierre y tarjeta de misa) |
| `decoracion/estetoscopio-desenfocado.png` | Estetoscopio turquesa desenfocado al 35 % (sección "Su vocación") |
| `decoracion/separador-{turquesa,plata}.png` | Línea con rombo central |
| `social/og-image.jpg` | Vista previa para WhatsApp y redes, 1200×630 |
| `paleta.png` | Muestra visual de la paleta (§4.1), solo de referencia; no se despliega |

Las fotos ya vienen recortadas en cuadrado. **No recortar con `object-fit` de forma distinta en la galería.** En el lightbox se muestra el mismo cuadrado.

## 9. Criterios de aceptación
- [ ] La apertura muestra la frase, el botón y una transición de luz. La música arranca al pulsar y nunca antes.
- [ ] El nombre completo es el elemento tipográfico más grande de la página.
- [ ] El turquesa aparece como acento en el aro, los separadores, las etiquetas, los botones y la sección "Su vocación", y nunca en áreas grandes saturadas.
- [ ] Las dos fotos de graduación aparecen en "Su vocación" y en la galería.
- [ ] Los datos sin completar (hora, lugar, mapa, WhatsApp, sección "Después") no generan huecos ni placeholders visibles.
- [ ] La cuenta regresiva es correcta en la hora de Lima desde cualquier zona horaria (probar desde Europe/Madrid).
- [ ] El `.ics` se importa bien en Google Calendar y en Apple Calendar con la hora de Lima.
- [ ] El video pausa la música y el botón de música funciona en iOS Safari y en Chrome Android.
- [ ] Hay vista previa correcta al pegar el enlace en WhatsApp.
- [ ] **RF-01:** con `lat`/`lng` o `placeQuery`, el mapa carga embebido sin API key. "Cómo llegar" abre la ruta en Google Maps (app en móvil), "Abrir en Waze" funciona y "Copiar dirección" copia el texto. Sin datos de mapa, no queda ningún hueco.
- [ ] **RF-02 WhatsApp:** con el formulario válido se abre WhatsApp con el mensaje prellenado (nombre, personas, mensaje y fecha) hacia el número configurado, en iOS, en Android y en escritorio (WhatsApp Web).
- [ ] **RF-02 Correo:** con `VITE_WEB3FORMS_KEY`, el envío llega a la bandeja configurada con asunto y campos correctos. Los estados de enviando, éxito y error funcionan, y el error ofrece WhatsApp como alternativa.
- [ ] **RF-02:** la validación impide enviar sin nombre y el honeypot bloquea envíos automáticos.
- [ ] **RF-03:** cada push a `main` despliega con GitHub Actions. En `https://<usuario>.github.io/misa-juana-neyi/` cargan todos los recursos (sin 404 en la consola) y `og:image` apunta a una URL absoluta válida.
- [ ] El sitio respeta `prefers-reduced-motion` y alcanza Lighthouse móvil ≥ 90 / ≥ 90.

## 10. Plan de PRs sugerido
1. **Scaffold, tokens y despliegue (RF-03)**: Vite + TS, `base` de Pages, helper `asset()`, `tokens.css`, fuentes, `content.ts`, metadatos OG y workflow `deploy.yml`. Desplegar ya una página mínima para validar las rutas desde el primer día.
2. **Apertura y música**: overlay, transición de luz, módulo de música y botón flotante.
3. **Hero y "Su vocación"**: retrato, nombre y la composición de fotos de graduación.
4. **Mensaje, misa y cuenta regresiva**: tarjeta, lógica de estados, `.ics` y Google Calendar.
5. **Ubicación (RF-01)**: mapa embebido, "Cómo llegar", Waze, "Copiar dirección" y sección "Después".
6. **Confirmación de asistencia (RF-02)**: formulario, canal WhatsApp, canal correo con Web3Forms, estados y persistencia.
7. **Galería, lightbox, video y cierre**.
8. **Pulido**: reduced motion, accesibilidad, Lighthouse y pruebas en dispositivos reales (iOS Safari, Chrome Android y WhatsApp in-app browser).

## 11. Preguntas abiertas
1. **Fecha:** el video dice **16 de enero de 2027**. Hay que confirmarla, porque se ha mencionado también el 15 de enero.
2. Hora exacta, nombre de la iglesia, dirección y coordenadas o enlace de Google Maps (RF-01).
3. ¿Se muestra la sección "Después de la misa" (p. ej. el cementerio)? Si es así, con qué texto y ubicación.
4. Confirmaciones (RF-02): ¿solo WhatsApp, solo correo o ambos? ¿A qué número y a qué correo? ¿Hay fecha límite para confirmar?
5. Firma de la familia y pies de foto (años o lugares) en las fotos de su vocación.
6. Nombre del repo o usuario de GitHub, y si se usará dominio propio (RF-03).
