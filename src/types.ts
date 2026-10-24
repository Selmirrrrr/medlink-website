import type fr from "./content/fr.mjs";
export type Language = "fr" | "de" | "it" | "en";
export type ProductId =
  "care" | "planning" | "team" | "scribe" | "cockpit" | "factoring";
export type PageId =
  ProductId | "home" | "platform" | "about" | "contact" | "privacy" | "event";
export type ProductContent = typeof fr.products.care & {
  assurances?: string[][];
};
export type Content = Omit<typeof fr, "products"> & {
  products: Record<ProductId, ProductContent>;
};
export interface PageProps {
  t: Content;
  lang: Language;
  page?: PageId | "404";
}
