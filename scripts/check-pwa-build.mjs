import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const requiredFiles = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "pwa-192.png",
  "pwa-512.png",
  "pwa-maskable-512.png",
];

const missingFiles = requiredFiles.filter((file) => !existsSync(join(dist, file)));
if (missingFiles.length > 0) {
  console.error(`Faltan recursos PWA: ${missingFiles.join(", ")}`);
  process.exit(1);
}

const manifest = JSON.parse(
  readFileSync(join(dist, "manifest.webmanifest"), "utf8"),
);
const indexHtml = readFileSync(join(dist, "index.html"), "utf8");

if (manifest.display !== "standalone" || manifest.icons?.length < 3) {
  console.error("El manifiesto no cumple los requisitos de instalacion definidos.");
  process.exit(1);
}

if (!indexHtml.includes('rel="manifest"')) {
  console.error("El HTML compilado no enlaza el manifiesto PWA.");
  process.exit(1);
}

console.log("PWA: manifiesto, service worker e iconos listos para instalacion.");
