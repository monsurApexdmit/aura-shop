// Phone layout (below md): app-style bottom tab bar and header. These decide where each piece shows.

/** Top-level tab screens: no back arrow in the header. */
const TAB_ROOTS = ["/", "/categories", "/shop", "/wishlist", "/account", "/login"];

export const isTabRoot = (pathname: string) => TAB_ROOTS.includes(pathname.replace(/\/+$/, "") || "/");

/** Screens with their own sticky action bar (product, checkout, quick order) hide the tab bar. */
export const hidesTabBar = (pathname: string) =>
  /^\/(product\/[^/]+|checkout|order\/(?!result\/?$)[^/]+)\/?$/.test(pathname);
