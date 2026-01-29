import { storage } from "../server/storage.js";
import { buildSitemapXml } from "../server/presentation/http/sitemap.js";

function resolveBaseUrl(req: any) {
  const host = String(req?.headers?.["x-forwarded-host"] ?? req?.headers?.host ?? "");
  const proto = String(req?.headers?.["x-forwarded-proto"] ?? "https");
  return process.env.APP_BASE_URL || (host ? `${proto}://${host}` : "https://coterra.vendo365.com");
}

export default async function handler(req: any, res: any) {
  try {
    const baseUrl = resolveBaseUrl(req);
    const categories = await storage.getCategories();
    const categoryPaths = categories
      .map((c) => c.slug)
      .filter(Boolean)
      .map((slug) => `/products?category=${encodeURIComponent(slug)}`);

    const xml = buildSitemapXml({
      baseUrl,
      paths: ["/", "/products", "/contact", "/privacy", ...categoryPaths],
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.end(xml);
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.end(buildSitemapXml({ baseUrl: "https://coterra.vendo365.com", paths: ["/"] }));
  }
}

