import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { validarRsvp, leerConfirmacion, guardarConfirmacion } from "./rsvp.ts";

function createFakeStorage(initial: Record<string, string> = {}): Pick<Storage, "getItem" | "setItem"> {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = value; },
  };
}

function createThrowingStorage(throwOn: "get" | "set" | "both" = "both"): Pick<Storage, "getItem" | "setItem"> {
  return {
    getItem: throwOn === "get" || throwOn === "both"
      ? () => { throw new Error("storage read error"); }
      : () => null,
    setItem: throwOn === "set" || throwOn === "both"
      ? () => { throw new Error("storage write error"); }
      : () => {},
  };
}

describe("guardarConfirmacion", () => {
  it("stores a confirmation as JSON", () => {
    const storage = createFakeStorage();
    const datos = { nombre: "Juana Pérez", personas: 3, fecha: "2026-10-26T12:00:00.000Z" };
    guardarConfirmacion(storage, datos);
    assert.strictEqual(storage.getItem("invite-app:rsvp"), JSON.stringify(datos));
  });

  it("does not throw when setItem fails", () => {
    const storage = createThrowingStorage("set");
    assert.doesNotThrow(() => {
      guardarConfirmacion(storage, { nombre: "Juana Pérez", personas: 1, fecha: "2026-10-26T12:00:00.000Z" });
    });
  });
});

describe("leerConfirmacion", () => {
  it("returns null when the key is missing", () => {
    const storage = createFakeStorage();
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns the stored confirmation after a round trip", () => {
    const storage = createFakeStorage();
    const datos = { nombre: "Juana Pérez", personas: 3, fecha: "2026-10-26T12:00:00.000Z" };
    guardarConfirmacion(storage, datos);
    const result = leerConfirmacion(storage);
    assert.deepStrictEqual(result, datos);
  });

  it("returns null when getItem throws", () => {
    const storage = createThrowingStorage("get");
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null for corrupt JSON", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": "not-json" });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when the stored value is not an object", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": "\"hello\"" });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when nombre is missing", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ personas: 2, fecha: "2026-10-26T12:00:00.000Z" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when nombre is not a string", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: 123, personas: 2, fecha: "2026-10-26T12:00:00.000Z" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when nombre is an empty string", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "", personas: 2, fecha: "2026-10-26T12:00:00.000Z" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when nombre is only whitespace", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "   ", personas: 2, fecha: "2026-10-26T12:00:00.000Z" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when personas is missing", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "Juana Pérez", fecha: "2026-10-26T12:00:00.000Z" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when personas is not an integer", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "Juana Pérez", personas: 2.5, fecha: "2026-10-26T12:00:00.000Z" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when personas is 0", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "Juana Pérez", personas: 0, fecha: "2026-10-26T12:00:00.000Z" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when personas is greater than 10", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "Juana Pérez", personas: 11, fecha: "2026-10-26T12:00:00.000Z" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when fecha is missing", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "Juana Pérez", personas: 2 }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when fecha is not a string", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "Juana Pérez", personas: 2, fecha: 123 }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("returns null when fecha is an empty string", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "Juana Pérez", personas: 2, fecha: "" }) });
    assert.strictEqual(leerConfirmacion(storage), null);
  });

  it("trims whitespace from nombre when reading", () => {
    const storage = createFakeStorage({ "invite-app:rsvp": JSON.stringify({ nombre: "  Juana Pérez  ", personas: 2, fecha: "2026-10-26T12:00:00.000Z" }) });
    const result = leerConfirmacion(storage);
    assert.strictEqual(result?.nombre, "Juana Pérez");
  });
});

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
