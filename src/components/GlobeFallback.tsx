import type { CSSProperties } from "react";
import type { GlobeMarker } from "./Globe3D";

type GlobeFallbackProps = {
  marker?: GlobeMarker | null;
  reason?: "loading" | "unsupported" | "error";
  reduceMotion?: boolean;
};

const fallbackCopy = {
  error: "El globo 3D no pudo iniciarse. Se muestra el modo mundial compatible.",
  loading: "Preparando el explorador mundial.",
  unsupported: "Tu dispositivo usa el modo mundial compatible. Puedes buscar cualquier ciudad abajo.",
};

// La textura local mantiene la identidad visual incluso cuando WebGL falla.
export function GlobeFallback({
  marker,
  reason = "loading",
  reduceMotion = false,
}: GlobeFallbackProps) {
  const focusX = marker ? ((marker.lng + 180) / 360) * 100 : 50;
  const earthStyle = {
    "--fallback-focus-x": `${focusX}%`,
  } as CSSProperties;

  return (
    <div
      aria-label={fallbackCopy[reason]}
      className={`globe-shell globe-fallback globe-fallback-${reason}${
        !reduceMotion && reason !== "loading" ? " globe-fallback-animated" : ""
      }`}
      role="img"
    >
      {reason === "loading" ? (
        <div aria-hidden="true" className="globe-skeleton" />
      ) : (
        <div
          aria-hidden="true"
          className={`globe-fallback-earth${marker ? " is-focused" : ""}`}
          style={earthStyle}
        >
          <img alt="" src="/globe/earth-dark.jpg" />
          {marker ? (
            <span className="globe-fallback-marker" title={marker.label} />
          ) : null}
        </div>
      )}
      {reason !== "loading" ? (
        <p className="globe-fallback-note">
          {reduceMotion ? "Movimiento reducido" : "Modo compatible animado"}
        </p>
      ) : null}
    </div>
  );
}
