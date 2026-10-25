import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.med-link.org",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  server: {
    port: 4321,
    allowedHosts: ["mls.bizy.ch", "devbox.tail9514f6.ts.net"],
  },
  devToolbar: { enabled: false },
});
