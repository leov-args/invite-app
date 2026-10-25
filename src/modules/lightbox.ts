import { asset } from "../asset.ts";
import { content } from "../content.ts";

/**
 * Returns the next or previous index, wrapping around at the ends.
 */
export function paso(index: number, delta: number, total: number): number {
  if (total <= 0) return index;
  return (index + delta + total) % total;
}

/**
 * Interprets a pointer swipe as a navigation direction.
 * - Returns 0 unless the horizontal distance is greater than 50 px
 *   and larger than the vertical distance.
 * - A leftward drag (dx < 0) means "next" -> 1.
 * - A rightward drag (dx > 0) means "previous" -> -1.
 */
export function direccionSwipe(dx: number, dy: number): -1 | 0 | 1 {
  const absDx = Math.abs(dx);
  if (absDx <= 50) return 0;
  if (Math.abs(dy) >= absDx) return 0;
  return dx < 0 ? 1 : -1;
}

type LightboxState = {
  dialog: HTMLDialogElement;
  closeButton: HTMLButtonElement;
  prevButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
  source: HTMLSourceElement;
  img: HTMLImageElement;
  currentIndex: number;
};

let state: LightboxState | null = null;

function render(index: number): void {
  if (!state) return;

  const photo = content.galeria[index];
  if (!photo) return;

  state.currentIndex = index;
  state.source.srcset = asset(`${photo.src}.webp`);
  state.img.src = asset(`${photo.src}.jpg`);
  state.img.alt = photo.alt;
  state.img.width = photo.w;
  state.img.height = photo.h;
}

function move(delta: number): void {
  if (!state || content.galeria.length <= 1) return;
  render(paso(state.currentIndex, delta, content.galeria.length));
}

export function abrirLightbox(index: number): void {
  if (!state || content.galeria.length === 0) return;

  render(index);
  state.dialog.showModal();
  state.closeButton.focus();
}

export function initLightbox(): void {
  const dialog = document.querySelector<HTMLDialogElement>(".lightbox");
  const closeButton = document.querySelector<HTMLButtonElement>(".lightbox__cerrar");
  const prevButton = document.querySelector<HTMLButtonElement>(".lightbox__anterior");
  const nextButton = document.querySelector<HTMLButtonElement>(".lightbox__siguiente");
  const source = document.querySelector<HTMLSourceElement>(".lightbox__foto > source");
  const img = document.querySelector<HTMLImageElement>(".lightbox__foto > img");

  if (!dialog || !closeButton || !prevButton || !nextButton || !source || !img) return;

  const texts = content.textos.galeria;
  dialog.setAttribute("aria-label", texts.dialogo);
  closeButton.setAttribute("aria-label", texts.cerrar);
  prevButton.setAttribute("aria-label", texts.anterior);
  nextButton.setAttribute("aria-label", texts.siguiente);

  const hasManyPhotos = content.galeria.length > 1;
  prevButton.hidden = !hasManyPhotos;
  nextButton.hidden = !hasManyPhotos;

  state = {
    dialog,
    closeButton,
    prevButton,
    nextButton,
    source,
    img,
    currentIndex: 0,
  };

  closeButton.addEventListener("click", () => dialog.close());
  prevButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));

  dialog.addEventListener("keydown", (event) => {
    if (!hasManyPhotos) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });

  dialog.addEventListener("close", () => {
    const buttons = document.querySelectorAll<HTMLButtonElement>(".galeria__boton");
    buttons[state?.currentIndex ?? 0]?.focus();
  });

  let startX = 0;
  let startY = 0;

  img.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
    startY = event.clientY;
  });

  img.addEventListener("pointerup", (event) => {
    if (!hasManyPhotos) return;
    const direction = direccionSwipe(event.clientX - startX, event.clientY - startY);
    if (direction !== 0) move(direction);
  });
}
