import "./styles/tokens.css";
import "./styles/fonts.css";
import "./styles/base.css";
import { content } from "./content.ts";

const sample =
  "Juana Neyi Trigueros Balcazar — Con cariño y gratitud, ¿recordamos? ñ á é í ó ú";

const colorTokens: string[] = [
  "--c-blanco",
  "--c-noche",
  "--c-marfil",
  "--c-bruma",
  "--c-agua-claro",
  "--c-turquesa-suave",
  "--c-turquesa",
  "--c-turquesa-profundo",
  "--c-turquesa-tinta",
  "--c-turquesa-noche",
  "--c-salvia",
  "--c-plata",
  "--c-plata-claro",
  "--c-luz-calida",
  "--c-luz-calida-suave",
  "--c-texto",
  "--c-texto-2",
  "--c-texto-noche",
];

const faces: Array<{ family: string; weight: number; style?: string }> = [
  { family: "Cormorant Garamond", weight: 400 },
  { family: "Cormorant Garamond", weight: 500 },
  { family: "Cormorant Garamond", weight: 400, style: "italic" },
  { family: "Cormorant Garamond", weight: 300, style: "italic" },
  { family: "Montserrat", weight: 300 },
  { family: "Montserrat", weight: 400 },
  { family: "Montserrat", weight: 500 },
];

function renderSpecimen(face: { family: string; weight: number; style?: string }): HTMLElement {
  const styleLabel = face.style ? ` ${face.style}` : "";
  const label = `${face.family} ${face.weight}${styleLabel}`;

  const wrapper = document.createElement("div");
  wrapper.style.marginBlockEnd = "16px";

  const labelEl = document.createElement("p");
  labelEl.textContent = label;
  labelEl.style.margin = "0 0 4px";
  labelEl.style.fontSize = "12px";
  labelEl.style.textTransform = "uppercase";
  labelEl.style.letterSpacing = "0.08em";
  labelEl.style.color = "var(--c-texto-2)";

  const sampleEl = document.createElement("p");
  sampleEl.textContent = sample;
  sampleEl.style.margin = "0";
  sampleEl.style.fontFamily = face.family;
  sampleEl.style.fontWeight = String(face.weight);
  sampleEl.style.fontSize = "18px";
  if (face.style) sampleEl.style.fontStyle = face.style;

  wrapper.append(labelEl, sampleEl);
  return wrapper;
}

function renderSwatches(): HTMLElement {
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(140px, 1fr))";
  grid.style.gap = "12px";

  for (const name of colorTokens) {
    const swatch = document.createElement("div");
    swatch.style.display = "flex";
    swatch.style.flexDirection = "column";
    swatch.style.gap = "4px";

    const chip = document.createElement("div");
    chip.style.width = "100%";
    chip.style.aspectRatio = "1 / 1";
    chip.style.borderRadius = "12px";
    chip.style.backgroundColor = `var(${name})`;
    chip.style.boxShadow = "var(--sombra-suave)";

    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const text = document.createElement("p");
    text.style.margin = "0";
    text.style.fontSize = "11px";
    text.style.lineHeight = "1.4";
    text.style.color = "var(--c-texto-2)";
    text.style.whiteSpace = "pre-line";
    text.textContent = `${name}\n${value}`;

    swatch.append(chip, text);
    grid.append(swatch);
  }

  return grid;
}

function renderTestPage(): void {
  const main = document.createElement("main");

  const title = document.createElement("h1");
  title.textContent = content.persona.nombre + " " + content.persona.apellidos;
  title.style.fontFamily = "var(--f-serif)";
  title.style.fontWeight = "500";
  title.style.fontSize = "42px";
  title.style.lineHeight = "1.1";
  title.style.color = "var(--c-texto)";
  title.style.marginBlockEnd = "32px";

  const sectionTitle = document.createElement("h2");
  sectionTitle.textContent = "Type specimens";
  sectionTitle.style.fontFamily = "var(--f-sans)";
  sectionTitle.style.fontWeight = "500";
  sectionTitle.style.fontSize = "14px";
  sectionTitle.style.textTransform = "uppercase";
  sectionTitle.style.letterSpacing = "0.28em";
  sectionTitle.style.color = "var(--c-turquesa-profundo)";
  sectionTitle.style.marginBlockEnd = "16px";

  const specimens = document.createElement("section");
  specimens.style.marginBlockEnd = "48px";
  for (const face of faces) {
    specimens.append(renderSpecimen(face));
  }

  const swatchTitle = document.createElement("h2");
  swatchTitle.textContent = "Palette";
  swatchTitle.style.fontFamily = "var(--f-sans)";
  swatchTitle.style.fontWeight = "500";
  swatchTitle.style.fontSize = "14px";
  swatchTitle.style.textTransform = "uppercase";
  swatchTitle.style.letterSpacing = "0.28em";
  swatchTitle.style.color = "var(--c-turquesa-profundo)";
  swatchTitle.style.marginBlockEnd = "16px";

  const swatches = renderSwatches();

  // Temporary test page; replaced by the real sections from E2-1 on.
  main.append(title, sectionTitle, specimens, swatchTitle, swatches);
  document.body.append(main);
}

renderTestPage();
