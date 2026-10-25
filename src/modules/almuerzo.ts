import { content } from "../content.ts";
import { abrirRsvp } from "./rsvp.ts";

export function initAlmuerzo(): void {
  const section = document.querySelector<HTMLElement>(".almuerzo");
  if (!section) return;

  if (content.despues.activo === false) {
    section.hidden = true;
    return;
  }

  const label = document.querySelector<HTMLElement>(".almuerzo__etiqueta");
  if (label) {
    label.textContent = content.despues.titulo;
  }

  const place = document.querySelector<HTMLElement>(".almuerzo__lugar");
  if (place) {
    place.textContent = content.despues.lugarNombre;
    if (content.despues.lugarNombre.trim() === "") {
      place.hidden = true;
    }
  }

  const text = document.querySelector<HTMLElement>(".almuerzo__texto");
  if (text) {
    text.textContent = content.despues.texto;
    if (content.despues.texto.trim() === "") {
      text.hidden = true;
    }
  }

  const rsvpButton = document.querySelector<HTMLButtonElement>(".almuerzo__confirmar");
  const hasRsvp = content.rsvp.endpoint.trim() !== "";
  if (rsvpButton) {
    const buttonText = rsvpButton.querySelector<HTMLElement>("span");
    if (buttonText) {
      buttonText.textContent = content.textos.almuerzo.confirmar;
    }
    rsvpButton.hidden = !hasRsvp;
    rsvpButton.addEventListener("click", () => abrirRsvp(rsvpButton));
  }

  const directionsButton = document.querySelector<HTMLAnchorElement>(".almuerzo__ruta");
  const mapsUrl = content.despues.mapsUrl.trim();
  const hasDirections = mapsUrl !== "";
  if (directionsButton) {
    directionsButton.hidden = !hasDirections;
    if (hasDirections) {
      directionsButton.href = mapsUrl;
      const buttonText = directionsButton.querySelector<HTMLElement>("span");
      if (buttonText) {
        buttonText.textContent = content.textos.almuerzo.comoLlegar;
      }
    }
  }

  const buttonRow = document.querySelector<HTMLElement>(".almuerzo__botones");
  if (buttonRow) {
    buttonRow.hidden = !hasRsvp && !hasDirections;
  }
}
