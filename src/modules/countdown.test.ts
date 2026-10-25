import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { estado } from "./countdown.ts";

const INICIO = Date.parse("2027-01-16T11:00:00-05:00");

function lima(iso: string): number {
  return Date.parse(`${iso}-05:00`);
}

describe("countdown estado", () => {
  it("returns cuenta with 1 second left at 10:59:59 Lima", () => {
    const result = estado(lima("2027-01-16T10:59:59"), INICIO);
    assert.deepEqual(result, { tipo: "cuenta", dias: 0, horas: 0, minutos: 0, segundos: 1 });
  });

  it("returns hoy at 11:00:00 Lima", () => {
    const result = estado(lima("2027-01-16T11:00:00"), INICIO);
    assert.deepEqual(result, { tipo: "hoy" });
  });

  it("returns hoy at 13:59:59 Lima", () => {
    const result = estado(lima("2027-01-16T13:59:59"), INICIO);
    assert.deepEqual(result, { tipo: "hoy" });
  });

  it("returns gracias at 14:00:00 Lima", () => {
    const result = estado(lima("2027-01-16T14:00:00"), INICIO);
    assert.deepEqual(result, { tipo: "gracias" });
  });

  it("returns cuenta for a far-before date", () => {
    const result = estado(lima("2027-01-14T09:30:15"), INICIO);
    assert.deepEqual(result, { tipo: "cuenta", dias: 2, horas: 1, minutos: 29, segundos: 45 });
  });

  it("returns cuenta the same morning", () => {
    const result = estado(lima("2027-01-16T08:00:00"), INICIO);
    assert.deepEqual(result, { tipo: "cuenta", dias: 0, horas: 3, minutos: 0, segundos: 0 });
  });
});
