import "dotenv/config";
import { db } from "../server/db";
import { adminUsers } from "../shared/schema";
import { eq } from "drizzle-orm";
import { ScryptPasswordHasher } from "../server/modules/admin/infrastructure/crypto/ScryptPasswordHasher";

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD || "";
  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set");
  }

  const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing[0]) {
    console.log("Admin user already exists:", email);
    return;
  }

  const hasher = new ScryptPasswordHasher();
  const passwordHash = await hasher.hash(password);

  await db.insert(adminUsers).values({
    email,
    passwordHash,
    role: "admin",
    isActive: true,
  });

  console.log("Admin user created:", email);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

