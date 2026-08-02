import { describe, expect, it } from "vitest";
import { checkRateLimit } from "../server/rateLimit";

// IPs unicas por test (con Math.random) para no compartir contador con
// otros tests de este archivo ni con los de serverRoutes.test.ts.
function uniqueTestIp(label: string) {
  return `${label}-${Math.random()}`;
}

describe("rateLimit", () => {
  it("permite hasta el limite y bloquea la siguiente solicitud", () => {
    const ip = uniqueTestIp("limite");

    for (let i = 0; i < 30; i += 1) {
      expect(checkRateLimit(ip)).toBe(true);
    }

    expect(checkRateLimit(ip)).toBe(false);
  });

  it("no mezcla el conteo entre IPs distintas", () => {
    const ipA = uniqueTestIp("ip-a");
    const ipB = uniqueTestIp("ip-b");

    for (let i = 0; i < 30; i += 1) {
      checkRateLimit(ipA);
    }

    expect(checkRateLimit(ipA)).toBe(false);
    // ipB nunca ha pedido nada -- no deberia heredar el bloqueo de ipA.
    expect(checkRateLimit(ipB)).toBe(true);
  });
});
