function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

export function buildSitemapXml(input: { baseUrl: string; paths: string[] }) {
  const baseUrl = normalizeBaseUrl(input.baseUrl);

  const urlEntries = input.paths
    .map((p) => (p.startsWith("/") ? p : `/${p}`))
    .map((p) => `${baseUrl}${p}`)
    .map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

