export function publicPath(path) {
  const cleanBase = String(import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${cleanBase}${cleanPath}`;
}

export const publicAssetPath = publicPath;

if (typeof window !== "undefined") {
  window.HC = window.HC || {};
  window.HC.publicPath = publicPath;
  window.HC.publicAssetPath = publicAssetPath;
}
