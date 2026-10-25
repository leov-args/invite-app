const REVEAL_TEXT_SELECTORS = [
  ".hero__etiqueta",
  ".hero__nombre",
  ".hero__separador",
  ".vocacion__cruz",
  ".vocacion__titulo",
  ".vocacion__frase",
  ".mensaje__texto",
  ".mensaje__flores",
  ".misa__tarjeta",
  ".ubicacion__contenido",
  ".almuerzo__tarjeta",
];

const REVEAL_FOTO_SELECTORS = [
  ".hero__retrato",
  ".vocacion__par .vocacion__foto",
  ".vocacion__foto--ancha",
];

const ALL_REVEAL_SELECTORS = [...REVEAL_TEXT_SELECTORS, ...REVEAL_FOTO_SELECTORS];
const FOTO_SELECTOR = REVEAL_FOTO_SELECTORS.join(",");

/**
 * Adds scroll-triggered reveal animations to hero and vocation content.
 * Without JS, elements remain visible because the `.reveal` class is never applied.
 */
export function initReveal(): void {
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>(ALL_REVEAL_SELECTORS.join(",")),
  );

  if (targets.length === 0) return;

  targets.forEach((el) => {
    el.classList.add("reveal");
    if (el.matches(FOTO_SELECTOR)) {
      el.classList.add("reveal--foto");
    }
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            const target = entry.target as HTMLElement;
            target.style.setProperty("--reveal-i", String(index));
            target.classList.add("is-visible");
            observer.unobserve(target);
          });
      },
      { rootMargin: "0px 0px 20% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-visible"));
  }
}
