import { execFileSync } from "node:child_process";

if (process.env.NODE_ENV === "production") {
  process.stderr.write("Refusing to run drizzle push in production. Use db:migrate instead.\n");
  process.exit(1);
}

execFileSync("npx", ["drizzle-kit", "push", "--force"], { stdio: "inherit" });
