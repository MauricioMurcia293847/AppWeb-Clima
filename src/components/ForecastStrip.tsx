import type { HourlyForecast } from "../types/weather";

type ForecastStripProps = {
  items: HourlyForecast[];
};

// Muestra el pronostico por horas en formato horizontal escaneable.
export function ForecastStrip({ items }: ForecastStripProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Pronostico por horas</h2>
        <span>Proximas 6 horas</span>
      </div>

      <div className="hourly-list">
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
