import { asset } from "../asset.ts";
import { content } from "../content.ts";

export function initHero(): void {
  const label = document.querySelector<HTMLElement>(".hero__etiqueta");
  const nameLines = document.querySelectorAll<HTMLElement>(".hero__nombre-linea");
  const source = document.querySelector<HTMLSourceElement>(".hero__retrato picture source");
  const img = document.querySelector<HTMLImageElement>(".hero__retrato picture img");

  if (!label || nameLines.length < 2 || !source || !img) return;

  label.textContent = content.textos.hero.etiqueta;
  nameLines[0].textContent = content.persona.nombre;
  nameLines[1].textContent = content.persona.apellidos;

  source.srcset = asset(`${content.persona.retrato}.webp`);
  img.src = asset(`${content.persona.retrato}.jpg`);
  img.alt = content.textos.hero.retratoAlt;

  const next = document.querySelector<HTMLButtonElement>(".hero__scroll");
  if (next) {
    next.setAttribute("aria-label", content.textos.hero.siguiente);
    // Smooth through the CSS scroll-behavior, which reduced motion turns off.
    next.addEventListener("click", () => next.closest("section")?.nextElementSibling?.scrollIntoView());
  }
}
