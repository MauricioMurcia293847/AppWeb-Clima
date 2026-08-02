import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const assetsDirectory = join(process.cwd(), "dist", "assets");
const indexHtml = readFileSync(join(process.cwd(), "dist", "index.html"), "utf8");
const mainScriptName = indexHtml.match(/assets\/(index-[^"']+\.js)/)?.[1];
const assets = readdirSync(assetsDirectory).map((name) => {
  const contents = readFileSync(join(assetsDirectory, name));
  return { gzipBytes: gzipSync(contents).byteLength, name };
});

const budgets = [
  {
    label: "JavaScript principal",
    limit: 80 * 1024,
    matches: (name) => name === mainScriptName,
  },
  {
    label: "Anime.js diferido",
    limit: 30 * 1024,
    matches: (name) => name.startsWith("anime-") && name.endsWith(".js"),
  },
  {
    label: "CSS principal",
    limit: 10 * 1024,
    matches: (name) => name.startsWith("index-") && name.endsWith(".css"),
  },
  {
    label: "Globo 3D diferido",
    limit: 600 * 1024,
    matches: (name) => name.startsWith("Globe3D-") && name.endsWith(".js"),
  },
];

let failed = false;

for (const budget of budgets) {
  const asset = assets.find(({ name }) => budget.matches(name));
  if (!asset) {
    console.error(`No se encontro el asset para: ${budget.label}.`);
    failed = true;
    continue;
  }

  const sizeKb = (asset.gzipBytes / 1024).toFixed(1);
  const limitKb = (budget.limit / 1024).toFixed(0);
  console.log(`${budget.label}: ${sizeKb} KB gzip (limite ${limitKb} KB)`);

  if (asset.gzipBytes > budget.limit) failed = true;
}

if (failed) {
  console.error("El build supera uno o mas presupuestos de rendimiento.");
  process.exit(1);
}
