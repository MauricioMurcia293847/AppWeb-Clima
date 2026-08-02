import type { HourlyForecast } from "../types/weather";
import { MiniIcon } from "./MiniIcon";

type ForecastStripProps = {
  items: HourlyForecast[];
};

// Muestra el pronostico por horas en formato horizontal escaneable.
export function ForecastStrip({ items }: ForecastStripProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>
          <MiniIcon name="insight" />
          Próximas horas
        </h2>
        <span>Próximas 6 horas</span>
      </div>

      {/* El carrusel recibe foco para que teclado y lectores de pantalla puedan
          recorrer el mismo contenido que se desplaza con gesto en movil. */}
      <div
        aria-label="Pronóstico de las próximas seis horas"
        className="hourly-list"
        role="region"
        tabIndex={0}
      >
        {items.map((item) => (
          <article className="hourly-item" key={item.time}>
            {/* Hora estimada del pronostico. */}
            <span>{item.time}</span>

            {/* Temperatura proyectada para esa hora. */}
            <strong>{item.temperature}&deg;C</strong>

            {/* Probabilidad de lluvia, util para decisiones rapidas. */}
            <small>{item.rainChance}% lluvia</small>
          </article>
        ))}
      </div>
    </section>
  );
}
