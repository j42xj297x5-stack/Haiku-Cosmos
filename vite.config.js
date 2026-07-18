import { defineConfig } from "vite";

const startedAt = new Date().toISOString();
const projectBase = "/Haiku-Cosmos/";

function safeBuildValue(value) {
  return String(value || "").trim().replace(/[^A-Za-z0-9._~-]/g, "-");
}

function createBuildInfo({ command, mode }) {
  const suppliedSha = safeBuildValue(process.env.VITE_BUILD_SHA);
  const id = suppliedSha || safeBuildValue(`${command === "serve" ? "dev" : "local"}-${startedAt}`);
  const shortSha = suppliedSha ? suppliedSha.slice(0, 7) : id;
  return Object.freeze({
    id,
    sha: suppliedSha || id,
    shortSha,
    builtAt: startedAt,
    mode,
    latestPath: `${projectBase}latest/`,
    assetBase: command === "serve" ? projectBase : `${projectBase}builds/${id}/`
  });
}

function isExternalUrl(src) {
  return /^(?:https?:|data:|blob:|\/\/)/i.test(src);
}

function versionRuntimeScripts(html, buildId) {
  return html.replace(/(<script\b[^>]*\bsrc=)(["'])([^"']+)(\2[^>]*>)/gi, (tag, prefix, quote, src, suffix) => {
    if (isExternalUrl(src)) return tag;
    const [beforeHash, hash = ""] = src.split(/#(.*)/s);
    const [pathname, query = ""] = beforeHash.split(/\?(.*)/s);
    const normalizedPath = pathname.replace(/^\.\//, "");
    if (!/(?:^|\/)runtime\/[^/]+\.js$/i.test(normalizedPath)) return tag;
    if (new URLSearchParams(query).has("v")) return tag;
    const nextQuery = query ? `${query}&v=${encodeURIComponent(buildId)}` : `v=${encodeURIComponent(buildId)}`;
    return `${prefix}${quote}${pathname}?${nextQuery}${hash ? `#${hash}` : ""}${suffix}`;
  });
}

function runtimeVersionPlugin({ command, mode }) {
  const buildInfo = createBuildInfo({ command, mode });
  return {
    name: "hc-runtime-build-version",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const versionedHtml = versionRuntimeScripts(html, buildInfo.id);
        const payload = JSON.stringify(buildInfo).replace(/</g, "\\u003c");
        return versionedHtml.replace("</head>", `  <script data-hc-build-info>\n    window.HC_BUILD_INFO = Object.freeze(${payload});\n    console.info("[HC BUILD]", window.HC_BUILD_INFO.id);\n  </script>\n</head>`);
      }
    }
  };
}

export default defineConfig(({ command, mode }) => ({
  base: projectBase,
  plugins: [runtimeVersionPlugin({ command, mode })],
  build: { outDir: "dist" }
}));
