/** Landing sections the header links to. */
export const LANDING_SECTIONS = [
  { id: "benefits", label: "Benefits" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "order", label: "Order" },
] as const;

export type LandingSectionId = (typeof LANDING_SECTIONS)[number]["id"];

/** Smooth-scrolls to a section on the current page; false when the page has no such section. */
export function scrollToSection(id: string): boolean {
  const el = typeof document !== "undefined" ? document.getElementById(id) : null;
  if (!el) return false;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  return true;
}

/** Click handler for `<Link to="/#id">`: scrolls in place when the section is on this page, else lets the link navigate. */
export const anchorClick = (id: string, after?: () => void) => (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (document.getElementById(id)) {
    e.preventDefault();
    if (after) {
      after();
      // Let an open menu release its scroll lock first
      window.setTimeout(() => scrollToSection(id), 260);
    } else scrollToSection(id);
  } else after?.();
};

/** Plain text from a description that may hold markup. */
export const plainText = (text: string | undefined) => (text ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/** First ~max characters, cut on a word. */
export function excerpt(text: string, max = 140) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).trimEnd()}…`;
}
