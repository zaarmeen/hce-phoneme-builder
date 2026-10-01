// Small cookie helpers used to persist the light/dark theme choice from the Settings page.
// A cookie (rather than localStorage) was chosen because the brief explicitly asks for
// theme storage "in cookies", and it lets the choice be read server-side later if the
// project moves to a database-backed build in Assessment 2.

const THEME_COOKIE = "hce_theme";
const LAYOUT_COOKIE = "hce_layout";

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getTheme() {
  return getCookie(THEME_COOKIE) || "light";
}

export function setTheme(theme) {
  setCookie(THEME_COOKIE, theme);
}

export function getLayout() {
  return getCookie(LAYOUT_COOKIE) || "comfortable";
}

export function setLayout(layout) {
  setCookie(LAYOUT_COOKIE, layout);
}

export { THEME_COOKIE, LAYOUT_COOKIE };
