import { cpSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, ".vercel", "output");

// Clean previous output
rmSync(out, { recursive: true, force: true });

// Static assets: dist/client/ → .vercel/output/static/
mkdirSync(join(out, "static"), { recursive: true });
cpSync(join(root, "dist", "client"), join(out, "static"), { recursive: true });

// Edge function: dist/server/ → .vercel/output/functions/index.func/
const fnDir = join(out, "functions", "index.func");
mkdirSync(fnDir, { recursive: true });
cpSync(join(root, "dist", "server"), fnDir, { recursive: true });

// Edge function manifest
writeFileSync(
  join(fnDir, ".vc-config.json"),
  JSON.stringify({ runtime: "edge", entrypoint: "server.js" }, null, 2)
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
