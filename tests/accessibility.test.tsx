/** @vitest-environment jsdom */

import React, { act } from "react";
import axe from "axe-core";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/utils/webglSupport", () => ({
  supportsWebGL: () => false,
}));

import App from "../src/App";
import { SavedLocations } from "../src/components/SavedLocations";
import { SearchPanel } from "../src/components/SearchPanel";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("accesibilidad WCAG del dashboard", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it("no presenta violaciones automaticas axe en la vista inicial", async () => {
    await act(async () => root.render(<App />));

    const results = await axe.run(container, {
      // jsdom no calcula pixeles; el contraste se valida en la auditoria real.
      rules: { "color-contrast": { enabled: false } },
    });

    expect(results.violations).toEqual([]);
  });

  it("muestra y anuncia el rechazo de geolocalizacion", async () => {
    Object.defineProperty(window.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn(
          (
            _success: () => void,
            error: ((reason: unknown) => void) | null | undefined,
          ) => error?.({ code: 1 }),
        ),
      },
    });

    await act(async () => root.render(<App />));
    const locationButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Mi ubicación"),
    );

    await act(async () => locationButton?.click());

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "No pudimos acceder a tu ubicación",
    );
    expect(container.querySelector(".connection-error")?.textContent).toContain(
      "No pudimos acceder a tu ubicación",
    );
    expect(container.querySelector(".connection-error")?.getAttribute("role")).toBeNull();
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(1);
  });

  it("permite consultar coordenadas exactas usando controles nativos", async () => {
    const onSelectCoordinates = vi.fn();
    await act(async () =>
      root.render(
        <SearchPanel
          availableCities={[]}
          errorMessage=""
          isLoading={false}
          onQueryChange={vi.fn()}
          onSelectCity={vi.fn()}
          onSelectCoordinates={onSelectCoordinates}
          onSubmit={vi.fn()}
          query=""
        />,
      ),
    );

    const inputs = container.querySelectorAll<HTMLInputElement>(
      ".coordinate-form input",
    );
    await act(async () => {
      setInputValue(inputs[0], "19.43");
      setInputValue(inputs[1], "-99.13");
    });
    await act(async () =>
      container
        .querySelector<HTMLFormElement>(".coordinate-form")
        ?.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true })),
    );

    expect(onSelectCoordinates).toHaveBeenCalledWith({ lat: 19.43, lng: -99.13 });
  });

  it("expone favoritos y recientes como secciones y listas", async () => {
    await act(async () =>
      root.render(
        <SavedLocations
          currentLocation="Madrid"
          favorites={["Madrid"]}
          isLoading={false}
          onSelectLocation={vi.fn()}
          onToggleFavorite={vi.fn()}
          recentLocations={["Tokio"]}
        />,
      ),
    );

    expect(container.querySelectorAll("h3")).toHaveLength(2);
    expect(container.querySelectorAll("ul")).toHaveLength(2);
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});
