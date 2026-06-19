import type { ConfidenceLevel, WeatherDashboardData } from "../types/weather";

type ComparisonPanelProps = {
  comparison: WeatherDashboardData["comparison"];
  confidence: ConfidenceLevel;
};

// Texto corto para explicar el nivel de confianza calculado.
const confidenceCopy: Record<ConfidenceLevel, string> = {
  alta: "Las fuentes estan muy alineadas.",
  media: "Hay diferencias moderadas que conviene revisar.",
  baja: "Las fuentes muestran diferencias importantes.",
};

// Resume la diferencia entre modelos climaticos.
export function ComparisonPanel({ comparison, confidence }: ComparisonPanelProps) {
  return (
    <section className="panel comparison-panel">
      <div className="section-heading">
        <h2>Comparacion de modelos</h2>
        <span>{comparison.primaryProvider} vs {comparison.secondaryProvider}</span>
      </div>

      {/* El badge comunica rapidamente si las fuentes coinciden o no. */}
      <div className={`confidence-badge confidence-${confidence}`}>
        Precision {confidence}
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
