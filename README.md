# MedLink · Astro static website

The MedLink corporate website rebuilt with **Astro 7**, TypeScript and CSS. The build produces complete HTML pages with a small progressive-enhancement script. Production needs only static file hosting; no WordPress, database, application server or client-side framework.

## Run locally

Use **Node.js 24 LTS** (`.nvmrc` is included) and npm 9.6.5 or newer.

```sh
nvm use
npm ci --include=dev
npm run dev
```

Open <http://localhost:4321>. Astro 7 runs its development server as a background process; use `npx astro dev stop` to stop it.

```sh
npm run check        # Astro and TypeScript checks
npm run build        # Generates dist/
npm run preview      # Serves the production build
npm test             # Translation parity, routes, SEO, assets and internal links
npm run test:browser # Playwright: responsive layouts, accessibility and interactions
```

For browser tests, first run `npx playwright install --with-deps chromium`. Browser tests serve `dist/` directly, independently of the Astro development server. Rebuild after making changes.

## Pages and languages

There are **12 pages in each of four languages**: home, platform, about, contact, six solutions, privacy and the archived event. A multilingual 404 page is also generated.

- French: `/` (the existing default)
- German: `/de/`
- Italian: `/it/`
- English: `/en/`

`src/routes.mjs` maps each page to its translated URL. Existing French, German and Italian corporate URLs are retained, including the existing spelling `/de/kontact/`. The language selector links to the equivalent page, rather than taking visitors back to the homepage. Every page has a canonical URL, reciprocal `hreflang` links, metadata and organisation structured data. Astro generates `sitemap.xml` and `robots.txt`.

The existing `/inscription-evenement/` page is retained as an archive: its 25 June 2026 registration is closed. Translations are available in the other three languages.

## Editing content and design

```text
src/content/{fr,de,it,en}.mjs  Translated copy, figures, examples and product content
src/routes.mjs               Localised paths, product identities and colours
src/types.ts                 Shared content and component types
src/layouts/Layout.astro     Metadata and common page layout
src/components/              Navigation, page sections and product illustrations
src/pages/[...path].astro    Build-time generation of every translated route
src/styles/global.css       Design tokens, layouts and responsive styles
src/scripts/site.ts         Menu, filters and contact-email preparation
public/assets/              Self-hosted brand assets, partner logos and images
tests/                      Static-build checks and browser tests
```

Copy lives in separate language modules so translations can be edited without changing the presentation. Each solution has `name`, `category`, `title`, `accent`, `intro`, `short`, `promise`, `challenges` and `benefits`; Scribe additionally has `assurances`. The translation-parity test catches missing fields in any language. Run `npm run format` after editing.

The visual system follows the supplied marketing documents: petrol-blue foundations with pink Care, orange Scheduling, teal Team Planner, purple Scribe, gold Cockpit and green Factoring. All charts and clinical records are illustrative, with fictional data, as indicated on the pages. Figures use the supplied 2026 material: 150+ organisations, 26 cantons, 14,000 users, 75,000 patients/day, 10 million visits/year and CHF 1.2 billion invoiced. The brochure’s “20 years” positioning is retained, along with the verified 2005 founding date.

The logo, Swiss landscape photograph and partner logos originate from the current MedLink website. The logo’s remote font import was removed. Images, fonts, CSS and JavaScript are all hosted locally; neither page loads nor builds require the WordPress site. Inter is supplied by `@fontsource-variable/inter` under its included OFL licence. `nyon.webp` is an optimised derivative of the original corporate photograph.

## Contact requests

The contact form is deliberately explicit about its static behaviour:

1. The visitor fills in their contact details and message.
2. Native browser validation checks required fields and the email address.
3. The site prepares an encoded email to **info@med-link.org** and displays a preview.
4. The visitor opens their email application to send it, or copies the message.

There is **no delivery claim, server submission or storage**. Editing a field invalidates the previous prepared message. Without JavaScript, a direct email link is displayed. Telephone links are available throughout; the German freephone number is labelled for use in Switzerland.

If direct in-page delivery is required, connect an approved form provider or serverless email endpoint, then update the form behaviour and corresponding privacy copy. The public site can remain statically generated.

## Deploy and replace WordPress

1. Run `npm ci --include=dev`, `npm run check`, `npm run build`, `npm test` and the browser tests.
2. Deploy the **contents of `dist/`** to the site's document root on Infomaniak/Apache, Nginx, Netlify, Cloudflare Pages or another static host.
3. Ensure directory index files are served and unknown paths return `404.html` with HTTP 404. The included `.htaccess` provides this for Apache. Do not configure an SPA catch-all rewrite to the homepage.
4. Switch the domain's document root to the static release. The live WordPress installation has not been modified by this project.

The production origin is `https://www.med-link.org`, configured in `astro.config.mjs`. Change it there if the final canonical domain differs. For a staging deployment, restrict indexing through your host's preview settings. `netlify.toml` includes the build command, output directory, Node version and immutable caching for Astro's fingerprinted assets. For other hosts, use `npm run build` and output directory `dist`.

The included privacy page describes this implementation's no-tracking and email-preparation behaviour. Keep it aligned with any analytics or form service added later.

## Verification

- Complete content parity across FR, DE, IT and EN.
- Real static HTML, one main heading per translated page, canonical and alternate language links.
- Internal paths, anchors, assets, sitemap coverage and legacy corporate URLs.
- Every translated page at 390px and 1440px, with checks for overflow, missing images, JavaScript errors and external runtime requests.
- WCAG 2 A/AA and 2.1 AA automated axe checks for all twelve French page templates.
- Keyboard menus, mobile navigation, language switching, solution filters and all four contact-email flows.
- Content and contact fallback with JavaScript disabled; actual 404 responses.

Automated accessibility checks complement human review; they do not constitute an accessibility certification.
