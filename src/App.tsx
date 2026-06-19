import { useState } from "react";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { ForecastStrip } from "./components/ForecastStrip";
import { MetricCard } from "./components/MetricCard";
import { SavedLocations } from "./components/SavedLocations";
import { SearchPanel } from "./components/SearchPanel";
import { WorldClimateMap } from "./components/WorldClimateMap";
import { availableCities, defaultCity, weatherMockByCity } from "./data/weatherMock";
import {
  addRecentLocation,
  getFavoriteLocations,
  getRecentLocations,
  toggleFavoriteLocation,
} from "./services/locationStorage";
import {
  getWeatherByCity,
  getWeatherByCoordinates,
} from "./services/weatherService";

// App concentra el dashboard principal del MVP.
function App() {
  // Estado principal con el clima que se muestra en el dashboard.
  const [weather, setWeather] = useState(weatherMockByCity["ciudad juarez"]);

  // Recientes y favoritos se hidratan una vez desde localStorage.
  const [recentLocations, setRecentLocations] = useState(getRecentLocations);
  const [favoriteLocations, setFavoriteLocations] = useState(
    getFavoriteLocations,
  );

  // Texto escrito por el usuario dentro del buscador.
  const [query, setQuery] = useState(defaultCity);

  // Indica si estamos simulando una peticion al servicio de clima.
  const [isLoading, setIsLoading] = useState(false);

  // Indica si estamos solicitando permiso de ubicacion al navegador.
  const [isLocating, setIsLocating] = useState(false);

  // Mensaje visible cuando el usuario debe saber que esta viendo un respaldo.
  const [errorMessage, setErrorMessage] = useState("");

  // La portada usa una atmosfera visual segun lluvia, nubes o cielo despejado.
  const weatherMood =
    weather.precipitation > 25
      ? "rain"
      : weather.condition.toLowerCase().includes("nublado")
        ? "cloud"
        : "clear";

  // Ejecuta la busqueda y actualiza el dashboard cuando encuentra datos.
  async function searchCity(city = query) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextWeather = await getWeatherByCity(city);
      setWeather(nextWeather);
      setQuery(nextWeather.location);
      setRecentLocations(addRecentLocation(nextWeather.location));
      if (nextWeather.dataSource === "mock") {
        setErrorMessage("API local no disponible. Mostrando respaldo local.");
      } else {
        setErrorMessage("");
      }
    } catch (error) {
      // El mensaje se mantiene amigable aunque internamente exista un Error.
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No pudimos cargar el clima de esa ciudad.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Pide permiso al navegador y usa coordenadas reales para consultar el backend.
  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setErrorMessage("Tu navegador no soporta geolocalizacion.");
      return;
    }

    setIsLocating(true);
    setIsLoading(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void loadWeatherFromCoordinates(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      () => {
        setIsLocating(false);
        setIsLoading(false);
        setErrorMessage(
          "No pudimos acceder a tu ubicacion. Puedes buscar una ciudad manualmente.",
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5 * 60 * 1000,
        timeout: 10000,
      },
    );
  }

  async function loadWeatherFromCoordinates(latitude: number, longitude: number) {
    try {
      const nextWeather = await getWeatherByCoordinates(latitude, longitude);
      setWeather(nextWeather);
      setQuery(nextWeather.location);
      setRecentLocations(addRecentLocation(nextWeather.location));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No pudimos cargar el clima de tu ubicacion.",
      );
    } finally {
      setIsLocating(false);
      setIsLoading(false);
    }
  }

  function toggleCurrentFavorite() {
    setFavoriteLocations(toggleFavoriteLocation(weather.location));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">AppWeb Clima</span>
          <h1>Clima visual, simple y en tiempo real</h1>
        </div>

        {/* Boton preparado para una futura accion de geolocalizacion. */}
        <button
          className="location-button"
          disabled={isLocating}
          onClick={useCurrentLocation}
          type="button"
        >
          {isLocating ? "Ubicando..." : "Usar mi ubicacion"}
        </button>
      </header>

      <SearchPanel
        availableCities={availableCities}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onQueryChange={setQuery}
        onSelectCity={(city) => void searchCity(city)}
        onSubmit={() => void searchCity()}
        query={query}
      />

      <ConnectionStatus
        dataSource={weather.dataSource}
        isLoading={isLoading || isLocating}
        message={errorMessage}
      />

      <SavedLocations
        currentLocation={weather.location}
        favorites={favoriteLocations}
        isLoading={isLoading || isLocating}
        onSelectLocation={(city) => void searchCity(city)}
        onToggleFavorite={toggleCurrentFavorite}
        recentLocations={recentLocations}
      />

      <section className="hero-grid">
        <article className={`current-weather panel weather-${weatherMood}`}>
          <div className="section-heading">
            <div>
              <h2>{weather.location}</h2>
              <span>{weather.country}</span>
            </div>
            <span>
              Actualizado {weather.updatedAt} -{" "}
              {weather.dataSource === "backend" ? "API local" : "Respaldo local"}
            </span>
          </div>

          <div className="weather-visual" aria-hidden="true">
            {/* Elementos decorativos CSS que dan identidad visual sin imagenes externas. */}
            <span className="sun-disc" />
            <span className="cloud cloud-a" />
            <span className="cloud cloud-b" />
            <span className="rain-line rain-a" />
            <span className="rain-line rain-b" />
          </div>

          <div className="temperature-row">
            {/* Temperatura principal del lugar seleccionado. */}
            <strong>{weather.temperature}&deg;C</strong>
            <div>
              <span>{weather.condition}</span>
              <small>Sensacion de {weather.apparentTemperature}&deg;C</small>
            </div>
          </div>
        </article>

        <ComparisonPanel
          comparison={weather.comparison}
          confidence={weather.confidence}
        />
      </section>

      <section className="metrics-grid" aria-label="Indicadores climaticos">
        <MetricCard label="Humedad" value={`${weather.humidity}%`} detail="Ambiente seco" />
        <MetricCard label="Viento" value={`${weather.windSpeed} km/h`} detail="Brisa moderada" />
        <MetricCard label="Precipitacion" value={`${weather.precipitation}%`} detail="Probabilidad baja" />
      </section>

      <ForecastStrip items={weather.hourly} />

      <section className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Pronostico semanal</h2>
            <span>Resumen diario</span>
          </div>

          <div className="daily-list">
            {weather.daily.map((day) => (
              <article key={day.day}>
                {/* Nombre corto del dia para ahorrar espacio en movil. */}
                <span>{day.day}</span>

                {/* Condicion general del dia. */}
                <strong>{day.condition}</strong>

                {/* Rango de temperatura minima y maxima. */}
                <small>{day.min}&deg;C / {day.max}&deg;C</small>
              </article>
            ))}
          </div>
        </section>

        <WorldClimateMap markers={weather.markers} />
      </section>
    </main>
  );
}

export default App;
