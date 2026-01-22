import crypto from "crypto";

export class TokenGenerator {
  generate(): string {
    return crypto.randomBytes(32).toString("base64url");
  }

  hash(token: string): string {
    return crypto.createHash("sha256").update(token).digest("base64url");
  }
}

