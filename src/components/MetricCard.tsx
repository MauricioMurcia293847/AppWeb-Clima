type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

// Tarjeta pequena para mostrar indicadores climaticos concretos.
export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="metric-card">
      {/* label describe el tipo de dato, por ejemplo humedad o viento. */}
      <span>{label}</span>

      {/* value es el dato principal que el usuario debe leer primero. */}
      <strong>{value}</strong>

      {/* detail agrega contexto sin cargar demasiado la tarjeta. */}
      <small>{detail}</small>
    </article>
  );
}
