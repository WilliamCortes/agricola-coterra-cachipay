import test from "node:test";
import assert from "node:assert/strict";
import { ScryptPasswordHasher } from "./ScryptPasswordHasher";

test("ScryptPasswordHasher hashes and verifies", async () => {
  const hasher = new ScryptPasswordHasher();
  const hash = await hasher.hash("CorrectHorseBatteryStaple!");
  assert.ok(hash.startsWith("scrypt$"));
  assert.equal(await hasher.verify("CorrectHorseBatteryStaple!", hash), true);
  assert.equal(await hasher.verify("wrong", hash), false);
});

