# SPEC: Invitación web, Misa en memoria de Juana Neyi Trigueros Balcazar

> Documento para implementar con Claude Code. Todos los recursos (fotos, audio, fuentes, decoración, imagen social, video) están en `assets/` junto a este archivo.
> Idioma del sitio: español (Perú). Zona horaria del evento: `America/Lima` (UTC−5, sin horario de verano).

---

## 1. Objetivo

Una invitación web de una sola página para compartir por WhatsApp y redes. Invita a la misa en memoria de **Juana Neyi Trigueros Balcazar**, enfermera, y al **almuerzo** posterior.

**Para qué sirve, además de honrar su memoria:** la familia necesita saber **cuántas personas irán al almuerzo** para dimensionarlo. Esa es la razón de la confirmación de asistencia (RF-02).

**Cuándo se comparte:** el link se envía **una sola vez, cuando el sitio esté completo** (toda esta spec), lo antes posible y siempre antes del 16/01/2027. No hay publicación por fases para los invitados.

El sitio continúa la estética del video homenaje: elegante, sobria, emotiva y cálida. Debe transmitir amor, gratitud y serenidad, sin dramatismo. La referencia a la enfermería es simbólica y ahora **más visible gracias al turquesa**, pero nunca debe dominar. El foco es ella, su recuerdo y la invitación.

**Referencia de formato:** invitaciones tipo *viaven* (p. ej. `invitaciones.viaven.pe/mis-15-marianna`). Patrones tomados de ese formato: pantalla de apertura, música con botón flotante, cuenta regresiva, galería, ubicación con mapa, agregar al calendario y confirmación de asistencia (aquí, a Google Sheets: §5.9). Esta spec ya define cada sección; no hace falta revisar la referencia antes de implementar.

### Alcance (MVP)
- Sitio estático, mobile-first (diseñado a 390 px y probado de 360 a 430 px). En escritorio se ve como una columna centrada de máximo 480 px sobre un fondo de ambiente.
- Todo el contenido editable vive en un único archivo de configuración.

### Requisitos funcionales
| ID | Requisito | Sección |
|---|---|---|
| **RF-01** | Mostrar el **mapa del lugar de la misa** (mapa embebido, botón "Cómo llegar" y dirección en texto) | §5.5 |
| **RF-02** | **Confirmación de asistencia** en un popup dentro de la web (el invitado no sale de la página), que se guarda en una **Google Sheet** de la familia mediante Google Apps Script, sin backend propio | §5.9 |
| **RF-03** | **Despliegue en GitHub Pages** con GitHub Actions en cada push a `main` | §2.1 |

### Fuera de alcance (fase 2, opcional)
- Libro de condolencias o recuerdos con persistencia.
- Panel de administración y analíticas.

### Descartado
- Confirmación por WhatsApp (`wa.me`) o por correo (Web3Forms / `mailto:`). Sustituidas por Google Sheets (§5.9).
- Formulario de confirmación fijo en la página: se usa un popup.
- Publicar la invitación por partes.

---

## 2. Stack y estructura

- **Vite + TypeScript sin framework** (HTML semántico, CSS con custom properties y TS mínimo). Sin librerías de UI.
- Animaciones con CSS y `IntersectionObserver`. Sin GSAP.
- Sin dependencias en runtime. Solo `vite` y `typescript` como devDependencies.
- Pruebas de la lógica pura (cuenta regresiva, `.ics`, validación del RSVP) con `node --test` en Node ≥ 22.18 o 24, que ejecuta `.ts` sin compilar: archivos `*.test.ts` junto al módulo. Sin framework de pruebas; el CI no las ejecuta.
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
│  │  ├─ location.ts     # mapa embebido + Cómo llegar / Waze / Copiar dirección (§5.5)
│  │  ├─ gallery.ts      # grilla + lightbox
│  │  ├─ rsvp.ts         # popup <dialog> de confirmación → Apps Script
│  │  └─ reveal.ts       # animaciones on-scroll
│  └─ styles/
│     ├─ tokens.css      # §4
│     ├─ fonts.css
│     ├─ base.css
│     └─ sections.css
├─ public/assets/         # `git mv assets public/assets` (mover, no copiar); `paleta.png` queda fuera de public/
├─ public/.nojekyll       # evita que Pages procese con Jekyll
├─ apps-script/Code.gs    # copia versionada del script de la Google Sheet (§5.9.1); no se despliega con el sitio
└─ .github/workflows/deploy.yml
```

### 2.1 Despliegue en GitHub Pages (RF-03)

**Rutas y base del sitio.** Un sitio de proyecto en Pages se sirve bajo `/<repo>/`, no en la raíz. Por eso:
- En `vite.config.ts` se define `base: process.env.VITE_BASE ?? '/misa-juana-neyi/'`. Con dominio propio (`CNAME`), `base` pasa a ser `'/'`.
- **Ninguna ruta empieza por `/`.** En HTML y CSS se usan rutas relativas (`assets/...`). En TS se usa `` `${import.meta.env.BASE_URL}assets/...` `` mediante un helper `asset(path)`.
- Las rutas de `content.ts` se escriben sin barra inicial (`"assets/fotos/01-retrato"`) y siempre pasan por `asset()`.
- Las URL absolutas de `og:image` y `og:url` se construyen con `content.sitio.url` (ver §3), porque WhatsApp no resuelve rutas relativas.
- **Los metadatos van en el HTML estático**, porque el rastreador de WhatsApp no ejecuta JS. Un plugin en línea de `vite.config.ts` con `transformIndexHtml` importa `src/content.ts` y escribe `og:*`, `<title>` y `description` en el `index.html` compilado. El resto del contenido sí lo pinta TS en tiempo de ejecución.
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
2. Crear la Google Sheet y publicar el Apps Script de confirmaciones (§5.9.1). Pegar la URL `/exec` en `content.rsvp.endpoint`.
3. Opcional: dominio propio con `public/CNAME` y `VITE_BASE=/`.

**Repo público, sin secretos.** En GitHub gratuito, Pages exige un repo público. Eso no es un problema porque el repo no contiene credenciales. La única "llave" es la URL del Apps Script, que de todos modos queda visible en el JS del sitio y solo permite **añadir** filas, no leerlas (ver §5.9.1).

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
    fechaISO: "2027-01-16T11:00:00-05:00",           // confirmado: 16/01/2027, 11:00 hora de Lima
    fechaTexto: "16 de enero de 2027",
    horaTexto: "11:00 a. m.",
    lugarNombre: "Iglesia Matriz de Santa Cruz de Flores",
    lugarDireccion: "Santa Cruz de Flores, Cañete, Lima", // TODO confirmar dirección textual exacta (calle / plaza)
  },
  mapa: {                                            // RF-01 (§5.5)
    lat: -12.619852 as number | null,                // del link de la familia maps.app.goo.gl/C5i76UgbEMWBuY9PA (pin de la iglesia)
    lng: -76.6417532 as number | null,
    zoom: 16,
    placeQuery: "Iglesia Matriz de Santa Cruz de Flores, Cañete, Perú",
    embedUrl: "",                                    // opcional: iframe src copiado de Google Maps (Compartir → Insertar un mapa); si existe, tiene prioridad
  },
  rsvp: {                                            // RF-02 (§5.9)
    endpoint: "",                                    // TODO URL /exec del Apps Script (§5.9.1). Vacío => la sección no se renderiza
    fechaLimiteTexto: "",                            // opcional, p. ej. "Por favor confírmanos antes del 10 de enero"
  },
  despues: {                                         // §5.6. activo:false => no se renderiza
    activo: true,
    titulo: "Almuerzo",
    texto: "Después de la misa los esperamos para compartir un almuerzo.", // TODO la familia confirma o ajusta este texto
    lugarNombre: "Local Comunal de Santa Cruz de Flores",
    mapsUrl: "",                                     // TODO opcional: link de Google Maps del local. Vacío => sin botón "Cómo llegar"
  },
  contacto: {
    firmaFamilia: "",                                // TODO opcional, p. ej. "Familia Vargas Trigueros"
  },
  textos: { /* ver §5: copiar literalmente */ },
  galeria: [ /* ver §5.7 */ ],
  musica: { mp3: "assets/audio/piano-homenaje.mp3", ogg: "assets/audio/piano-homenaje.ogg", volumen: 0.55 },
};
// No hay credenciales en este archivo ni en el repo. rsvp.endpoint es público por diseño (§5.9.1).
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
  - Antes de `fechaISO` (11:00 de Lima): cuenta regresiva normal, también el mismo día por la mañana.
  - Desde `fechaISO` hasta 3 h después (11:00–14:00 de Lima): "Hoy nos reunimos en su memoria".
  - Después: se oculta la cuenta regresiva y se muestra "Gracias por acompañarnos".
  - La función de estado es pura (`estado(ahora, inicio)`) y tiene su `countdown.test.ts`.
- Botones (píldora `--c-turquesa-profundo` con texto blanco y variante contorno):
  - "Agregar al calendario": genera un `.ics` en **UTC** (`DTSTART:20270116T160000Z`, `DTEND:20270116T170000Z`, sin bloque VTIMEZONE), con `SUMMARY` "Misa en memoria de Juana Neyi Trigueros Balcazar" y `LOCATION` = `lugarNombre, lugarDireccion`. Ofrece también el enlace a Google Calendar con las mismas horas UTC.
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
- Si `despues.activo`, el bloque §5.6 va justo debajo.
- **Cómo obtener los datos (para la familia):** en Google Maps, buscar la iglesia → mantener pulsado el pin → copiar las coordenadas en `lat`/`lng`. O bien *Compartir → Insertar un mapa → copiar solo el `src`* y pegarlo en `embedUrl`.

### 5.6 Almuerzo (después de la misa)
- Activa por defecto (`despues.activo: true`). Va justo debajo de §5.5.
- Tarjeta sencilla, misma estética que §5.4: etiqueta "ALMUERZO", `lugarNombre` en Cormorant 500 de 24 px y `texto` en Montserrat 300.
- Botón "Cómo llegar" (contorno) solo si existe `despues.mapsUrl`.
- Botón primario **"Confirmar asistencia"**: abre el mismo popup de §5.9. Así la confirmación queda junto al dato que la motiva (el almuerzo).

### 5.7 Momentos (galería)
- Título: "MOMENTOS". Subtítulo en Cormorant italic: "Su sonrisa, su familia, su vocación."
- Grilla de 2 columnas con fotos cuadradas, radio 14 px y hueco de 10 px. Las fotos aparecen con fade escalonado.
- Al tocar una foto se abre un lightbox: fondo `--c-noche` al 92 %, swipe y flechas, cierre con Esc o con ×, y foco gestionado.
- Orden por defecto: `06-celebracion-grupo`, `07-baile`, `08-fiesta-familiar`, `09-terraza`, `04-enfermera-colegas`, `05-hospital-abrazo`, `02-graduacion-diploma`, `03-graduacion-cofia`.

### 5.8 Video homenaje
- Título: "UN RECUERDO". `<video>` 9:16 con controles, `preload="none"` y póster `video-homenaje-poster.jpg`, de ancho máximo 320 px y centrado.
- Al reproducir el video, **la música de fondo se pausa** con un fade de 600 ms. Al pausar o terminar el video, la música no se reanuda sola.

### 5.9 Confirmar asistencia (RF-02)
**Objetivo:** que el invitado confirme en menos de 20 segundos **sin salir de la página**, y que la familia vea en una Google Sheet quién va y el **total de personas para el almuerzo**. Todo funciona sin servidor propio y es compatible con GitHub Pages.

Si `rsvp.endpoint` está vacío, la sección y los botones "Confirmar asistencia" no se renderizan.

**Sección en la página** (fondo bruma, tarjeta blanca con la misma estética que §5.4):
- Etiqueta "CONFIRMA TU ASISTENCIA".
- Texto: "Nos acompañará mucho saber que estarás con nosotros." Si existe `fechaLimiteTexto`, va debajo en `--c-texto-2`.
- Botón primario **"Confirmar asistencia"**, que abre el popup. Es el mismo popup que abre el botón de §5.6.

**Popup** (`<dialog>` nativo con `showModal()`, que da gratis el foco atrapado, el cierre con Esc y el `::backdrop`):
- Fondo de la tarjeta blanco, radio 20 px y backdrop `--c-noche` al 60 %. Entra con fade y un desplazamiento de 16 px; con `prefers-reduced-motion`, solo fade.
- Botón × para cerrar (`aria-label="Cerrar"`). Al cerrar, el foco vuelve al botón que lo abrió.
- Campos:
  - **Nombre y apellido** (obligatorio, 2–80 caracteres).
  - **¿Cuántas personas asistirán?**: selector del 1 al 10, por defecto 1. Ayuda debajo: "Incluyéndote a ti".
  - **Mensaje para la familia** (opcional, máx. 500 caracteres, `textarea` de 3 filas).
  - Honeypot `botcheck`: checkbox oculto fuera de pantalla, con `tabindex="-1"` y `aria-hidden`.
- Los inputs tienen 48 px de alto, radio 12 px y borde `--c-plata-claro`. Con foco, el borde pasa a `--c-turquesa` con anillo de 3 px de turquesa al 25 %. Las etiquetas son visibles (no solo `placeholder`). Fuente de 16 px para que iOS no haga zoom.
- Botón **"Enviar confirmación"**.

**Comportamiento:**
- Validación en el cliente, con mensajes en español bajo cada campo (`aria-describedby`) y región `aria-live="polite"` para los estados.
- Envío: `fetch(content.rsvp.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ nombre, personas, mensaje, botcheck }) })`.
  - Se usa `text/plain` a propósito: es una "petición simple" que no dispara preflight CORS, y Apps Script no responde a `OPTIONS`.
  - La respuesta es JSON `{ ok: true }` o `{ ok: false, error }`.
  - Tiempo máximo de 12 s con `AbortController`.
- Estados:
  - *Enviando*: botón desactivado, spinner suave y "Enviando…".
  - *Error*: "No pudimos enviar tu confirmación. Inténtalo de nuevo." Los datos escritos se conservan.
  - *Éxito*: el contenido del popup cambia con un fade a "Gracias, {nombre}. Te esperamos con cariño." y un botón "Cerrar".
- **Duplicados:** no hay deduplicación en el servidor. El estado "Ya confirmaste" reduce los dobles envíos y la familia revisa la hoja antes de cerrar el número del almuerzo.
- Tras el éxito se guarda `{ nombre, personas, fecha }` en `localStorage` (con `try/catch`). Si la persona vuelve, la sección muestra "Ya confirmaste como {nombre} ({personas}). ¡Gracias!" y un enlace "Confirmar otra persona" que abre el popup vacío.

**Debajo de la sección:** botón de texto "Compartir invitación". Usa la Web Share API y, si no está disponible, copia el enlace con el aviso "Enlace copiado".

#### 5.9.1 Google Sheet + Apps Script (receptor de confirmaciones)

**Por qué no expone credenciales:** el script se publica como *aplicación web* que "se ejecuta como" la cuenta de la familia. El sitio solo conoce la URL `/exec`. No hay claves de API, cuentas de servicio ni tokens en el repo. Esa URL **solo permite añadir filas**: el script no tiene ningún código que lea ni devuelva datos de la hoja, y la hoja sigue siendo privada.

**Riesgo residual:** alguien que vea la URL podría enviar filas falsas (spam). Se mitiga con:
- el honeypot;
- validación en el propio script;
- neutralización de fórmulas, para que un nombre como `=HYPERLINK(...)` se guarde como texto;
- `LockService`, para que dos envíos simultáneos no choquen.

Si apareciera spam, basta con crear una implementación nueva (URL nueva) y actualizar `rsvp.endpoint`.

**Montaje (una vez, ~15 min):**
1. Crear una Google Sheet con dos pestañas:
   - `Confirmaciones`, con la cabecera `Fecha | Nombre | Personas | Mensaje`;
   - `Resumen`, con `Total personas` y `=SUM(Confirmaciones!C2:C)`, y `Confirmaciones` y `=COUNTA(Confirmaciones!B2:B)`.
2. *Extensiones → Apps Script*, pegar `apps-script/Code.gs` y guardar.
3. *Implementar → Nueva implementación → Aplicación web*, con **Ejecutar como: yo** y **Quién tiene acceso: cualquier usuario**. Autorizar el permiso de la hoja y copiar la URL `/exec` a `content.rsvp.endpoint`.
4. Para cambiar el script sin cambiar la URL: *Implementar → Administrar implementaciones → editar → Nueva versión*.

**`apps-script/Code.gs`:**
```js
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // dentro del try: si expira, se responde JSON y no una página HTML de error
    const d = JSON.parse(e.postData.contents);
    if (d.botcheck) return json({ ok: true }); // honeypot: el bot cree que funcionó
    const nombre = String(d.nombre || "").trim();
    const personas = Number(d.personas);
    const mensaje = String(d.mensaje || "").trim();
    if (nombre.length < 2 || nombre.length > 80 || !Number.isInteger(personas) ||
        personas < 1 || personas > 10 || mensaje.length > 500) {
      return json({ ok: false, error: "invalid" });
    }
    SpreadsheetApp.getActive().getSheetByName("Confirmaciones")
      .appendRow([new Date(), safe(nombre), personas, safe(mensaje)]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "server" });
  } finally {
    lock.releaseLock();
  }
}
// Evita que un texto que empiece por = + - @ tab o CR se interprete como fórmula.
const safe = (s) => (/^[=+\-@\t\r]/.test(s) ? "'" + s : s);
const json = (o) => ContentService.createTextOutput(JSON.stringify(o))
  .setMimeType(ContentService.MimeType.JSON);
```

### 5.10 Cierre
- Fondo luminoso (blanco con halo cálido) y `flores-borde` al pie.
- Texto: "Su recuerdo permanece en nuestros corazones." (Cormorant italic, 32 px).
- Debajo, `cruz-luz.png` con una aparición muy lenta (2.4 s).
- Firma opcional `contacto.firmaFamilia` en Montserrat 300 de 14 px, `--c-texto-2`.

### Elemento persistente: botón de música
- Botón circular flotante de 44 px abajo a la derecha (respetando `safe-area-inset`). Fondo blanco al 80 % con `backdrop-filter: blur(8px)`, borde e icono turquesa. Muestra unas barras animadas suaves mientras suena.
- Los fades se hacen con Web Audio: `<audio>` → `MediaElementAudioSourceNode` → `GainNode`. **Nunca se anima `audio.volume`**, porque en iOS Safari es de solo lectura; `musica.volumen` es la ganancia máxima. El `AudioContext` se crea en el gesto de "Abrir invitación".
- Alterna reproducir y pausar con fades de 800 ms. `aria-label` dinámico: "Pausar música" / "Reproducir música".
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
  - `og:description` = "Con cariño y gratitud, te invitamos a acompañarnos. 16 de enero de 2027, 11:00 a. m., Santa Cruz de Flores."
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
| `decoracion/estetoscopio-desenfocado.png` | Estetoscopio turquesa desenfocado al 35 % (sección "Su vocación"). 1220 px y 207 KB: exportar una `.webp` de ~440 px para servir |
| `decoracion/separador-{turquesa,plata}.png` | Línea con rombo central |
| `social/og-image.jpg` | Vista previa para WhatsApp y redes, 1200×630 |
| `paleta.png` | Muestra visual de la paleta (§4.1), solo de referencia; no se despliega |

Las fotos ya vienen recortadas en cuadrado. **No recortar con `object-fit` de forma distinta en la galería.** En el lightbox se muestra el mismo cuadrado.

## 9. Criterios de aceptación
- [ ] La apertura muestra la frase, el botón y una transición de luz. La música arranca al pulsar y nunca antes.
- [ ] El nombre completo es el elemento tipográfico más grande de la página.
- [ ] El turquesa aparece como acento en el aro, los separadores, las etiquetas, los botones y la sección "Su vocación", y nunca en áreas grandes saturadas.
- [ ] Las dos fotos de graduación aparecen en "Su vocación" y en la galería.
- [ ] Los datos sin completar (dirección, mapa del almuerzo, endpoint de confirmación, firma) no generan huecos ni placeholders visibles.
- [ ] La cuenta regresiva es correcta en la hora de Lima desde cualquier zona horaria (probar desde Europe/Madrid): cuenta hasta las 11:00, "Hoy nos reunimos…" de 11:00 a 14:00 y "Gracias…" después.
- [ ] La música hace fade en iOS Safari (vía `GainNode`) y nunca se anima `audio.volume`.
- [ ] El `.ics` se importa bien en Google Calendar y en Apple Calendar con la hora de Lima.
- [ ] El video pausa la música y el botón de música funciona en iOS Safari y en Chrome Android.
- [ ] Hay vista previa correcta al pegar el enlace en WhatsApp.
- [ ] **RF-01:** con `lat`/`lng` o `placeQuery`, el mapa carga embebido sin API key. "Cómo llegar" abre la ruta en Google Maps (app en móvil), "Abrir en Waze" funciona y "Copiar dirección" copia el texto. Sin datos de mapa, no queda ningún hueco.
- [ ] **RF-02:** con `rsvp.endpoint` configurado, "Confirmar asistencia" (en §5.6 y en §5.9) abre el popup. Un envío válido añade una fila en la pestaña `Confirmaciones` con fecha, nombre, personas y mensaje, y `Resumen` actualiza el total. El invitado nunca sale de la página.
- [ ] **RF-02:** la validación impide enviar sin nombre o fuera de rango, tanto en el cliente como en el script. El honeypot no genera filas y un nombre como `=1+1` se guarda como texto.
- [ ] **RF-02:** los estados de enviando, éxito y error funcionan. El error conserva los datos escritos y el popup se maneja con teclado (Esc, foco atrapado y retorno del foco).
- [ ] **RF-02:** el envío funciona en iOS Safari, en Chrome Android y en el navegador interno de WhatsApp.
- [ ] **RF-03:** cada push a `main` despliega con GitHub Actions. En `https://<usuario>.github.io/misa-juana-neyi/` cargan todos los recursos (sin 404 en la consola) y `og:image` apunta a una URL absoluta válida. El repo no contiene credenciales.
- [ ] El sitio respeta `prefers-reduced-motion` y alcanza Lighthouse móvil ≥ 90 / ≥ 90.

## 10. Plan de trabajo
El desglose en épicas y tareas, con dependencias y criterios de cada una, está en [`docs/roadmap.md`](docs/roadmap.md).

## 11. Preguntas abiertas
Resueltas: la fecha (16/01/2027), la hora (11:00), la iglesia y su ubicación, que habrá almuerzo después y el canal de confirmación (Google Sheets).

1. Dirección textual exacta de la iglesia (calle o plaza) para `lugarDireccion`.
2. Link de Google Maps del Local Comunal de Santa Cruz de Flores (opcional) y validar el texto de la tarjeta del almuerzo.
3. ¿Hay fecha límite para confirmar? (`rsvp.fechaLimiteTexto`).
4. Firma de la familia y pies de foto (años o lugares) en las fotos de su vocación.
5. Nombre del repo o usuario de GitHub, y si se usará dominio propio (RF-03).
