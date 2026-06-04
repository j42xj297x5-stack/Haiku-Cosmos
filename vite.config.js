import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyRuntimeStaticDirs() {
  const dirs = ["assets", "svg", "vendor"];

  return {
    name: "copy-haiku-cosmos-runtime-static-dirs",
    writeBundle() {
      for (const dir of dirs) {
        const source = join(__dirname, dir);
        const target = join(__dirname, "dist", dir);
        if (!existsSync(source)) continue;
        rmSync(target, { recursive: true, force: true });
        mkdirSync(dirname(target), { recursive: true });
        cpSync(source, target, { recursive: true });
      }

      for (const file of readdirSync(__dirname)) {
        if (!/^(cards|game(?:\.boot)?|hc\..+)\.js$/.test(file)) continue;
        cpSync(join(__dirname, file), join(__dirname, "dist", file));
      }
    }
  };
}

export default defineConfig({
  // Required for the GitHub Pages project site:
  // https://j42xj297x5-stack.github.io/Haiku-Cosmos/
  base: "/Haiku-Cosmos/",
  build: {
    outDir: "dist"
  },
  plugins: [copyRuntimeStaticDirs()]
});
