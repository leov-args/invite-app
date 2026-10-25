import { asset } from "../asset.ts";
import { content } from "../content.ts";
import { abrirLightbox } from "./lightbox.ts";

export function initGaleria(): void {
  const section = document.querySelector<HTMLElement>(".galeria");
  const title = document.querySelector<HTMLElement>(".galeria__titulo");
  const subtitle = document.querySelector<HTMLElement>(".galeria__subtitulo");
  const grid = document.querySelector<HTMLUListElement>(".galeria__grilla");

  if (!section || !title || !subtitle || !grid) return;

  title.textContent = content.textos.galeria.titulo;
  subtitle.textContent = content.textos.galeria.subtitulo;

  const photos = content.galeria;
  if (photos.length === 0) {
    section.hidden = true;
    return;
  }

  photos.forEach((photo, index) => {
    const item = document.createElement("li");
    item.className = "galeria__foto";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "galeria__boton";
    button.setAttribute("aria-label", photo.alt);

    const picture = document.createElement("picture");

    const source = document.createElement("source");
    source.type = "image/webp";
    source.srcset = asset(`${photo.src}.webp`);

    const img = document.createElement("img");
    img.src = asset(`${photo.src}.jpg`);
    img.alt = photo.alt;
    img.width = photo.w;
    img.height = photo.h;
    img.loading = "lazy";
    img.decoding = "async";

    picture.appendChild(source);
    picture.appendChild(img);
    button.appendChild(picture);
    item.appendChild(button);
    grid.appendChild(item);

    button.addEventListener("click", () => abrirLightbox(index));
  });
}
