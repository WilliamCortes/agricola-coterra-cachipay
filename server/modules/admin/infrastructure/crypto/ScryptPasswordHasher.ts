import crypto from "crypto";

function scryptAsync(password: string, salt: string, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey as Buffer);
    });
  });
}

export class ScryptPasswordHasher {
  async hash(plain: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("base64url");
    const key = await scryptAsync(plain, salt, 64);
    return `scrypt$${salt}$${key.toString("base64url")}`;
  }

  async verify(plain: string, passwordHash: string): Promise<boolean> {
    const parts = passwordHash.split("$");
    if (parts.length !== 3 || parts[0] !== "scrypt") return false;
    const salt = parts[1]!;
    const expected = parts[2]!;
    const key = await scryptAsync(plain, salt, 64);
    const expectedBuf = Buffer.from(expected, "base64url");
    if (expectedBuf.length !== key.length) return false;
    return crypto.timingSafeEqual(key, expectedBuf);
  }
}
