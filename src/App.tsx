import { useEffect, useState } from "react";
import { AiSummaryCard } from "./components/AiSummaryCard";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { ForecastStrip } from "./components/ForecastStrip";
import type { GlobeCoordinates, GlobeMarker } from "./components/Globe3D";
import { GlobeExperience } from "./components/GlobeExperience";
import { LegalFooter } from "./components/LegalFooter";
import { MetricCard } from "./components/MetricCard";
import { MiniIcon } from "./components/MiniIcon";
import { SavedLocations } from "./components/SavedLocations";
import { SearchPanel } from "./components/SearchPanel";
import { WeatherIcon } from "./components/WeatherIcon";
import { availableCities, defaultCity, weatherMockByCity } from "./data/weatherMock";
import { clearAppLocalData } from "./services/appStorage";
import {
  getWeatherSummaryByCity,
  getWeatherSummaryByCoordinates,
} from "./services/aiSummaryService";
import {
  addRecentLocation,
  getFavoriteLocations,
  getRecentLocations,
  toggleFavoriteLocation,
} from "./services/locationStorage";
import {
  getReduceMotionPreference,
  saveReduceMotionPreference,
} from "./services/motionPreference";
import {
  getWeatherByCity,
  getWeatherByCoordinates,
} from "./services/weatherService";
import type { WeatherDashboardData, WeatherSummary } from "./types/weather";

// El backend expone markers=[selectedMarker] SOLO cuando la respuesta viene de
// el (dataSource "backend"). El respaldo mock reutiliza el mismo campo para
// una lista de ciudades destacadas sin relacion con la busqueda -- por eso no
// podemos confiar en weather.markers[0] cuando estamos en modo mock, o el pin
// del globo terminaria apuntando a un lugar equivocado.
// Estos "detail" eran texto fijo en el JSX (revision de diseno, 2026-08-01):
// "Ambiente seco", "Brisa moderada" y "Probabilidad baja" se mostraban
// siempre, sin importar el dato real -- con 90% de humedad seguia diciendo
// "seco". Ahora se derivan del valor real.
function describeHumidity(humidity: number): string {
  if (humidity < 30) return "Ambiente seco";
  if (humidity < 60) return "Ambiente confortable";
  return "Ambiente humedo";
}

function describeWind(windSpeed: number): string {
  if (windSpeed < 10) return "Brisa suave";
  if (windSpeed < 25) return "Brisa moderada";
  return "Viento fuerte";
}

function describePrecipitation(precipitation: number): string {
  if (precipitation < 20) return "Probabilidad baja";
  if (precipitation < 60) return "Probabilidad moderada";
  return "Probabilidad alta";
}

function markerFromWeather(weather: WeatherDashboardData): GlobeMarker | null {
  if (weather.dataSource !== "backend") return null;

  const location = weather.markers[0];
  if (!location) return null;

  return {
    id: "current-location",
    label: weather.location,
    lat: location.latitude,
    lng: location.longitude,
  };
}

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

  // Distingue una respuesta mock util de un error real. Antes ambos casos se
  // inferian solo desde dataSource y eso ocultaba fallos de geolocalizacion.
  const [isFallbackNotice, setIsFallbackNotice] = useState(false);

  // Antes, "Mostrando respaldo local" aparecia apenas se abria la app --
  // el estado inicial YA es un mock (Ciudad Juarez de muestra), asi que
  // ConnectionStatus lo leia como si un intento real hubiera fallado. Con
  // esto se distingue "todavia no hiciste nada" de "lo intentamos y fallo"
  // (revision de diseno, 2026-08-01, pedido explicito de Mauricio).
  const [hasInteracted, setHasInteracted] = useState(false);

  // Marcador activo del globo. Se setea de forma optimista en clic/geolocalizacion
  // (ya tenemos coordenadas reales antes de llamar al backend) y se deriva de la
  // respuesta cuando la entrada fue por texto (ver markerFromWeather arriba).
  const [activeMarker, setActiveMarker] = useState<GlobeMarker | null>(null);

  function handleGlobeSelect(coordinates: GlobeCoordinates) {
    setActiveMarker({
      id: "clicked-point",
      label: "Ubicación seleccionada",
      ...coordinates,
    });
    void loadWeatherFromCoordinates(coordinates.lat, coordinates.lng);
  }

  // Resumen IA (M2): estado propio, separado de isLoading a proposito -- el
  // resto de la UI ya debe ser interactiva mientras esto todavia carga.
  const [aiSummary, setAiSummary] = useState<WeatherSummary | null>(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);

  // Preferencia manual adicional a prefers-reduced-motion del sistema.
  const [reduceMotion, setReduceMotion] = useState(getReduceMotionPreference);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
    saveReduceMotionPreference(reduceMotion);
  }, [reduceMotion]);

  // No se espera (no await en el llamador): corre en paralelo al fetch de
  // clima, no lo bloquea. Nunca lanza -- aiSummaryService ya maneja fallas.
  async function loadAiSummaryForCity(city: string) {
    setIsAiSummaryLoading(true);
    const summary = await getWeatherSummaryByCity(city);
    setAiSummary(summary);
    setIsAiSummaryLoading(false);
  }

  async function loadAiSummaryForCoordinates(latitude: number, longitude: number) {
    setIsAiSummaryLoading(true);
    const summary = await getWeatherSummaryByCoordinates(latitude, longitude);
    setAiSummary(summary);
    setIsAiSummaryLoading(false);
  }

  // La portada usa una atmosfera visual segun lluvia, nubes o cielo despejado.
  const weatherMood =
    weather.precipitation > 25
      ? "rain"
      : weather.condition.toLowerCase().includes("nublado")
        ? "cloud"
        : "clear";

  // El respaldo es un estado de disponibilidad, no un error del formulario.
  // Solo los fallos que impiden mostrar una respuesta aparecen junto al campo.
  const searchErrorMessage =
    errorMessage && !isFallbackNotice ? errorMessage : "";

  // La cabecera nunca afirma que hay datos en vivo antes de una consulta real.
  const liveStatus = !hasInteracted
    ? "Vista inicial"
    : errorMessage && !isFallbackNotice
      ? "Error de consulta"
      : weather.dataSource === "backend"
      ? "Datos en vivo"
      : "Respaldo local";

  // Ejecuta la busqueda y actualiza el dashboard cuando encuentra datos.
  async function searchCity(city = query) {
    setIsLoading(true);
    setErrorMessage("");
    setIsFallbackNotice(false);
    setHasInteracted(true);

    try {
      const nextWeather = await getWeatherByCity(city);
      setWeather(nextWeather);
      setQuery(nextWeather.location);
      setRecentLocations(addRecentLocation(nextWeather.location));
      // Solo movemos el pin del globo si el backend confirmo coordenadas reales;
      // en respaldo mock no hay relacion entre la ciudad buscada y sus markers.
      setActiveMarker(markerFromWeather(nextWeather));
      if (nextWeather.dataSource === "mock") {
        setErrorMessage("API local no disponible. Mostrando respaldo local.");
        setIsFallbackNotice(true);
        // Sin backend real no hay nada honesto que resumir -- se oculta el
        // bloque en vez de generar un resumen de datos que ya sabemos falsos.
        setAiSummary(null);
      } else {
        setErrorMessage("");
        setIsFallbackNotice(false);
        void loadAiSummaryForCity(nextWeather.location);
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
    setHasInteracted(true);
    setIsFallbackNotice(false);

    if (!("geolocation" in navigator)) {
      setErrorMessage("Tu navegador no soporta geolocalizacion.");
      return;
    }

    setIsLocating(true);
    setIsLoading(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Coordenadas ya son reales aqui (vienen del navegador), mostramos el
        // pin de inmediato en vez de esperar la respuesta del backend.
        setActiveMarker({
          id: "my-location",
          label: "Mi ubicación",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        void loadWeatherFromCoordinates(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      () => {
        setIsLocating(false);
        setIsLoading(false);
        setErrorMessage(
          "No pudimos acceder a tu ubicación. Puedes buscar una ciudad manualmente.",
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
    setIsLoading(true);
    setHasInteracted(true);
    setIsFallbackNotice(false);

    try {
      const nextWeather = await getWeatherByCoordinates(latitude, longitude);
      setWeather(nextWeather);
      setQuery(nextWeather.location);
      setRecentLocations(addRecentLocation(nextWeather.location));
      // Reemplaza el pin optimista (clic o "mi ubicacion") por el punto que el
      // backend realmente resolvio -- puede diferir unos metros del clic crudo.
      setActiveMarker(markerFromWeather(nextWeather));
      setErrorMessage("");
      // getWeatherByCoordinates nunca cae a mock (lanza si falla), asi que
      // llegar aqui siempre significa datos reales -- se puede resumir.
      void loadAiSummaryForCoordinates(latitude, longitude);
    } catch (error) {
      // El pin optimista se queda donde el usuario hizo clic/geolocalizo; solo
      // avisamos que no pudimos traer el clima de ese punto (flujo ErrorLoc de
      // 03-diseno.md), no lo tratamos como si nunca hubiera pasado nada.
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No encontramos una ubicación ahí. Prueba otro punto o busca por nombre.",
      );
    } finally {
      setIsLocating(false);
      setIsLoading(false);
    }
  }

  function toggleCurrentFavorite() {
    setFavoriteLocations(toggleFavoriteLocation(weather.location));
  }

  function clearLocalData() {
    clearAppLocalData();
    setFavoriteLocations([]);
    setRecentLocations([]);
    setReduceMotion(false);
  }

  return (
    <>
      {/* La atmosfera cambia con datos reales y permanece detras del contenido. */}
      <div aria-hidden="true" className={`app-atmosphere app-atmosphere-${weatherMood}`} />

      <header className="topbar app-frame">
        <a className="brand" href="#inicio">
          <span aria-hidden="true" className="brand-mark" />
          <span>
            <strong>AppWeb</strong>
            <small>Clima</small>
          </span>
        </a>

        <div className="topbar-meta">
          <span className={`live-label live-label-${weather.dataSource}`}>
            <span aria-hidden="true" />
            {liveStatus}
          </span>
          <button
            className="location-button"
            disabled={isLocating}
            onClick={useCurrentLocation}
            type="button"
          >
            <MiniIcon name="locate" />
            {isLocating ? "Ubicando..." : "Mi ubicación"}
          </button>
        </div>
      </header>

      <main id="inicio">
        {/* El hero une clima, globo y busqueda en una sola experiencia. */}
        <section
          aria-label="Clima actual y explorador mundial"
          className={`hero-explore hero-${weatherMood}`}
        >
          <div aria-hidden="true" className="hero-grid" />

          <div className="hero-stage app-frame">
            <div
              aria-busy={isLoading}
              className={`hero-weather${isLoading ? " is-loading" : ""}`}
            >
              <div className="hero-location">
                <MiniIcon name="location" />
                <span>{weather.country}</span>
              </div>
              <h1>{weather.location}</h1>

              <div className="hero-temperature">
                <strong>{weather.temperature}&deg;</strong>
                <WeatherIcon condition={weather.condition} />
              </div>

              <p>{weather.condition}</p>
              <span className="feels-like">
                Sensación de {weather.apparentTemperature}&deg;C
              </span>

              <div className="hero-facts" aria-label="Resumen del clima actual">
                <span><MiniIcon name="droplet" />{weather.humidity}% humedad</span>
                <span><MiniIcon name="wind" />{weather.windSpeed} km/h</span>
                <span><MiniIcon name="umbrella" />{weather.precipitation}% lluvia</span>
              </div>

              <small className="hero-updated">
                Actualizado {weather.updatedAt} · {weather.dataSource === "backend" ? "Open-Meteo" : "Vista de ejemplo"}
              </small>
            </div>

            {/* Un anuncio corto reemplaza la region viva que antes leia todo el hero. */}
            <p aria-atomic="true" className="sr-only" role="status">
              {isLoading
                ? "Consultando información meteorológica."
                : `Clima actualizado para ${weather.location}: ${weather.temperature} grados, ${weather.condition}.`}
            </p>

            <div className="hero-globe">
              <div className="globe-heading">
                <span>Explorador global</span>
                <small>
                  {isLoading
                    ? "Buscando ubicación..."
                    : activeMarker
                      ? activeMarker.label
                      : "Vista meteorológica mundial"}
                </small>
              </div>

              <GlobeExperience
                marker={activeMarker}
                onSelectCoordinates={handleGlobeSelect}
                reduceMotion={reduceMotion}
              />
            </div>

            <SearchPanel
              availableCities={availableCities}
              errorMessage={searchErrorMessage}
              isLoading={isLoading}
              onQueryChange={setQuery}
              onSelectCoordinates={handleGlobeSelect}
              onSelectCity={(city) => void searchCity(city)}
              onSubmit={() => void searchCity()}
              query={query}
            />
          </div>
        </section>

        <section className="dashboard-band">
          <div className="app-frame dashboard-content">
            {/* El estado tecnico aparece solo despues de una accion real. */}
            {hasInteracted ? (
              <ConnectionStatus
                dataSource={weather.dataSource}
                hasError={Boolean(errorMessage) && !isFallbackNotice}
                isLoading={isLoading || isLocating}
                message={errorMessage}
              />
            ) : null}

            <section className="metrics-grid" aria-label="Indicadores climáticos">
              <MetricCard detail={describeHumidity(weather.humidity)} icon="droplet" label="Humedad" value={`${weather.humidity}%`} />
              <MetricCard detail={describeWind(weather.windSpeed)} icon="wind" label="Viento" value={`${weather.windSpeed} km/h`} />
              <MetricCard detail={describePrecipitation(weather.precipitation)} icon="umbrella" label="Precipitación" value={`${weather.precipitation}%`} />
            </section>

            <ForecastStrip items={weather.hourly} />

            <section className="forecast-layout">
              <section className="panel daily-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">Panorama</span>
                    <h2>Pronóstico semanal</h2>
                  </div>
                  <span>Resumen diario</span>
                </div>

                <div className="daily-list">
                  {weather.daily.map((day) => (
                    <article key={day.day}>
                      <span>{day.day}</span>
                      <WeatherIcon condition={day.condition} />
                      <strong>{day.condition}</strong>
                      <small>{day.min}&deg; / {day.max}&deg;</small>
                    </article>
                  ))}
                </div>
              </section>

              <div className="insight-stack">
                <ComparisonPanel comparison={weather.comparison} confidence={weather.confidence} />
              </div>
            </section>

            <AiSummaryCard
              isLoading={isAiSummaryLoading}
              key={`${weather.location}-${weather.dataSource}`}
              reduceMotion={reduceMotion}
              summary={aiSummary}
              weather={weather}
            />

            <SavedLocations
              currentLocation={weather.location}
              favorites={favoriteLocations}
              isLoading={isLoading || isLocating}
              onSelectLocation={(city) => void searchCity(city)}
              onToggleFavorite={toggleCurrentFavorite}
              recentLocations={recentLocations}
            />

            <LegalFooter
              onClearLocalData={clearLocalData}
              onReduceMotionChange={setReduceMotion}
              reduceMotion={reduceMotion}
            />
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
