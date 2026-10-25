import { asset } from "../asset.ts";
import { content } from "../content.ts";

export function initVocacion(): void {
  const title = document.querySelector<HTMLElement>(".vocacion__titulo");
  const phrase = document.querySelector<HTMLElement>(".vocacion__frase");
  const figures = document.querySelectorAll<HTMLElement>(".vocacion__foto");
  const fotos = content.textos.vocacion.fotos;

  if (!title || !phrase || figures.length === 0 || fotos.length === 0) return;

  title.textContent = content.textos.vocacion.titulo;
  phrase.textContent = content.textos.vocacion.frase;

  figures.forEach((figure, index) => {
    const foto = fotos[index];
    if (!foto) return;

    const source = figure.querySelector<HTMLSourceElement>("picture source");
    const img = figure.querySelector<HTMLImageElement>("picture img");
    const caption = figure.querySelector<HTMLElement>("figcaption");

    if (!source || !img) return;

    source.srcset = asset(`${foto.src}.webp`);
    img.src = asset(`${foto.src}.jpg`);
    img.alt = foto.alt;

    if (foto.pie && caption) {
      caption.textContent = foto.pie;
      caption.removeAttribute("hidden");
    }
  });
}
