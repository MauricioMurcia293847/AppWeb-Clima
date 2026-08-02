import { lazy, Suspense, useEffect, useState } from "react";
import type { GlobeCoordinates, GlobeMarker } from "./Globe3D";
import { GlobeErrorBoundary } from "./GlobeErrorBoundary";
import { GlobeFallback } from "./GlobeFallback";
import { supportsWebGL } from "../utils/webglSupport";

type GlobeExperienceProps = {
  marker?: GlobeMarker | null;
  onSelectCoordinates: (coordinates: GlobeCoordinates) => void;
  reduceMotion?: boolean;
};

// Three.js queda en un chunk diferido y solo se solicita si el navegador pudo
// crear un contexto WebGL durante la comprobacion inicial.
const Globe3D = lazy(() =>
  import("./Globe3D").then((module) => ({ default: module.Globe3D })),
);

type NavigatorWithConnection = Navigator & {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
};

type WindowWithIdleCallback = Window & {
  cancelIdleCallback?: (id: number) => void;
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
};

export function GlobeExperience(props: GlobeExperienceProps) {
  const [webGLSupported] = useState(supportsWebGL);
  const [shouldLoad3D, setShouldLoad3D] = useState(false);
  const [prefersStaticGlobe] = useState(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    return Boolean(
      connection?.saveData ||
        connection?.effectiveType === "slow-2g" ||
        connection?.effectiveType === "2g",
    );
  });

  // El dashboard y su fallback aparecen primero. Three.js se descarga cuando
  // el hilo principal queda libre, evitando competir con el contenido inicial.
  useEffect(() => {
    if (!webGLSupported || prefersStaticGlobe) return;

    const idleWindow = window as WindowWithIdleCallback;
    let idleId: number | undefined;
    const delayId = window.setTimeout(() => {
      if (idleWindow.requestIdleCallback) {
        idleId = idleWindow.requestIdleCallback(() => setShouldLoad3D(true), {
          timeout: 1200,
        });
      } else {
        setShouldLoad3D(true);
      }
    }, 500);

    return () => {
      window.clearTimeout(delayId);
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
    };
  }, [prefersStaticGlobe, webGLSupported]);

  if (!webGLSupported) return <GlobeFallback reason="unsupported" />;
  if (prefersStaticGlobe) return <GlobeFallback reason="reduced-data" />;
  if (!shouldLoad3D) return <GlobeFallback reason="loading" />;

  return (
    <GlobeErrorBoundary>
      <Suspense fallback={<GlobeFallback reason="loading" />}>
        <Globe3D {...props} />
      </Suspense>
    </GlobeErrorBoundary>
  );
}
