import type { content } from "./content.ts";

// Minimal Vite-compatible tag descriptor. Keep this file free of Node or Vite imports
// so `node --test` can load it without a build step.
type HtmlTagDescriptor = {
  tag: string;
  attrs?: Record<string, string>;
  children?: string;
  injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
};

export function metaTags(c: typeof content): HtmlTagDescriptor[] {
  const { sitio } = c;
  const imageUrl = sitio.url + "assets/social/og-image.jpg";

  return [
    { tag: "title", children: sitio.titulo, injectTo: "head" },
    { tag: "meta", attrs: { name: "description", content: sitio.descripcion }, injectTo: "head" },
    { tag: "meta", attrs: { property: "og:title", content: sitio.titulo }, injectTo: "head" },
    { tag: "meta", attrs: { property: "og:description", content: sitio.descripcion }, injectTo: "head" },
    { tag: "meta", attrs: { property: "og:type", content: "website" }, injectTo: "head" },
    { tag: "meta", attrs: { property: "og:url", content: sitio.url }, injectTo: "head" },
    { tag: "meta", attrs: { property: "og:image", content: imageUrl }, injectTo: "head" },
    { tag: "meta", attrs: { property: "og:image:width", content: "1200" }, injectTo: "head" },
    { tag: "meta", attrs: { property: "og:image:height", content: "630" }, injectTo: "head" },
  ];
}
