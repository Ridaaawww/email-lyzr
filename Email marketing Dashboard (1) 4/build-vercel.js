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

// Write a Node.js adapter that wraps the Cloudflare Worker interface
const fnDir = join(out, "functions", "index.func");
mkdirSync(fnDir, { recursive: true });

// Adapter: Node.js IncomingMessage/ServerResponse ↔ Web API Request/Response
const adapterSrc = `
import worker from "${join(root, "dist", "server", "server.js").replace(/\\/g, "/")}";
import { Readable } from "node:stream";

export default async function handler(req, res) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = \`\${protocol}://\${host}\${req.url}\`;

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (chunks.length > 0) body = Buffer.concat(chunks);
  }

  const webRequest = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: body ?? null,
  });

  const webResponse = await worker.fetch(webRequest, {}, {});

  res.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const arrayBuffer = await webResponse.arrayBuffer();
  res.end(Buffer.from(arrayBuffer));
}
`;

writeFileSync(join(root, "_vercel_adapter.js"), adapterSrc);

console.log("Bundling server for Node.js runtime...");
await build({
  entryPoints: [join(root, "_vercel_adapter.js")],
  bundle: true,
  outfile: join(fnDir, "index.js"),
  format: "esm",
  platform: "node",
  target: "node20",
  external: ["node:*"],
  minify: false,
});

// Clean up temporary adapter
rmSync(join(root, "_vercel_adapter.js"));
console.log("Server bundle complete.");

// Serverless function manifest (Node.js runtime)
writeFileSync(
  join(fnDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.js",
      launcherType: "Nodejs",
    },
    null,
    2
  )
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
