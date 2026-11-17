/** Google Fonts stylesheet URL for the given families. */
export const gf = (families: string[]) =>
  `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
