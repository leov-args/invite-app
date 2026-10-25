import { asset } from "../asset.ts";
import { content } from "../content.ts";

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

  photos.forEach((photo) => {
    const item = document.createElement("li");
    item.className = "galeria__foto";

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
    item.appendChild(picture);
    grid.appendChild(item);
  });
}
