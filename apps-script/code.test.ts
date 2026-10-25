import { it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

// Code.gs is pasted into the Google Sheet by hand; SPEC §5.9.1 is its source of truth.
it("Code.gs matches the SPEC §5.9.1 block", () => {
  const spec = readFileSync(new URL("../SPEC.md", import.meta.url), "utf8");
  const block = spec.match(/\*\*`apps-script\/Code\.gs`:\*\*\n```js\n([\s\S]*?)```/)?.[1];
  assert.ok(block, "Code.gs block not found in SPEC.md");
  assert.equal(readFileSync(new URL("./Code.gs", import.meta.url), "utf8"), block);
});
