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
});
