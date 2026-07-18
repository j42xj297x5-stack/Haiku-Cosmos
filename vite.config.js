import { defineConfig } from "vite";

const startedAt = new Date().toISOString();
const projectBase = "/Haiku-Cosmos/";
const safeBuildId = /^[A-Za-z0-9._~-]+$/;

function value(input) { return String(input || "").trim(); }
function localId(command) { return `${command === "serve" ? "dev" : "local"}-${Date.now()}`; }

export function createBuildInfo({ command, mode }) {
  const requestedId = value(process.env.VITE_BUILD_ID);
  const sha = value(process.env.VITE_BUILD_SHA) || "local";
  if (requestedId && !safeBuildId.test(requestedId)) throw new Error("VITE_BUILD_ID must contain only URL-safe A-Z, a-z, 0-9, ., _, or - characters");
  if (mode === "production" && process.env.CI && !requestedId) throw new Error("VITE_BUILD_ID is required for production CI builds");
  const id = requestedId || localId(command);
  const assetBase = command === "serve" ? projectBase : `${projectBase}builds/${id}/`;
  return Object.freeze({ id, sha, shortSha: sha.slice(0, 7), builtAt: startedAt, mode, runId: value(process.env.GITHUB_RUN_ID) || undefined, runAttempt: value(process.env.GITHUB_RUN_ATTEMPT) || undefined, appPath: `${projectBase}builds/${id}/index.html`, assetBase, integrityPath: `${assetBase}build-integrity.json` });
}

function isExternalUrl(src) { return /^(?:https?:|data:|blob:|\/\/)/i.test(src); }
function versionRuntimeScripts(html, buildId) {
  return html.replace(/(<script\b[^>]*\bsrc=)(["'])([^"']+)(\2[^>]*>)/gi, (tag, prefix, quote, src, suffix) => {
    if (isExternalUrl(src)) return tag;
    const [pathname, query = ""] = src.split(/\?(.*)/s);
    if (!/(?:^|\/)runtime\/[^/]+\.js$/i.test(pathname) || new URLSearchParams(query).has("v")) return tag;
    return `${prefix}${quote}${pathname}?${query ? `${query}&` : ""}v=${encodeURIComponent(buildId)}${suffix}`;
  });
}
function runtimeVersionPlugin({ command, mode }) {
  const buildInfo = createBuildInfo({ command, mode });
  return { name: "hc-runtime-build-version", transformIndexHtml: { order: "pre", handler(html) {
    const payload = JSON.stringify(buildInfo).replace(/</g, "\\u003c");
    return versionRuntimeScripts(html, buildInfo.id).replace("</head>", `  <script data-hc-build-info>window.HC_BUILD_INFO=Object.freeze(${payload});console.info("[HC BUILD]",window.HC_BUILD_INFO.id);</script>\n</head>`);
  } } };
}
export default defineConfig(({ command, mode }) => ({ base: projectBase, plugins: [runtimeVersionPlugin({ command, mode })], build: { outDir: "dist" } }));
