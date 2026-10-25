import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { content } from "./content.ts";

describe("content.ts", () => {
  it("mass date parses to 2027-01-16T16:00:00.000Z UTC", () => {
    assert.equal(new Date(content.misa.fechaISO).toISOString(), "2027-01-16T16:00:00.000Z");
  });

  it("asset paths start with 'assets/' and never with '/'", () => {
    const paths = [content.persona.retrato, content.musica.mp3, content.musica.ogg];
    for (const path of paths) {
      assert.ok(path.startsWith("assets/"), `expected ${path} to start with assets/`);
      assert.ok(!path.startsWith("/"), `expected ${path} not to start with /`);
    }
  });

  it("site url is absolute https and ends with '/'", () => {
    assert.ok(content.sitio.url.startsWith("https://"), "site url must use https");
    assert.ok(content.sitio.url.endsWith("/"), "site url must end with /");
  });

  it("site description includes mass date and time texts", () => {
    assert.ok(content.sitio.descripcion.includes(content.misa.fechaTexto));
    assert.ok(content.sitio.descripcion.includes(content.misa.horaTexto));
  });

  it("vocacion photo paths start with 'assets/' and never with '/', and every alt is non-empty", () => {
    const photos = content.textos.vocacion.fotos;
    assert.ok(photos.length > 0, "vocacion photos must not be empty");
    for (const photo of photos) {
      assert.ok(photo.src.startsWith("assets/"), `expected ${photo.src} to start with assets/`);
      assert.ok(!photo.src.startsWith("/"), `expected ${photo.src} not to start with /`);
      assert.ok(photo.alt.length > 0, "expected every vocacion photo alt to be non-empty");
    }
  });
});
