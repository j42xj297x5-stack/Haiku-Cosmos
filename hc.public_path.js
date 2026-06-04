export function publicPath(path) {
  const envBase = import.meta.env && import.meta.env.BASE_URL;
  const cleanBase = String(envBase || "/").replace(/\/+$/, "/");
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const baseSegment = cleanBase.replace(/^\/+|\/+$/g, "");
  const hasDuplicateBase = baseSegment && (cleanPath === baseSegment || cleanPath.startsWith(`${baseSegment}/`));
  const pathWithoutDuplicateBase = hasDuplicateBase
    ? cleanPath.slice(baseSegment.length).replace(/^\/+/, "")
    : cleanPath;
  return `${cleanBase}${pathWithoutDuplicateBase}`;
}

export const publicAssetPath = publicPath;

if (typeof window !== "undefined") {
  window.HC = window.HC || {};
  window.HC.publicPath = publicPath;
  window.HC.publicAssetPath = publicAssetPath;
}
