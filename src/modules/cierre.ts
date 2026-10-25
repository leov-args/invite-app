import { content } from "../content.ts";

export function initCierre(): void {
  const phrase = document.querySelector<HTMLElement>(".cierre__frase");
  const signature = document.querySelector<HTMLElement>(".cierre__firma");

  if (!phrase) return;

  phrase.textContent = content.textos.cierre.frase;

  const familySignature = content.contacto.firmaFamilia.trim();
  if (familySignature && signature) {
    signature.textContent = familySignature;
    signature.removeAttribute("hidden");
  }
}
