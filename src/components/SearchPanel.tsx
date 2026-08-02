import { useState, type FormEvent } from "react";
import type { GlobeCoordinates } from "./Globe3D";
import { MiniIcon } from "./MiniIcon";

type SearchPanelProps = {
  availableCities: string[];
  errorMessage: string;
  isLoading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onSelectCoordinates: (coordinates: GlobeCoordinates) => void;
  onSubmit: () => void;
  onSelectCity: (city: string) => void;
};

// Panel de busqueda principal. La consulta real ocurre en el backend propio.
export function SearchPanel({
  availableCities,
  errorMessage,
  isLoading,
  query,
  onQueryChange,
  onSelectCoordinates,
  onSubmit,
  onSelectCity,
}: SearchPanelProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [coordinateError, setCoordinateError] = useState("");

  // Evita que el formulario recargue la pagina al presionar Enter.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  // El formulario ofrece la misma precision que hacer clic sobre el globo,
  // pero funciona completamente con teclado y tecnologias de asistencia.
  function handleCoordinateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (
      !latitude.trim() ||
      !longitude.trim() ||
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude) ||
      parsedLatitude < -90 ||
      parsedLatitude > 90 ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      setCoordinateError(
        "Ingresa una latitud entre -90 y 90 y una longitud entre -180 y 180.",
      );
      return;
    }

    setCoordinateError("");
    onSelectCoordinates({ lat: parsedLatitude, lng: parsedLongitude });
  }

  return (
    // Vive dentro del hero (junto al globo), ya no es un panel propio -- es
    // el camino accesible equivalente al clic en el globo (03-diseno.md), no
    // una seccion aparte con su propia jerarquia visual.
    <div aria-label="Buscar ciudad" className="search-panel" role="search">
      <div className="search-label">
        <MiniIcon name="search" />
        <span>Descubre el clima de cualquier ciudad</span>
      </div>
      <form className="search-form" onSubmit={handleSubmit}>
        {/* Campo controlado: React mantiene el valor actual en estado. */}
        <input
          aria-describedby={errorMessage ? "city-search-error" : undefined}
          aria-invalid={Boolean(errorMessage)}
          aria-label="Nombre de la ciudad"
          autoComplete="off"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar ciudad o región"
          type="search"
          value={query}
        />

        {/* El texto cambia durante la carga para comunicar el estado. */}
        <button disabled={isLoading} type="submit">
          <MiniIcon name="search" />
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {errorMessage ? (
        <p className="form-error" id="city-search-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="city-suggestions" aria-label="Ciudades disponibles">
        {availableCities.map((city) => (
          <button
            disabled={isLoading}
            key={city}
            onClick={() => onSelectCity(city)}
            type="button"
          >
            {city}
          </button>
        ))}
      </div>

      <details className="coordinate-search">
        <summary>Buscar por coordenadas</summary>
        <form className="coordinate-form" onSubmit={handleCoordinateSubmit}>
          <label>
            <span>Latitud</span>
            <input
              aria-describedby={coordinateError ? "coordinate-error" : undefined}
              aria-invalid={Boolean(coordinateError)}
              inputMode="decimal"
              max="90"
              min="-90"
              onChange={(event) => setLatitude(event.target.value)}
              placeholder="Ej. 19.43"
              step="any"
              type="number"
              value={latitude}
            />
          </label>
          <label>
            <span>Longitud</span>
            <input
              aria-describedby={coordinateError ? "coordinate-error" : undefined}
              aria-invalid={Boolean(coordinateError)}
              inputMode="decimal"
              max="180"
              min="-180"
              onChange={(event) => setLongitude(event.target.value)}
              placeholder="Ej. -99.13"
              step="any"
              type="number"
              value={longitude}
            />
          </label>
          <button disabled={isLoading} type="submit">
            Consultar coordenadas
          </button>
          {coordinateError ? (
            <p className="form-error" id="coordinate-error" role="alert">
              {coordinateError}
            </p>
          ) : null}
        </form>
      </details>
    </div>
  );
}
