/**
 * True when the browser supports view transitions and the user allows motion.
 */
export function puedeTransicionar(): boolean {
  return (
    typeof document.startViewTransition === "function" &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Runs `update` as a shared-element morph: `desde` (old state) becomes `hacia` (new state).
 * The name moves inside the update so both elements never share it at the same time.
 * `<html data-morph="nombre">` lets CSS tune each morph. Without support, `update` runs directly.
 */
export function morph(nombre: string, desde: HTMLElement, hacia: HTMLElement, update: () => void): void {
  if (!puedeTransicionar()) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.morph = nombre;
  desde.style.viewTransitionName = nombre;

  const transition = document.startViewTransition(() => {
    desde.style.viewTransitionName = "";
    hacia.style.viewTransitionName = nombre;
    update();
  });

  // An aborted transition (e.g. the phone rotates mid-morph) rejects `ready`; the update still runs.
  transition.ready.catch(() => undefined);
  void transition.finished.finally(() => {
    hacia.style.viewTransitionName = "";
    delete root.dataset.morph;
  });
}
