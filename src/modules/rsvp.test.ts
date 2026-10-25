import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { validarRsvp } from "./rsvp.ts";

describe("validarRsvp", () => {
  it("accepts valid data", () => {
    const result = validarRsvp({ nombre: "Juana Pérez", personas: 3, mensaje: "Nos vemos pronto" });
    assert.deepStrictEqual(result, {});
  });

  it("rejects a name shorter than 2 characters after trimming", () => {
    const result = validarRsvp({ nombre: "J", personas: 1, mensaje: "" });
    assert.strictEqual(result.nombre, "errorNombre");
    assert.strictEqual(result.personas, undefined);
    assert.strictEqual(result.mensaje, undefined);
  });

  it("rejects a name longer than 80 characters after trimming", () => {
    const result = validarRsvp({ nombre: "a".repeat(81), personas: 1, mensaje: "" });
    assert.strictEqual(result.nombre, "errorNombre");
  });

  it("rejects a name made only of spaces", () => {
    const result = validarRsvp({ nombre: "   ", personas: 1, mensaje: "" });
    assert.strictEqual(result.nombre, "errorNombre");
  });

  it("rejects 0 people", () => {
    const result = validarRsvp({ nombre: "Juana Pérez", personas: 0, mensaje: "" });
    assert.strictEqual(result.personas, "errorPersonas");
  });

  it("rejects more than 10 people", () => {
    const result = validarRsvp({ nombre: "Juana Pérez", personas: 11, mensaje: "" });
    assert.strictEqual(result.personas, "errorPersonas");
  });

  it("rejects a non-integer number of people", () => {
    const result = validarRsvp({ nombre: "Juana Pérez", personas: 2.5, mensaje: "" });
    assert.strictEqual(result.personas, "errorPersonas");
  });

  it("rejects NaN as the number of people", () => {
    const result = validarRsvp({ nombre: "Juana Pérez", personas: NaN, mensaje: "" });
    assert.strictEqual(result.personas, "errorPersonas");
  });

  it("rejects a message longer than 500 characters after trimming", () => {
    const result = validarRsvp({ nombre: "Juana Pérez", personas: 1, mensaje: "a".repeat(501) });
    assert.strictEqual(result.mensaje, "errorMensaje");
  });

  it("accepts a message of exactly 500 characters", () => {
    const result = validarRsvp({ nombre: "Juana Pérez", personas: 1, mensaje: "a".repeat(500) });
    assert.deepStrictEqual(result, {});
  });

  it("accepts a name of exactly 2 characters", () => {
    const result = validarRsvp({ nombre: "AB", personas: 1, mensaje: "" });
    assert.deepStrictEqual(result, {});
  });

  it("accepts a name of exactly 80 characters", () => {
    const result = validarRsvp({ nombre: "a".repeat(80), personas: 1, mensaje: "" });
    assert.deepStrictEqual(result, {});
  });
});
