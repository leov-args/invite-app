import { content } from "../content.ts";
import { playMusic } from "./music.ts";
import { morph, puedeTransicionar } from "./transicion.ts";
import { iniciarPresentacion } from "./presentacion.ts";

const STORAGE_KEY = "apertura-vista";

function getMarfilColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--c-marfil").trim();
}

function setThemeColor(color: string): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
}

export function initOpening(): void {
  const overlay = document.querySelector<HTMLElement>(".apertura");
  const phrase = document.querySelector<HTMLElement>(".apertura__frase");
  const button = document.querySelector<HTMLButtonElement>(".apertura__boton");
  const buttonText = button?.querySelector<HTMLSpanElement>("span");
  const main = document.querySelector<HTMLElement>("main#contenido");
  const halo = document.querySelector<HTMLElement>(".apertura__halo");
  const portrait = document.querySelector<HTMLElement>(".hero__retrato");

  if (!overlay || !phrase || !button || !buttonText || !main) return;

  if (document.documentElement.classList.contains("abierta")) {
    overlay.remove();
    main.removeAttribute("inert");
    setThemeColor(getMarfilColor());
    return;
  }

  phrase.textContent = content.textos.apertura.frase;
  buttonText.textContent = content.textos.apertura.boton;

  let opening = false;

  function finishOpen(): void {
    overlay!.remove();
    main!.removeAttribute("inert");
    main!.focus({ preventScroll: true });
    setThemeColor(getMarfilColor());
    iniciarPresentacion();
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage may be unavailable in private browsing; the visual flow still works.
    }
  }

  button.addEventListener("click", () => {
    if (opening) return;
    opening = true;
    playMusic();

    // The opening light condenses into the portrait; the fade below is the fallback.
    if (halo && portrait && puedeTransicionar()) {
      morph("retrato", halo, portrait, finishOpen);
      return;
    }

    overlay.classList.add("apertura--abriendo");

    const animations = overlay.getAnimations();
    void Promise.all(animations.map((animation) => animation.finished))
      .catch(() => undefined)
      .then(finishOpen);
  });
}
