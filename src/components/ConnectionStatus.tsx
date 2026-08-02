import type { WeatherDataSource } from "../types/weather";

export type ConnectionState = "connected" | "fallback" | "error" | "loading";

type ConnectionStatusProps = {
  dataSource: WeatherDataSource;
  hasError: boolean;
  isLoading: boolean;
  message: string;
};

// Badge visible que resume el estado tecnico sin saturar la interfaz.
export function ConnectionStatus({
  dataSource,
  hasError,
  isLoading,
  message,
}: ConnectionStatusProps) {
  const state = getConnectionState(dataSource, hasError, isLoading);
  const description = getConnectionDescription(state, message);

  return (
    <section
      aria-label="Estado de conexión meteorológica"
      className={`connection-status connection-${state}`}
      role={state === "error" ? undefined : "status"}
    >
      <span className="connection-dot" aria-hidden="true" />
      <small>{description}</small>
    </section>
  );
}

function getConnectionState(
  dataSource: WeatherDataSource,
  hasError: boolean,
  isLoading: boolean,
): ConnectionState {
  if (isLoading) return "loading";
  if (hasError) return "error";
  if (dataSource === "mock") return "fallback";

  return "connected";
}

// El titulo repetia "AppWeb Clima" en los 4 estados -- no aportaba
// informacion, solo ocupaba espacio (revision de diseno, 2026-08-01).
function getConnectionDescription(state: ConnectionState, message: string) {
  if (state === "loading") return "Consultando clima en tiempo real...";
  if (state === "fallback") return "Mostrando respaldo local.";
  if (state === "error") return message || "Clima en tiempo real.";

  return "Clima en tiempo real.";
}
