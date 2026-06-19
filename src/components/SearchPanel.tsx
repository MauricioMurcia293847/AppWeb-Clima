import type { FormEvent } from "react";

type SearchPanelProps = {
  availableCities: string[];
  errorMessage: string;
  isLoading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
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
  onSubmit,
  onSelectCity,
}: SearchPanelProps) {
  // Evita que el formulario recargue la pagina al presionar Enter.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section className="panel search-panel">
      <div className="section-heading">
        <h2>Buscar ciudad</h2>
        <span>Open-Meteo</span>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        {/* Campo controlado: React mantiene el valor actual en estado. */}
        <input
          aria-label="Ciudad"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ej. Madrid, Tokio"
          type="search"
          value={query}
        />

        {/* El texto cambia durante la carga para comunicar el estado. */}
        <button disabled={isLoading} type="submit">
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {errorMessage ? (
        <p className="form-error" role="status">
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
    </section>
  );
}
