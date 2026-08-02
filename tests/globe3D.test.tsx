/** @vitest-environment jsdom */

import React, {
  act,
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({
  controls: {
    autoRotate: false,
    autoRotateSpeed: 0,
    enablePan: true,
    enableZoom: true,
    update: vi.fn(),
  },
  globeProps: {} as Record<string, unknown>,
  methods: {
    controls: vi.fn(),
    pauseAnimation: vi.fn(),
    pointOfView: vi.fn(),
    renderer: vi.fn(),
    resumeAnimation: vi.fn(),
  },
  renderer: {
    domElement: null as HTMLCanvasElement | null,
    setPixelRatio: vi.fn(),
  },
}));

vi.mock("react-globe.gl", async () => {
  const GlobeMock = forwardRef<unknown, Record<string, unknown>>((props, ref) => {
    runtime.globeProps = props;
    useImperativeHandle(ref, () => runtime.methods);

    useEffect(() => {
      const onGlobeReady = props.onGlobeReady;
      if (typeof onGlobeReady === "function") onGlobeReady();
    }, [props.onGlobeReady]);

    return createElement("canvas", { "data-globe-mock": "true" });
  });

  return { default: GlobeMock };
});

import { Globe3D, type GlobeMarker } from "../src/components/Globe3D";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

describe("ejecucion optimizada del globo", () => {
  let container: HTMLDivElement;
  let root: Root;
  let intersectionCallback: IntersectionCallback;
  let reducedMotion = false;

  beforeEach(() => {
    runtime.methods.controls.mockReturnValue(runtime.controls);
    runtime.methods.renderer.mockReturnValue(runtime.renderer);
    Object.values(runtime.methods).forEach((method) => method.mockClear());
    runtime.controls.update.mockClear();
    runtime.renderer.setPixelRatio.mockClear();
    runtime.controls.enablePan = true;
    runtime.controls.enableZoom = true;
    runtime.controls.autoRotate = false;
    runtime.controls.autoRotateSpeed = 0;
    runtime.renderer.domElement = document.createElement("canvas");
    reducedMotion = false;

    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: query.includes("prefers-reduced-motion") ? reducedMotion : true,
        media: query,
        removeEventListener: vi.fn(),
      })),
    );

    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(
          private readonly callback: (
            entries: Array<{ contentRect: { height: number; width: number } }>,
          ) => void,
        ) {}
        disconnect() {}
        observe() {
          this.callback([{ contentRect: { height: 350, width: 390 } }]);
        }
        unobserve() {}
      },
    );

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionCallback) {
          intersectionCallback = callback;
        }
        disconnect() {}
        observe() {
          intersectionCallback([{ isIntersecting: true }]);
        }
        takeRecords() {
          return [];
        }
        unobserve() {}
        root = null;
        rootMargin = "0px";
        thresholds = [0.01];
      },
    );

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("limita el canvas movil, desactiva zoom y pausa fuera de pantalla", async () => {
    await act(async () => {
      root.render(<Globe3D onSelectCoordinates={vi.fn()} />);
    });

    expect(runtime.controls.enableZoom).toBe(false);
    expect(runtime.controls.enablePan).toBe(false);
    expect(runtime.controls.autoRotate).toBe(true);
    expect(runtime.controls.autoRotateSpeed).toBe(0.45);
    expect(runtime.renderer.setPixelRatio).toHaveBeenCalledWith(1);

    await act(async () => intersectionCallback([{ isIntersecting: false }]));
    expect(runtime.methods.pauseAnimation).toHaveBeenCalled();

    await act(async () => intersectionCallback([{ isIntersecting: true }]));
    expect(runtime.methods.resumeAnimation).toHaveBeenCalled();
  });

  it("elimina animaciones y escapa el tooltip con movimiento reducido", async () => {
    reducedMotion = true;
    const marker: GlobeMarker = {
      id: "unsafe-city",
      label: '<img src=x onerror="alert(1)">',
      lat: 10,
      lng: 20,
    };

    await act(async () => {
      root.render(<Globe3D marker={marker} onSelectCoordinates={vi.fn()} />);
    });

    expect(runtime.methods.pointOfView).toHaveBeenLastCalledWith(
      { altitude: 1.6, lat: 10, lng: 20 },
      0,
    );
    expect(runtime.globeProps.animateIn).toBe(false);
    expect(runtime.globeProps.ringsData).toEqual([]);
    expect(runtime.controls.autoRotate).toBe(false);

    const pointLabel = runtime.globeProps.pointLabel as (point: GlobeMarker) => string;
    expect(pointLabel(marker)).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
  });
});
