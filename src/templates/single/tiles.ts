// Full class names so Tailwind keeps them.
const TILES = ["bg-tile-1", "bg-tile-2", "bg-tile-3", "bg-tile-4", "bg-tile-5"] as const;

/** Pastel tile background for the nth item. */
export const tileClass = (index: number) => TILES[Math.abs(index) % TILES.length];
