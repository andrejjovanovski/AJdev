export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "aj-theme";

/**
 * Applied before paint so the stored theme never flashes. Visitors without a
 * stored preference get the default set in /portal.
 *
 * Server-callable on purpose — keep it out of the "use client" module.
 */
export const themeInitScript = (defaultTheme: Theme = "light") => `
try {
  var t = localStorage.getItem('${THEME_STORAGE_KEY}');
  if (t !== 'dark' && t !== 'light') t = '${defaultTheme === "dark" ? "dark" : "light"}';
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t;
} catch (e) {}
`;
