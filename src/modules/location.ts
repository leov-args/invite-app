import { content } from "../content.ts";

export type Mapa = {
  lat: number | null;
  lng: number | null;
  zoom: number;
  placeQuery: string;
  embedUrl: string;
};

/**
 * Resolves the iframe src for an embedded map.
 * Priority:
 * 1. Non-empty embedUrl (copied from Google Maps "Embed a map").
 * 2. Both lat and lng numbers.
 * 3. Non-empty placeQuery, URL-encoded.
 * 4. Nothing available → null.
 */
export function mapEmbedUrl(mapa: Mapa): string | null {
  if (mapa.embedUrl.trim() !== "") {
    return mapa.embedUrl.trim();
  }

  if (typeof mapa.lat === "number" && typeof mapa.lng === "number") {
    return `https://maps.google.com/maps?q=${mapa.lat},${mapa.lng}&z=${mapa.zoom}&hl=es&output=embed`;
  }

  const query = mapa.placeQuery.trim();
  if (query !== "") {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${mapa.zoom}&hl=es&output=embed`;
  }

  return null;
}

/**
 * Builds a Google Maps directions URL. Uses lat/lng when both are numbers;
 * otherwise falls back to an encoded placeQuery. Returns null when no usable
 * destination is available.
 */
export function directionsUrl(mapa: Mapa): string | null {
  if (typeof mapa.lat === "number" && typeof mapa.lng === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${mapa.lat},${mapa.lng}`;
  }

  const query = mapa.placeQuery.trim();
  if (query !== "") {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  }

  return null;
}

/**
 * Builds a Waze navigation URL. Only available when both lat and lng are
 * numbers; otherwise returns null.
 */
export function wazeUrl(mapa: Mapa): string | null {
  if (typeof mapa.lat === "number" && typeof mapa.lng === "number") {
    return `https://waze.com/ul?ll=${mapa.lat},${mapa.lng}&navigate=yes`;
  }

  return null;
}

/**
 * Joins the venue name and address into a single copyable line. Empty or
 * whitespace-only parts are ignored; non-empty parts are trimmed.
 */
export function addressText(name: string, address: string): string {
  const parts = [name, address].map((part) => part.trim()).filter(Boolean);
  return parts.join(", ");
}

/**
 * Fills the location section and the "Ver ubicación" button in the mass card.
 * Hides individual lines when their values are empty, and hides the whole
 * section plus the button when there is no name, address or map source.
 */
export function initLocation(): void {
  const section = document.querySelector<HTMLElement>(".ubicacion");
  const label = document.querySelector<HTMLElement>(".ubicacion__etiqueta");
  const name = document.querySelector<HTMLElement>(".ubicacion__lugar");
  const address = document.querySelector<HTMLElement>(".ubicacion__direccion");
  const map = document.querySelector<HTMLElement>(".ubicacion__mapa");
  const iframe = document.querySelector<HTMLIFrameElement>(".ubicacion__mapa iframe");
  const locationButton = document.querySelector<HTMLAnchorElement>(".misa__boton[href='#ubicacion']");
  const buttonRow = document.querySelector<HTMLElement>(".ubicacion__botones");
  const directionsButton = document.querySelector<HTMLAnchorElement>(".ubicacion__botones > .misa__boton:not(.misa__boton--contorno)");
  const wazeButton = document.querySelector<HTMLAnchorElement>(".ubicacion__botones > .misa__boton--contorno");
  const copyButton = document.querySelector<HTMLButtonElement>(".ubicacion__copiar");
  const copyNotice = document.querySelector<HTMLElement>(".ubicacion__aviso");

  const nameValue = content.misa.lugarNombre;
  const addressValue = content.misa.lugarDireccion;
  const embedUrl = mapEmbedUrl(content.mapa);
  const copyText = addressText(nameValue, addressValue);
  const directionsLink = directionsUrl(content.mapa);
  const wazeLink = wazeUrl(content.mapa);

  const hasName = nameValue.trim() !== "";
  const hasAddress = addressValue.trim() !== "";
  const hasMap = embedUrl !== null;
  const hasDirections = directionsLink !== null;
  const hasWaze = wazeLink !== null;
  const hasCopy = copyText !== "";

  if (!hasName && !hasAddress && !hasMap) {
    if (section) section.hidden = true;
    if (locationButton) locationButton.hidden = true;
    return;
  }

  if (label) {
    label.textContent = content.textos.ubicacion.etiqueta;
  }

  if (name) {
    name.textContent = nameValue;
    name.hidden = !hasName;
  }

  if (address) {
    address.textContent = addressValue;
    address.hidden = !hasAddress;
  }

  if (iframe) {
    iframe.title = content.textos.ubicacion.mapaTitulo;
    if (hasMap) {
      iframe.src = embedUrl;
    }
  }

  if (map) map.hidden = !hasMap;

  if (locationButton) {
    const buttonText = locationButton.querySelector<HTMLElement>("span");
    if (buttonText) {
      buttonText.textContent = content.textos.misa.verUbicacion;
    }
  }

  if (directionsButton) {
    directionsButton.hidden = !hasDirections;
    if (hasDirections) {
      directionsButton.href = directionsLink;
      const buttonText = directionsButton.querySelector<HTMLElement>("span");
      if (buttonText) {
        buttonText.textContent = content.textos.ubicacion.comoLlegar;
      }
    }
  }

  if (wazeButton) {
    wazeButton.hidden = !hasWaze;
    if (hasWaze) {
      wazeButton.href = wazeLink;
      const buttonText = wazeButton.querySelector<HTMLElement>("span");
      if (buttonText) {
        buttonText.textContent = content.textos.ubicacion.waze;
      }
    }
  }

  if (copyButton) {
    copyButton.hidden = !hasCopy;
    const buttonText = copyButton.querySelector<HTMLElement>("span");
    if (buttonText) {
      buttonText.textContent = content.textos.ubicacion.copiar;
    }

    let noticeTimer: ReturnType<typeof setTimeout> | null = null;

    copyButton.addEventListener("click", () => {
      const write = navigator.clipboard?.writeText(copyText);

      const showNotice = (message: string) => {
        if (!copyNotice) return;
        copyNotice.textContent = message;
        copyNotice.classList.add("ubicacion__aviso--visible");

        if (noticeTimer !== null) {
          clearTimeout(noticeTimer);
        }

        noticeTimer = setTimeout(() => {
          copyNotice.classList.remove("ubicacion__aviso--visible");
          noticeTimer = null;
        }, 2500);
      };

      if (!write) {
        showNotice(content.textos.ubicacion.copiaError);
        return;
      }

      write
        .then(() => showNotice(content.textos.ubicacion.copiada))
        .catch(() => showNotice(content.textos.ubicacion.copiaError));
    });
  }

  if (buttonRow) {
    buttonRow.hidden = !hasDirections && !hasWaze && !hasCopy;
  }
}
