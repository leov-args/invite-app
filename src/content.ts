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
    hero: {
      etiqueta: "EN MEMORIA DE",
      retratoAlt: "Juana Neyi sonriendo, con la mano apoyada en la mejilla",
    },
    // Nursing section (SPEC §5.2).
    vocacion: {
      titulo: "SU VOCACIÓN",
      frase: "Una mujer que dedicó parte de su vida a cuidar y servir a los demás.",
      fotos: [
        {
          src: "assets/fotos/02-graduacion-diploma",
          alt: "Juana Neyi el día de su graduación de enfermería, con uniforme blanco, cofia y un ramillete de flores en el pecho",
          pie: "", // TODO: family may add years or places
        },
        {
          src: "assets/fotos/03-graduacion-cofia",
          alt: "Juana Neyi con cofia y uniforme blanco, sentada junto a sus compañeras en la ceremonia de graduación",
          pie: "", // TODO: family may add years or places
        },
        {
          src: "assets/fotos/04-enfermera-colegas",
          alt: "Juana Neyi con uniforme turquesa, abrazada a dos colegas enfermeras frente al hospital",
          pie: "", // TODO: family may add years or places
        },
        {
          src: "assets/fotos/05-hospital-abrazo",
          alt: "Juana Neyi abrazando con cariño a una colega en la oficina de enfermería",
          pie: "", // TODO: family may add years or places
        },
      ],
    },
    // Message section (SPEC §5.3).
    mensaje: {
      texto: "Con amor, familiares y amigos nos reuniremos para honrar su memoria y elevar una oración por su eterno descanso.",
    },
    // Mass section (SPEC §5.4).
    misa: {
      etiqueta: "MISA EN SU MEMORIA",
      hoy: "Hoy nos reunimos en su memoria",
      gracias: "Gracias por acompañarnos",
      dias: "DÍAS",
      horas: "HORAS",
      minutos: "MINUTOS",
      segundos: "SEGUNDOS",
      calendario: "Agregar al calendario",
      googleCalendar: "Google Calendar",
      calendarioTitulo: "Misa en memoria de Juana Neyi Trigueros Balcazar",
      verUbicacion: "Ver ubicación",
    },
    // Location section (SPEC §5.5).
    ubicacion: {
      etiqueta: "DÓNDE NOS REUNIREMOS",
      mapaTitulo: "Mapa: lugar de la misa",
      comoLlegar: "Cómo llegar",
      waze: "Abrir en Waze",
      copiar: "Copiar dirección",
      copiada: "Dirección copiada",
      copiaError: "No se pudo copiar la dirección",
    },
    // Lunch section (SPEC §5.6).
    almuerzo: {
      comoLlegar: "Cómo llegar",
      confirmar: "Confirmar asistencia",
    },
    // Gallery section (SPEC §5.7).
    galeria: {
      titulo: "MOMENTOS",
      subtitulo: "Su sonrisa, su familia, su vocación.",
      cerrar: "Cerrar",
      anterior: "Foto anterior",
      siguiente: "Foto siguiente",
      dialogo: "Foto ampliada",
    },
    // Tribute video section (SPEC §5.8).
    video: {
      titulo: "UN RECUERDO",
    },
    // Closing section (SPEC §5.10).
    cierre: {
      frase: "Su recuerdo permanece en nuestros corazones.",
    },
  },
  // SPEC §5.7 order; paths without leading "/" or extension; family reviews the alts (F10).
  galeria: [
    {
      src: "assets/fotos/06-celebracion-grupo",
      alt: "Juana Neyi junto a familiares y amigos, reunidos frente a un local decorado con globos azules",
      w: 960,
      h: 960,
    },
    {
      src: "assets/fotos/07-baile",
      alt: "Juana Neyi sonriendo mientras baila tomada de la mano con un señor mayor de terno azul",
      w: 900,
      h: 900,
    },
    {
      src: "assets/fotos/08-fiesta-familiar",
      alt: "Juana Neyi brindando en una fiesta familiar junto a un señor mayor con sombrero de papel",
      w: 774,
      h: 774,
    },
    {
      src: "assets/fotos/09-terraza",
      alt: "Juana Neyi sonriendo con lentes de sol y blusa a rayas, sentada en una terraza",
      w: 581,
      h: 581,
    },
    {
      src: "assets/fotos/04-enfermera-colegas",
      alt: "Juana Neyi con uniforme turquesa, abrazada a dos colegas enfermeras frente al hospital",
      w: 1200,
      h: 1200,
    },
    {
      src: "assets/fotos/05-hospital-abrazo",
      alt: "Juana Neyi abrazando con cariño a una colega en la oficina de enfermería",
      w: 960,
      h: 960,
    },
    {
      src: "assets/fotos/02-graduacion-diploma",
      alt: "Juana Neyi el día de su graduación de enfermería, con uniforme blanco, cofia y un ramillete de flores en el pecho",
      w: 660,
      h: 660,
    },
    {
      src: "assets/fotos/03-graduacion-cofia",
      alt: "Juana Neyi con cofia y uniforme blanco, sentada junto a sus compañeras en la ceremonia de graduación",
      w: 840,
      h: 840,
    },
  ],
  musica: {
    mp3: "assets/audio/piano-homenaje.mp3",
    ogg: "assets/audio/piano-homenaje.ogg",
    volumen: 0.55,
  },
  video: {
    mp4: "assets/video/video-homenaje.mp4",
    poster: "assets/video/video-homenaje-poster.jpg",
  },
};

// No credentials live in this file or in the repository. rsvp.endpoint is public by design (SPEC §5.9.1).
