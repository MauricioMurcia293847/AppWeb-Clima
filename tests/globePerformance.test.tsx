/** @vitest-environment jsdom */

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/utils/webglSupport", () => ({
  supportsWebGL: () => true,
}));

vi.mock("../src/components/Globe3D", () => ({
  Globe3D: () => <div data-testid="interactive-globe">Globo interactivo</div>,
}));

import { GlobeExperience } from "../src/components/GlobeExperience";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("carga progresiva del globo", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    Object.defineProperty(window.navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", saveData: false },
    });
    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      value: (callback: () => void) => {
        callback();
        return 1;
      },
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("muestra el skeleton antes de solicitar la experiencia pesada", async () => {
    await act(async () =>
      root.render(<GlobeExperience onSelectCoordinates={vi.fn()} />),
    );

    expect(container.querySelector(".globe-skeleton")).not.toBeNull();
    expect(container.textContent).not.toContain("Globo interactivo");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(container.textContent).toContain("Globo interactivo");
  });

  it("mantiene la vista estatica cuando el usuario activa ahorro de datos", async () => {
    Object.defineProperty(window.navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", saveData: true },
    });

    await act(async () =>
      root.render(<GlobeExperience onSelectCoordinates={vi.fn()} />),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(container.textContent).toContain("Vista mundial estática");
    expect(container.textContent).not.toContain("Globo interactivo");
  });
});
