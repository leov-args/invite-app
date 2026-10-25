import { content } from "../content.ts";

export function initMisa(): void {
  const label = document.querySelector<HTMLElement>(".misa__etiqueta");
  if (label) {
    label.textContent = content.textos.misa.etiqueta;
  }

  const date = document.querySelector<HTMLElement>(".misa__fecha");
  if (date) {
    date.textContent = content.misa.fechaTexto;
    if (content.misa.fechaTexto.trim() === "") {
      date.hidden = true;
    }
  }

  const lines = document.querySelectorAll<HTMLElement>(".misa__datos-item");
  const values = [
    content.misa.horaTexto,
    content.misa.lugarNombre,
    content.misa.lugarDireccion,
  ];

  lines.forEach((line, index) => {
    const value = values[index] ?? "";
    const text = line.querySelector<HTMLElement>(".misa__dato-texto");
    if (text) {
      text.textContent = value;
    }
    if (value.trim() === "") {
      line.hidden = true;
    }
  });
}
