import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { paso, direccionSwipe } from "./lightbox.ts";

describe("paso", () => {
  it("wraps forward from the last index to the first", () => {
    assert.strictEqual(paso(7, 1, 8), 0);
  });

  it("wraps backward from the first index to the last", () => {
    assert.strictEqual(paso(0, -1, 8), 7);
  });

  it("moves normally in the middle of the range", () => {
    assert.strictEqual(paso(3, 1, 8), 4);
    assert.strictEqual(paso(3, -1, 8), 2);
  });

  it("returns the same index when there is only one photo", () => {
    assert.strictEqual(paso(0, 1, 1), 0);
    assert.strictEqual(paso(0, -1, 1), 0);
  });
});

describe("direccionSwipe", () => {
  it("returns 1 (next) for a leftward drag greater than 50 px", () => {
    assert.strictEqual(direccionSwipe(-60, 10), 1);
  });

  it("returns -1 (previous) for a rightward drag greater than 50 px", () => {
    assert.strictEqual(direccionSwipe(60, 10), -1);
  });

  it("returns 0 for a drag of exactly 50 px", () => {
    assert.strictEqual(direccionSwipe(50, 0), 0);
    assert.strictEqual(direccionSwipe(-50, 0), 0);
  });

  it("returns 0 when the vertical movement dominates", () => {
    assert.strictEqual(direccionSwipe(60, 80), 0);
  });
});
