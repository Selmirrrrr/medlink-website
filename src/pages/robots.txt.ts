import type { APIContext } from "astro";
import { asset } from "../routes.mjs";
export function GET({ site }: APIContext) {
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL(asset("sitemap.xml"), site)}\n`,
    { headers: { "Content-Type": "text/plain" } },
  );
}
