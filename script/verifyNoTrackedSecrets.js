import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((filePath) => existsSync(filePath));

const forbiddenMatchers = [
  (filePath) => filePath === ".env",
  (filePath) => filePath.startsWith(".env."),
  (filePath) => filePath.includes("/dist/") || filePath.startsWith("dist/"),
  (filePath) => filePath.includes("/dist-server/") || filePath.startsWith("dist-server/"),
  (filePath) => filePath.endsWith(".pem"),
  (filePath) => filePath.endsWith(".p12"),
  (filePath) => filePath.endsWith(".pfx"),
  (filePath) => filePath.endsWith(".key"),
  (filePath) => filePath.includes("service-account") && filePath.endsWith(".json"),
];

const forbiddenTrackedFiles = trackedFiles.filter((filePath) =>
  forbiddenMatchers.some((matches) => matches(filePath)),
);

if (forbiddenTrackedFiles.length > 0) {
  process.stderr.write("Forbidden tracked secret files detected:\n");
  for (const filePath of forbiddenTrackedFiles) {
    process.stderr.write(`- ${filePath}\n`);
  }
  process.exit(1);
}
