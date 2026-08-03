import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type VercelHeader = {
  key: string;
  value: string;
};

type VercelConfig = {
  headers?: Array<{
    headers: VercelHeader[];
    source: string;
  }>;
};

describe("configuracion de entrega", () => {
  it("mantiene alineada la version estable del paquete y su lockfile", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    const packageLock = JSON.parse(readFileSync("package-lock.json", "utf8"));

    expect(packageJson.version).toBe("1.0.0");
    expect(packageLock.version).toBe(packageJson.version);
    expect(packageLock.packages[""].version).toBe(packageJson.version);
  });

  it("protege las paginas y funciones desplegadas por Vercel", () => {
    const config = JSON.parse(
      readFileSync("vercel.json", "utf8"),
    ) as VercelConfig;
    const globalRule = config.headers?.find((rule) => rule.source === "/(.*)");
    const headers = new Map(
      globalRule?.headers.map(({ key, value }) => [key, value]),
    );

    expect(headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(headers.get("Permissions-Policy")).toContain("geolocation=(self)");
  });
});
