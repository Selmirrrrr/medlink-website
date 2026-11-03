import { defineConfig } from "astro/config";

export default defineConfig({
  // GitHub Pages builds override these (see .github/workflows/pages.yml).
  site: process.env.SITE_URL ?? "https://www.med-link.org",
  base: process.env.BASE_PATH ?? "/",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  server: {
    port: 4321,
    allowedHosts: ["mls.bizy.ch", "devbox.tail9514f6.ts.net"],
  },
  devToolbar: { enabled: false },
});
