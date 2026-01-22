import test from "node:test";
import assert from "node:assert/strict";
import { JoseTokenService } from "./JoseTokenService";

test("JoseTokenService signs and verifies access token", async () => {
  const tokenService = new JoseTokenService("test-secret");
  const token = await tokenService.signAccessToken({ adminUserId: 123, role: "admin" as any }, 60);
  const payload = await tokenService.verifyAccessToken(token);
  assert.equal(payload.adminUserId, 123);
  assert.equal(payload.role, "admin");
});

