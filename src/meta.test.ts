import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { content } from "./content.ts";
import { metaTags } from "./meta.ts";

describe("meta.ts", () => {
  const tags = metaTags(content);

  const titleTags = tags.filter((t) => t.tag === "title");
  const metaByProperty = (property: string) =>
    tags.find((t) => t.tag === "meta" && t.attrs?.property === property)?.attrs?.content;
  const metaByName = (name: string) =>
    tags.find((t) => t.tag === "meta" && t.attrs?.name === name)?.attrs?.content;

  it("has exactly one title tag", () => {
    assert.equal(titleTags.length, 1);
  });

  it("title equals content.sitio.titulo", () => {
    assert.equal(titleTags[0]?.children, content.sitio.titulo);
  });

  it("description equals content.sitio.descripcion", () => {
    assert.equal(metaByName("description"), content.sitio.descripcion);
  });

  it("og:title equals content.sitio.titulo", () => {
    assert.equal(metaByProperty("og:title"), content.sitio.titulo);
  });

  it("og:description equals content.sitio.descripcion", () => {
    assert.equal(metaByProperty("og:description"), content.sitio.descripcion);
  });

  it("og:url equals content.sitio.url", () => {
    assert.equal(metaByProperty("og:url"), content.sitio.url);
  });

  it("og:type is website", () => {
    assert.equal(metaByProperty("og:type"), "website");
  });

  it("og:image is absolute https and derived from content.sitio.url", () => {
    const image = metaByProperty("og:image");
    assert.ok(image?.startsWith("https://"), "og:image must use absolute https");
    assert.equal(image, content.sitio.url + "assets/social/og-image.jpg");
  });

  it("og:image dimensions are 1200x630", () => {
    assert.equal(metaByProperty("og:image:width"), "1200");
    assert.equal(metaByProperty("og:image:height"), "630");
  });
});
