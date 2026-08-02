/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";
import { supportsWebGL } from "../src/utils/webglSupport";

describe("supportsWebGL", () => {
  afterEach(() => vi.restoreAllMocks());

  it("devuelve false cuando el navegador no puede crear un contexto", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(supportsWebGL()).toBe(false);
  });

  it("devuelve true cuando existe al menos un contexto WebGL", () => {
    const context = {} as WebGLRenderingContext;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (contextId) => (contextId === "webgl" ? context : null),
    );

    expect(supportsWebGL()).toBe(true);
  });
});
