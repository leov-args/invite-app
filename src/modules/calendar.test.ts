import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { ics, googleCalendarUrl, type Evento } from "./calendar.ts";

const FECHA_ISO = "2027-01-16T11:00:00-05:00";
const INICIO = Date.parse(FECHA_ISO);

function makeEvento(overrides: Partial<Evento> = {}): Evento {
  return {
    inicio: INICIO,
    duracionMin: 60,
    titulo: "Misa en memoria de Juana Neyi Trigueros Balcazar",
    lugar: "Iglesia Matriz de Santa Cruz de Flores, Santa Cruz de Flores, Cañete, Lima",
    ...overrides,
  };
}

describe("ics", () => {
  it("renders DTSTART and DTEND as UTC timestamps for the real fechaISO", () => {
    const result = ics(makeEvento());

    assert.match(result, /DTSTART:20270116T160000Z/);
    assert.match(result, /DTEND:20270116T170000Z/);
  });

  it("does not include VTIMEZONE or TZID", () => {
    const result = ics(makeEvento());

    assert.doesNotMatch(result, /VTIMEZONE/i);
    assert.doesNotMatch(result, /TZID/i);
  });

  it("terminates every line with CRLF", () => {
    const result = ics(makeEvento());

    assert.ok(result.endsWith("\r\n"));

    const lines = result.split("\r\n");
    const last = lines.pop();
    assert.strictEqual(last, "");

    for (const line of lines) {
      assert.ok(!line.includes("\r"));
      assert.ok(!line.includes("\n"));
    }
  });

  it("escapes commas in LOCATION", () => {
    const result = ics(makeEvento());
    const unfolded = result.replace(/\r\n /g, "");

    assert.match(
      unfolded,
      /LOCATION:Iglesia Matriz de Santa Cruz de Flores\\, Santa Cruz de Flores\\, Cañete\\, Lima/
    );
  });

  it("escapes backslashes, semicolons and newlines in text values", () => {
    const result = ics(makeEvento({
      titulo: "Line one\nLine two; with \\ backslash",
      lugar: "A;B\\C,D",
    }));

    assert.match(result, /SUMMARY:Line one\\nLine two\\; with \\\\ backslash/);
    assert.match(result, /LOCATION:A\\;B\\\\C\\,D/);
  });

  it("folds every physical line to at most 75 UTF-8 octets", () => {
    const result = ics(makeEvento());
    const physicalLines = result.split("\r\n");
    const last = physicalLines.pop();
    assert.strictEqual(last, "");

    const encoder = new TextEncoder();
    for (const line of physicalLines) {
      assert.ok(encoder.encode(line).length <= 75, `line too long: ${line}`);
    }
  });

  it("folds the real LOCATION line and can unfold it back exactly", () => {
    const result = ics(makeEvento());
    const unfolded = result.replace(/\r\n /g, "");
    const lines = unfolded.split("\r\n");
    const locationLine = lines.find((line) => line.startsWith("LOCATION:"));

    assert.strictEqual(
      locationLine,
      "LOCATION:Iglesia Matriz de Santa Cruz de Flores\\, Santa Cruz de Flores\\, Cañete\\, Lima"
    );
  });
});

describe("googleCalendarUrl", () => {
  it("includes action=TEMPLATE, the correct UTC date range, title and location", () => {
    const result = googleCalendarUrl(makeEvento());
    const url = new URL(result);

    assert.strictEqual(url.searchParams.get("action"), "TEMPLATE");
    assert.strictEqual(url.searchParams.get("dates"), "20270116T160000Z/20270116T170000Z");
    assert.strictEqual(url.searchParams.get("text"), "Misa en memoria de Juana Neyi Trigueros Balcazar");
    assert.strictEqual(
      url.searchParams.get("location"),
      "Iglesia Matriz de Santa Cruz de Flores, Santa Cruz de Flores, Cañete, Lima"
    );
  });
});
