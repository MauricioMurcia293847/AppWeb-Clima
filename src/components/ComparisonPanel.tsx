import { MiniIcon } from "./MiniIcon";
import type { ConfidenceLevel, WeatherDashboardData } from "../types/weather";

type ComparisonPanelProps = {
  comparison: WeatherDashboardData["comparison"];
  confidence: ConfidenceLevel;
};

// Texto corto para explicar el nivel de confianza calculado.
const confidenceCopy: Record<ConfidenceLevel, string> = {
  alta: "Los modelos están muy alineados.",
  media: "Hay diferencias moderadas que conviene revisar.",
  baja: "Los modelos muestran diferencias importantes.",
  no_disponible: "No pudimos comparar con un segundo modelo en este momento.",
};

// Etiqueta del badge -- separada del texto tecnico del enum (evita mostrar
// "Precision no_disponible" con guion bajo tal cual en pantalla).
const confidenceLabel: Record<ConfidenceLevel, string> = {
  alta: "Precisión alta",
  media: "Precisión media",
  baja: "Precisión baja",
  no_disponible: "No disponible",
};

// CSS usa guiones, no guion bajo, para ser consistente con .confidence-alta/etc.
const confidenceClassName: Record<ConfidenceLevel, string> = {
  alta: "confidence-alta",
  media: "confidence-media",
  baja: "confidence-baja",
  no_disponible: "confidence-no-disponible",
};

// Resume la diferencia entre modelos climaticos.
export function ComparisonPanel({ comparison, confidence }: ComparisonPanelProps) {
  return (
    <section className="panel comparison-panel">
      <div className="section-heading">
        <h2>
          <MiniIcon name="scale" />
          Comparación de modelos
        </h2>
        {/* Siempre visible, no depende de hover/tap -- un dato de confianza
            no deberia esconderse detras de una interaccion (03-diseno.md). */}
        <span>{comparison.primaryProvider} vs {comparison.secondaryProvider}</span>
      </div>

      <div className={`confidence-badge ${confidenceClassName[confidence]}`}>
        {confidenceLabel[confidence]}
      </div>

      <p>{confidenceCopy[confidence]}</p>

      <div className="comparison-grid">
        <div>
          <span>Temperatura</span>
          <strong>{comparison.temperatureDelta}&deg;C</strong>
        </div>
        <div>
          <span>Humedad</span>
          <strong>{comparison.humidityDelta}%</strong>
        </div>
        <div>
          <span>Viento</span>
          <strong>{comparison.windDelta} km/h</strong>
        </div>
      </div>
    </section>
  );
}
