/** @type {import('./types').Language[]} */
export const languages = ["fr", "de", "it", "en"];
export const languageNames = {
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  en: "English",
};
/** @type {import('./types').ProductId[]} */
export const productIds = [
  "care",
  "planning",
  "team",
  "scribe",
  "cockpit",
  "factoring",
];
export const routes = {
  fr: {
    home: "",
    platform: "innovation-medlink",
    about: "a-propos",
    contact: "contact",
    care: "dossier-clinique",
    planning: "planification",
    team: "team-planner",
    scribe: "l-ia-dans-les-soins",
    cockpit: "cockpit",
    factoring: "factoring",
    privacy: "confidentialite",
    event: "inscription-evenement",
  },
  de: {
    home: "",
    platform: "innovation-medlink",
    about: "ueber-uns",
    contact: "kontact",
    care: "klinische-akte",
    planning: "die-planung",
    team: "team-planner",
    scribe: "ki-in-der-pflege",
    cockpit: "das-cockpit",
    factoring: "factoring",
    privacy: "datenschutz",
    event: "veranstaltung",
  },
  it: {
    home: "",
    platform: "innovation-medlink",
    about: "su-di-noi",
    contact: "contatto",
    care: "cartella-clinica",
    planning: "la-pianificazione",
    team: "team-planner",
    scribe: "lia-redazionale-al-servizio-della-qualita",
    cockpit: "il-cockpit",
    factoring: "factoring",
    privacy: "privacy",
    event: "evento",
  },
  en: {
    home: "",
    platform: "platform",
    about: "about",
    contact: "contact",
    care: "clinical-record",
    planning: "scheduling",
    team: "team-planner",
    scribe: "medlink-scribe",
    cockpit: "cockpit",
    factoring: "factoring",
    privacy: "privacy",
    event: "event",
  },
};
export function url(lang, page = "home") {
  if (!routes[lang] || !(page in routes[lang]))
    throw new Error(`Unknown route ${lang}/${page}`);
  return `${lang === "fr" ? "/" : `/${lang}/`}${routes[lang][page] ? `${routes[lang][page]}/` : ""}`;
}
export const themes = {
  care: { color: "#c63c6b", light: "#f5aac6", pale: "#fbedf3", icon: "heart" },
  planning: {
    color: "#ad4d13",
    light: "#ffbc8b",
    pale: "#fff2e8",
    icon: "calendar",
  },
  team: { color: "#127e74", light: "#8ad7c9", pale: "#eaf7f3", icon: "users" },
  scribe: { color: "#7350df", light: "#c9b5ff", pale: "#f1edff", icon: "wave" },
  cockpit: {
    color: "#886600",
    light: "#ffda73",
    pale: "#fff8e6",
    icon: "chart",
  },
  factoring: {
    color: "#217442",
    light: "#97d9ab",
    pale: "#ecf7ef",
    icon: "wallet",
  },
};
