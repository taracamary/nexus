import path from "node:path";
import { defineConfig } from "vite";
import posthtml from "posthtml";
import include from "posthtml-include";

const srcRoot = path.resolve(import.meta.dirname, "src");
const indexHtmlPath = path.resolve(import.meta.dirname, "index.html");

/**
 * Build-time HTML includes via PostHTML + posthtml-include.
 * Uses Vite's transformIndexHtml hook (dev + build).
 */
function posthtmlInclude() {
  return {
    name: "posthtml-include",
    transformIndexHtml: {
      order: "pre",
      async handler(html) {
        const result = await posthtml([
          include({
            root: srcRoot,
            encoding: "utf8",
          }),
        ]).process(html);

        return result.html;
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith(".html") && path.resolve(file) !== indexHtmlPath) {
        server.ws.send({ type: "full-reload", path: "*" });
      }
    },
  };
}

export default defineConfig({
  plugins: [posthtmlInclude()],
});
