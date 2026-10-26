// Tuning knobs: slow enough to read along, after the hero entrance has settled.
const VELOCIDAD = 40; // px per second
const ESPERA = 4000; // ms after the opening

// Any of these from the guest stops the presentation for good (WCAG 2.2.2).
const INTERRUPCIONES = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

/**
 * Scrolls the invitation slowly by itself after the opening, like credits.
 * Skipped under reduced motion.
 */
export function iniciarPresentacion(): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let y = 0;
  let last = 0;
  let frame = 0;

  function parar(): void {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    INTERRUPCIONES.forEach((type) => removeEventListener(type, parar));
  }

  function paso(time: number): void {
    // Clamped so a background tab or a slow frame never jumps the page.
    const dt = last ? Math.min(time - last, 100) : 0;
    last = time;
    // Fractions accumulate here; the browser rounds each scroll position.
    y += (VELOCIDAD * dt) / 1000;

    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: Math.min(y, max), behavior: "instant" });
    if (y >= max) parar();
    else frame = requestAnimationFrame(paso);
  }

  const timer = setTimeout(() => {
    y = scrollY;
    frame = requestAnimationFrame(paso);
  }, ESPERA);
  INTERRUPCIONES.forEach((type) => addEventListener(type, parar, { passive: true }));
}
