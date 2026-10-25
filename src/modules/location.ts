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

  const nameValue = content.misa.lugarNombre;
  const addressValue = content.misa.lugarDireccion;
  const embedUrl = mapEmbedUrl(content.mapa);

  const hasName = nameValue.trim() !== "";
  const hasAddress = addressValue.trim() !== "";
  const hasMap = embedUrl !== null;

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
}
