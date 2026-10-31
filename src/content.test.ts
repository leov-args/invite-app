import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { content } from "./content.ts";

describe("content.ts", () => {
  it("mass date parses to 2027-01-16T16:45:00.000Z UTC", () => {
    assert.equal(new Date(content.misa.fechaISO).toISOString(), "2027-01-16T16:45:00.000Z");
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

  it("closing phrase equals the SPEC text exactly", () => {
    assert.equal(content.textos.cierre.frase, "Su recuerdo permanece en nuestros corazones.");
  });

  it("gallery has exactly the eight configured square photos in SPEC order", () => {
    const photos = content.galeria;
    const expectedSrcs = [
      "assets/fotos/06-celebracion-grupo",
      "assets/fotos/07-baile",
      "assets/fotos/08-fiesta-familiar",
      "assets/fotos/09-terraza",
      "assets/fotos/04-enfermera-colegas",
      "assets/fotos/05-hospital-abrazo",
      "assets/fotos/02-graduacion-diploma",
      "assets/fotos/03-graduacion-cofia",
    ];

    assert.equal(photos.length, 8, "gallery must contain exactly 8 photos");

    photos.forEach((photo, index) => {
      assert.equal(photo.src, expectedSrcs[index], `photo ${index} src must match SPEC order`);
      assert.ok(photo.src.startsWith("assets/"), `expected ${photo.src} to start with assets/`);
      assert.ok(!photo.src.startsWith("/"), `expected ${photo.src} not to start with /`);
      assert.ok(photo.alt.length > 0, `expected photo ${index} alt to be non-empty`);
      assert.equal(photo.w, photo.h, `photo ${index} must be square`);
      assert.ok(photo.w > 0, `photo ${index} dimensions must be positive`);
    });
  });
});
