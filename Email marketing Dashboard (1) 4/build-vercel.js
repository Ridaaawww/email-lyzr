import { cpSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const out = join(root, ".vercel", "output");

// Clean previous output
rmSync(out, { recursive: true, force: true });

// Static assets: dist/client/ → .vercel/output/static/
mkdirSync(join(out, "static"), { recursive: true });
cpSync(join(root, "dist", "client"), join(out, "static"), { recursive: true });

// Bundle the server entry into a single edge-compatible file
const fnDir = join(out, "functions", "index.func");
mkdirSync(fnDir, { recursive: true });

console.log("Bundling server for edge runtime...");
await build({
  entryPoints: [join(root, "dist", "server", "server.js")],
  bundle: true,
  outfile: join(fnDir, "index.js"),
  format: "esm",
  platform: "browser", // edge runtime — Web APIs, no Node.js built-ins
  target: "es2022",
  conditions: ["worker", "browser"],
  // Mark things that truly can't run in edge runtime
  external: ["node:*", "cloudflare:*"],
  minify: false,
  alias: {
    // Resolve server-side chunk imports
  },
});
console.log("Server bundle complete.");

// Edge function manifest
writeFileSync(
  join(fnDir, ".vc-config.json"),
  JSON.stringify({ runtime: "edge", entrypoint: "index.js" }, null, 2)
);

// Vercel output config (v3)
writeFileSync(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        {
          src: "/assets/(.*)",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          continue: true,
        },
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2
  )
);

console.log("Vercel Build Output API structure created.");
