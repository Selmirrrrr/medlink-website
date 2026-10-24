// Progressive enhancements: navigation and content remain usable without JavaScript.
const toggle = document.querySelector<HTMLButtonElement>(".mobile-toggle");
const nav = document.querySelector<HTMLElement>("#main-nav");
if (toggle && nav) {
  toggle.hidden = false;
  document.documentElement.classList.add("enhanced");
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      close();
      toggle.focus();
    }
  });
  nav.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a")) close();
  });
}
const menus = [
  ...document.querySelectorAll<HTMLDetailsElement>(".site-header details"),
];
menus.forEach((menu) => {
  menu.addEventListener("toggle", () => {
    if (menu.open)
      menus.forEach((other) => {
        if (other !== menu) other.open = false;
      });
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.open = false;
      menu.querySelector("summary")?.focus();
      event.stopPropagation();
    }
  });
});
document.addEventListener("click", (event) =>
  menus.forEach((menu) => {
    if (!menu.contains(event.target as Node)) menu.open = false;
  }),
);

const filters = document.querySelector<HTMLElement>(".solution-filters");
if (filters) {
  filters.hidden = false;
  filters.querySelectorAll<HTMLButtonElement>("button").forEach((button) =>
    button.addEventListener("click", () => {
      filters
        .querySelectorAll("button")
        .forEach((other) =>
          other.setAttribute("aria-pressed", String(other === button)),
        );
      document
        .querySelectorAll<HTMLElement>(".solution-card")
        .forEach((card) => {
          card.hidden =
            button.dataset.filter !== "all" &&
            card.dataset.category !== button.dataset.filter;
        });
    }),
  );
}

const form = document.querySelector<HTMLFormElement>("#contact-form");
if (form) {
  const interest = form.querySelector<HTMLSelectElement>('[name="interest"]')!;
  const preset = new URLSearchParams(location.search).get("interest");
  if (preset && [...interest.options].some((option) => option.value === preset))
    interest.value = preset;
  const result = document.querySelector<HTMLElement>(".form-result")!;
  const status = document.querySelector<HTMLElement>("#form-status")!;
  const prepared =
    document.querySelector<HTMLTextAreaElement>("#prepared-message")!;
  const emailLink = document.querySelector<HTMLAnchorElement>("#email-link")!;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const lines = [
      ...form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("[data-label]"),
    ].map(
      (field) =>
        `${field.dataset.label}: ${field instanceof HTMLSelectElement ? field.selectedOptions[0].text : field.value.trim()}`,
    );
    prepared.value = lines.join("\n\n");
    emailLink.href = `mailto:info@med-link.org?subject=${encodeURIComponent(form.dataset.subject!)}&body=${encodeURIComponent(prepared.value)}`;
    result.hidden = false;
    status.textContent = form.dataset.ready!;
    result.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "nearest",
    });
    emailLink.focus({ preventScroll: true });
  });
  form.addEventListener("input", () => {
    result.hidden = true;
  });
  document
    .querySelector("#copy-message")
    ?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(prepared.value);
        status.textContent = form.dataset.copied!;
      } catch {
        prepared.focus();
        prepared.select();
        status.textContent = form.dataset.copyError!;
      }
    });
}
