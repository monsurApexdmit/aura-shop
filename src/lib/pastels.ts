// Pastel grounds behind product and department photos; cycled by index.
// Colours come from the store theme (--tile-1..5, always light so dark text reads on them).
export const PASTELS = ["bg-tile-1", "bg-tile-2", "bg-tile-3", "bg-tile-4", "bg-tile-5"] as const;

export const pastel = (i: number) => PASTELS[i % PASTELS.length];
