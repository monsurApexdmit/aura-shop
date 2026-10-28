// Pastel grounds behind product and department photos; cycled by index.
export const PASTELS = [
  "bg-[#FCE38A]", // butter
  "bg-[#A8E6CF]", // mint
  "bg-[#A0D8EF]", // sky
  "bg-[#F9B4C4]", // pink
  "bg-[#FFCFA3]", // apricot
] as const;

export const pastel = (i: number) => PASTELS[i % PASTELS.length];
