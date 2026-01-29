type SeoInput = {
  title: string;
  description?: string;
  canonicalPath?: string;
};

const DEFAULT_TITLE = "Agrícola Coterra";
const DEFAULT_DESCRIPTION =
  "Encuentra insumos agrícolas, herramientas y alimentos para potenciar tu producción y cuidar de tus animales.";

function setOrCreateMeta(name: string, content: string) {
  const existing = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }
  const meta = document.createElement("meta");
  meta.setAttribute("name", name);
  meta.setAttribute("content", content);
  document.head.appendChild(meta);
}

function setCanonical(href: string) {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (existing) {
    existing.setAttribute("href", href);
    return;
  }
  const link = document.createElement("link");
  link.setAttribute("rel", "canonical");
  link.setAttribute("href", href);
  document.head.appendChild(link);
}

function resolveBaseUrl() {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  if (canonical) {
    try {
      return new URL(canonical).origin;
    } catch {}
  }
  return typeof location !== "undefined" ? location.origin : "https://coterra.vendo365.com";
}

export function applySeo(input: SeoInput) {
  const title = input.title?.trim() ? input.title.trim() : DEFAULT_TITLE;
  const description = input.description?.trim() ? input.description.trim() : DEFAULT_DESCRIPTION;

  document.title = title;
  setOrCreateMeta("description", description);

  const baseUrl = resolveBaseUrl();
  if (input.canonicalPath) {
    const href = new URL(input.canonicalPath, baseUrl).toString();
    setCanonical(href);
  }
}

