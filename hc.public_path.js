export function publicPath(path = "") {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = String(path)
    .replace(/^\/+/, "")
    .replace(/^public\//, "");

  return `${cleanBase}${cleanPath}`;
}

export const publicAssetPath = publicPath;

if (typeof window !== "undefined") {
  window.HC = window.HC || {};
  window.HC.publicPath = publicPath;
  window.HC.publicAssetPath = publicAssetPath;
  window.HC.publicBaseUrl = publicPath("");
}
