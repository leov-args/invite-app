import { content } from "../content.ts";

export function initMensaje(): void {
  const paragraph = document.querySelector<HTMLElement>(".mensaje__texto");

  if (!paragraph) return;

  paragraph.textContent = content.textos.mensaje.texto;
}
