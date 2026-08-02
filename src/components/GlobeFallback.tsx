type GlobeFallbackProps = {
  reason?: "loading" | "unsupported" | "error" | "reduced-data";
};

const fallbackCopy = {
  error: "El globo interactivo no pudo iniciarse. Puedes buscar cualquier ciudad abajo.",
  loading: "Preparando el explorador mundial.",
  "reduced-data": "El ahorro de datos muestra una vista estática del mundo.",
  unsupported: "Tu dispositivo muestra una vista estática del mundo. Puedes buscar cualquier ciudad abajo.",
};

// La textura local mantiene la identidad visual incluso cuando WebGL falla.
export function GlobeFallback({ reason = "loading" }: GlobeFallbackProps) {
  return (
    <div
      aria-label={fallbackCopy[reason]}
      className={`globe-shell globe-fallback globe-fallback-${reason}`}
      role="img"
    >
      {reason === "loading" ? (
        <div aria-hidden="true" className="globe-skeleton" />
      ) : (
        <div aria-hidden="true" className="globe-fallback-earth">
          <img alt="" src="/globe/earth-dark.jpg" />
        </div>
      )}
      {reason !== "loading" ? (
        <p className="globe-fallback-note">Vista mundial estática</p>
      ) : null}
    </div>
  );
}
