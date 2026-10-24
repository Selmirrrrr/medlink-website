import { languages, routes, url } from "../routes.mjs";
import type { APIContext } from "astro";
export function GET({ site }: APIContext) {
  const nodes = languages.flatMap((lang) =>
    Object.keys(routes[lang]).map(
      (page) =>
        `<url><loc>${new URL(url(lang, page), site)}</loc>${languages.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${new URL(url(l, page), site)}"/>`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${new URL(url("fr", page), site)}"/></url>`,
    ),
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${nodes.join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
