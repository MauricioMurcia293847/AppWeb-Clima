/** @vitest-environment jsdom */

import React, { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobeErrorBoundary } from "../src/components/GlobeErrorBoundary";

vi.mock("../src/utils/webglSupport", () => ({
  supportsWebGL: () => false,
}));

import { GlobeExperience } from "../src/components/GlobeExperience";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function BrokenScene(): ReactNode {
  throw new Error("WebGL context unavailable");
}

describe("protecciones del globo 3D", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it("mantiene un recorrido mundial animado cuando WebGL no esta disponible", async () => {
    const marker = {
      id: "madrid",
      label: "Madrid",
      lat: 40.4168,
      lng: -3.7038,
    };

    await act(async () => {
      root.render(
        <GlobeExperience marker={marker} onSelectCoordinates={vi.fn()} />,
      );
    });

    expect(container.querySelector("canvas")).toBeNull();
    expect(container.textContent).toContain("Modo compatible animado");
    expect(container.querySelector(".globe-fallback-animated")).not.toBeNull();
    expect(container.querySelector(".globe-fallback-marker")?.getAttribute("title"))
      .toBe("Madrid");
    expect(
      container.querySelector<HTMLElement>(".globe-fallback-earth")?.style
        .getPropertyValue("--fallback-focus-x"),
    ).toBe("48.97116666666667%");
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/globe/earth-dark.jpg",
    );
  });

  it("respeta movimiento reducido tambien en el modo compatible", async () => {
    await act(async () => {
      root.render(
        <GlobeExperience onSelectCoordinates={vi.fn()} reduceMotion />,
      );
    });

    expect(container.textContent).toContain("Movimiento reducido");
    expect(container.querySelector(".globe-fallback-animated")).toBeNull();
  });

  it("contiene un error 3D sin desmontar la interfaz exterior", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      root.render(
        <main>
          <span>Dashboard disponible</span>
          <GlobeErrorBoundary>
            <BrokenScene />
          </GlobeErrorBoundary>
        </main>,
      );
    });

    expect(container.textContent).toContain("Dashboard disponible");
    expect(container.textContent).toContain("Modo compatible animado");
  });
});
