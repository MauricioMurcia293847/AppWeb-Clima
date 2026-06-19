import type { WeatherDataSource } from "../types/weather";

export type ConnectionState = "connected" | "fallback" | "error" | "loading";

type ConnectionStatusProps = {
  dataSource: WeatherDataSource;
  isLoading: boolean;
  message: string;
};

// Badge visible que resume el estado tecnico sin saturar la interfaz.
export function ConnectionStatus({
  dataSource,
  isLoading,
  message,
}: ConnectionStatusProps) {
  const state = getConnectionState(dataSource, isLoading, message);
  const copy = getConnectionCopy(state, message);

  return (
    <section className={`connection-status connection-${state}`}>
      <span className="connection-dot" aria-hidden="true" />
      <div>
        <strong>{copy.title}</strong>
        <small>{copy.description}</small>
      </div>
    </section>
  );
}

function getConnectionState(
  dataSource: WeatherDataSource,
  isLoading: boolean,
  message: string,
): ConnectionState {
  if (isLoading) return "loading";
  if (message && dataSource !== "mock") return "error";
  if (dataSource === "mock") return "fallback";

  return "connected";
}

function getConnectionCopy(state: ConnectionState, message: string) {
  if (state === "loading") {
    return {
      title: "AppWeb Clima",
      description: "Consultando clima visual en tiempo real.",
    };
  }

  if (state === "fallback") {
    return {
      title: "AppWeb Clima",
      description: "Clima visual en tiempo real.",
    };
  }

  if (state === "error") {
    return {
      title: "AppWeb Clima",
      description: message || "Clima visual en tiempo real.",
    };
  }

  return {
    title: "AppWeb Clima",
    description: "Clima visual en tiempo real.",
  };
}
