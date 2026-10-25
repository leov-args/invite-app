import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mapEmbedUrl, type Mapa } from "./location.ts";

function makeMapa(overrides: Partial<Mapa> = {}): Mapa {
  return {
    lat: -12.619852,
    lng: -76.6417532,
    zoom: 16,
    placeQuery: "Iglesia Matriz de Santa Cruz de Flores, Cañete, Perú",
    embedUrl: "",
    ...overrides,
  };
}

describe("mapEmbedUrl", () => {
  it("returns embedUrl as-is when it is non-empty", () => {
    const url = "https://www.google.com/maps/embed?pb=custom";
    const result = mapEmbedUrl(makeMapa({ embedUrl: url }));

    assert.strictEqual(result, url);
  });

  it("trims surrounding spaces from embedUrl", () => {
    const url = "https://www.google.com/maps/embed?pb=custom";
    const result = mapEmbedUrl(makeMapa({ embedUrl: `  ${url}  \t` }));

    assert.strictEqual(result, url);
  });

  it("returns null when placeQuery is whitespace-only and lat/lng are null", () => {
    const result = mapEmbedUrl(
      makeMapa({ lat: null, lng: null, placeQuery: "   \n  " }),
    );

    assert.strictEqual(result, null);
  });

  it("builds a lat/lng embed URL for zero coordinates", () => {
    const result = mapEmbedUrl(makeMapa({ lat: 0, lng: 0 }));

    assert.strictEqual(
      result,
      "https://maps.google.com/maps?q=0,0&z=16&hl=es&output=embed",
    );
  });

  it("uses the configured zoom in the embed URL", () => {
    const result = mapEmbedUrl(makeMapa({ zoom: 12 }));

    assert.match(result as string, /z=12&/);
  });

  it("builds a lat/lng embed URL when both coordinates are numbers", () => {
    const result = mapEmbedUrl(makeMapa());

    assert.strictEqual(
      result,
      "https://maps.google.com/maps?q=-12.619852,-76.6417532&z=16&hl=es&output=embed",
    );
  });

  it("prefers lat/lng over placeQuery", () => {
    const result = mapEmbedUrl(makeMapa({ placeQuery: "Other place" }));

    assert.match(result as string, /q=-12\.619852,-76\.6417532/);
    assert.doesNotMatch(result as string, /Other/);
  });

  it("falls back to an encoded placeQuery when lat is null", () => {
    const result = mapEmbedUrl(makeMapa({ lat: null }));

    assert.strictEqual(
      result,
      "https://maps.google.com/maps?q=Iglesia%20Matriz%20de%20Santa%20Cruz%20de%20Flores%2C%20Ca%C3%B1ete%2C%20Per%C3%BA&z=16&hl=es&output=embed",
    );
  });

  it("falls back to an encoded placeQuery when lng is null", () => {
    const result = mapEmbedUrl(makeMapa({ lng: null }));

    assert.strictEqual(
      result,
      "https://maps.google.com/maps?q=Iglesia%20Matriz%20de%20Santa%20Cruz%20de%20Flores%2C%20Ca%C3%B1ete%2C%20Per%C3%BA&z=16&hl=es&output=embed",
    );
  });

  it("encodes spaces, commas and accented characters in placeQuery", () => {
    const result = mapEmbedUrl(
      makeMapa({
        lat: null,
        lng: null,
        placeQuery: "Calle Lima, Cañete, Perú",
      }),
    );

    assert.strictEqual(
      result,
      "https://maps.google.com/maps?q=Calle%20Lima%2C%20Ca%C3%B1ete%2C%20Per%C3%BA&z=16&hl=es&output=embed",
    );
  });

  it("ignores whitespace-only embedUrl and falls back to lat/lng", () => {
    const result = mapEmbedUrl(makeMapa({ embedUrl: "   \t\n  " }));

    assert.strictEqual(
      result,
      "https://maps.google.com/maps?q=-12.619852,-76.6417532&z=16&hl=es&output=embed",
    );
  });

  it("returns null when no source is available", () => {
    const result = mapEmbedUrl(
      makeMapa({ lat: null, lng: null, placeQuery: "" }),
    );

    assert.strictEqual(result, null);
  });
});
