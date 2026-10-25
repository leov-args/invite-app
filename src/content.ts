export const content = {
  sitio: {
    // Public final URL, used for absolute og:image/og:url.
    url: "https://leov-args.github.io/invite-app/",
    // Used for <title>, description and og:*. WhatsApp crawler does not run JS.
    titulo: "Misa en memoria de Juana Neyi Trigueros Balcazar",
    descripcion: "Con cariño y gratitud, te invitamos a acompañarnos. 16 de enero de 2027, 11:00 a. m., Santa Cruz de Flores.",
  },
  persona: {
    nombre: "Juana Neyi",
    apellidos: "Trigueros Balcazar",
    // No leading "/" and no extension: served as .webp with .jpg fallback via asset().
    retrato: "assets/fotos/01-retrato",
  },
  misa: {
    // Confirmed: 2027-01-16 11:00 Lima time (UTC-5, no daylight saving).
    fechaISO: "2027-01-16T11:00:00-05:00",
    fechaTexto: "16 de enero de 2027",
    horaTexto: "11:00 a. m.",
    lugarNombre: "Iglesia Matriz de Santa Cruz de Flores",
    // TODO: confirm exact street address
    lugarDireccion: "Santa Cruz de Flores, Cañete, Lima",
  },
  // RF-01 (SPEC §5.5).
  mapa: {
    // Coordinates from the family's link maps.app.goo.gl/C5i76UgbEMWBuY9PA (church pin).
    lat: -12.619852 as number | null,
    lng: -76.6417532 as number | null,
    zoom: 16,
    placeQuery: "Iglesia Matriz de Santa Cruz de Flores, Cañete, Perú",
    // Optional iframe src copied from Google Maps (Share → Embed a map); takes priority when set.
    embedUrl: "",
  },
  // RF-02 (SPEC §5.9).
  rsvp: {
    // TODO: URL /exec of the Apps Script (see SPEC §5.9.1). Empty hides the section.
    endpoint: "",
    // Optional, e.g. "Por favor confírmanos antes del 10 de enero".
    fechaLimiteTexto: "",
  },
  // SPEC §5.6; activo:false hides the block.
  despues: {
    activo: true,
    titulo: "Almuerzo",
    // TODO: family confirms or adjusts this wording
    texto: "Después de la misa los esperamos para compartir un almuerzo.",
    lugarNombre: "Local Comunal de Santa Cruz de Flores",
    // TODO: optional Google Maps link for the venue. Empty hides the directions button.
    mapsUrl: "",
  },
  contacto: {
    // TODO: optional family signature, e.g. "Familia Vargas Trigueros"
    firmaFamilia: "",
  },
  textos: {
    apertura: {
      frase: "Con cariño y gratitud, recordamos a…",
      boton: "Abrir invitación",
    },
    musica: {
      pausar: "Pausar música",
      reproducir: "Reproducir música",
    },
  },
  musica: {
    mp3: "assets/audio/piano-homenaje.mp3",
    ogg: "assets/audio/piano-homenaje.ogg",
    volumen: 0.55,
  },
};

// No credentials live in this file or in the repository. rsvp.endpoint is public by design (SPEC §5.9.1).
