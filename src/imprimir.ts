import "./styles/tokens.css";
import "./styles/fonts.css";
import "./styles/imprimir.css";
import { asset } from "./asset.ts";
import { content } from "./content.ts";

// Weekday from the mass date in Lima, so it never drifts from fechaTexto.
const dia = new Intl.DateTimeFormat("es-PE", { weekday: "long", timeZone: "America/Lima" }).format(
  new Date(content.misa.fechaISO),
);

const campos: Record<string, string> = {
  etiqueta: content.textos.hero.etiqueta,
  nombre: content.persona.nombre,
  apellidos: content.persona.apellidos,
  mensaje: content.textos.mensaje.texto,
  misaEtiqueta: content.textos.imprimir.misa,
  misaFecha: `${dia[0].toUpperCase()}${dia.slice(1)} ${content.misa.fechaTexto} · ${content.misa.horaTexto}`,
  misaLugar: content.misa.lugarNombre,
  misaDireccion: content.misa.lugarDireccion,
  almuerzoEtiqueta: content.despues.titulo,
  almuerzoTexto: content.despues.texto,
  almuerzoLugar: content.despues.lugarNombre,
};

for (const el of document.querySelectorAll<HTMLElement>("[data-campo]")) {
  el.textContent = campos[el.dataset.campo ?? ""] ?? "";
}

const almuerzo = document.querySelector<HTMLElement>("[data-bloque='almuerzo']");
if (almuerzo && content.despues.activo === false) {
  almuerzo.hidden = true;
  almuerzo.previousElementSibling?.setAttribute("hidden", "");
}

const retrato = document.querySelector<HTMLImageElement>(".hoja__retrato");
if (retrato) {
  // JPG at 830 px: ~360 dpi at the printed 58 mm.
  retrato.src = asset(`${content.persona.retrato}.jpg`);
  retrato.alt = content.textos.hero.retratoAlt;
}
