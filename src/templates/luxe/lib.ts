import { useEffect } from "react";

/** Small uppercase, letter-spaced label: the template's signature typographic detail. */
export const EYEBROW = "text-[11px] uppercase tracking-[0.2em]";

/** Underlined text link used for every call to action. */
export const TEXT_LINK =
  "inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background";

/** Square, hairline focus ring for buttons and links. */
export const FOCUS = "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Muted photo grounds, cycled for tiles without a photo. */
export const TILES = ["bg-tile-1", "bg-tile-2", "bg-tile-3", "bg-tile-4", "bg-tile-5"] as const;
export const tile = (i: number) => TILES[((i % TILES.length) + TILES.length) % TILES.length];

/** True for a real photo URL (not empty, not the placeholder). */
export const hasPhoto = (src: string | null | undefined): src is string => !!src && !src.includes("placeholder");

/** Locks page scroll while an overlay is open. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [active]);
}

/** Calls onEscape when Escape is pressed while active. */
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active, onEscape]);
}
