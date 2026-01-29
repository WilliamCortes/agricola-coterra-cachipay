import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  const routeToHtml = new Map<string, string>([
    ["/products", "products.html"],
    ["/contact", "contact.html"],
    ["/privacy", "privacy.html"],
    ["/cart", "cart.html"],
  ]);

  app.use("/{*path}", (req, res) => {
    const fullPath = req.baseUrl || req.path;
    const urlPath = fullPath.endsWith("/") && fullPath.length > 1 ? fullPath.slice(0, -1) : fullPath;
    const htmlName = routeToHtml.get(urlPath);
    if (htmlName && fs.existsSync(path.resolve(distPath, htmlName))) {
      return res.sendFile(path.resolve(distPath, htmlName));
    }
    return res.sendFile(path.resolve(distPath, "index.html"));
  });
}
