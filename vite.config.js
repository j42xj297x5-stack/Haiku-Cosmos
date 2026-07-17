import { defineConfig } from "vite";

const startedAt = new Date().toISOString();

function safeBuildValue(value) {
  return String(value || "").trim().replace(/[^A-Za-z0-9._~-]/g, "-");
}

function runtimeVersionPlugin({ command, mode }) {
  const suppliedSha = safeBuildValue(process.env.VITE_BUILD_SHA);
  const buildId = suppliedSha || safeBuildValue(`${command === "serve" ? "dev" : "local"}-${startedAt}`);
  const buildInfo = Object.freeze({
    id: buildId,
    sha: suppliedSha || null,
    mode,
    startedAt
  });

  return {
    name: "hc-runtime-build-version",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const versionedHtml = html.replace(/(<script\b[^>]*\bsrc=)(["'])([^"']+)(\2[^>]*>)/gi, (tag, prefix, quote, src, suffix) => {
          if (/^(?:https?:|data:|blob:|\/\/)/i.test(src)) return tag;
          const [beforeHash, hash = ""] = src.split(/#(.*)/s);
          const [pathname, query = ""] = beforeHash.split(/\?(.*)/s);
          const normalizedPath = pathname.replace(/^\.\//, "");
          if (!/(?:^|\/)runtime\/[^/]+\.js$/i.test(normalizedPath)) return tag;
          if (new URLSearchParams(query).has("v")) return tag;
          const nextQuery = query ? `${query}&v=${encodeURIComponent(buildId)}` : `v=${encodeURIComponent(buildId)}`;
          return `${prefix}${quote}${pathname}?${nextQuery}${hash ? `#${hash}` : ""}${suffix}`;
        });
        const payload = JSON.stringify(buildInfo).replace(/</g, "\\u003c");
        return versionedHtml.replace("</head>", `  <script data-hc-build-info>\n    window.HC_BUILD_INFO = Object.freeze(${payload});\n    console.info("[HC BUILD]", window.HC_BUILD_INFO.id);\n  </script>\n</head>`);
      }
    }
  };
}

export default defineConfig(({ command, mode }) => ({
  // GitHub Pages project site base path for:
  // https://j42xj297x5-stack.github.io/Haiku-Cosmos/
  base: "/Haiku-Cosmos/",
  plugins: [runtimeVersionPlugin({ command, mode })],
  build: {
    outDir: "dist"
  }
}));
