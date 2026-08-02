import { MiniIcon, type MiniIconName } from "./MiniIcon";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: MiniIconName;
};

// Tarjeta pequena para mostrar indicadores climaticos concretos.
export function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <article className="metric-card">
      <MiniIcon className="metric-card-icon" name={icon} />

      {/* label describe el tipo de dato, por ejemplo humedad o viento. */}
      <span>{label}</span>

      {/* value es el dato principal que el usuario debe leer primero. */}
      <strong>{value}</strong>

      {/* detail agrega contexto sin cargar demasiado la tarjeta. */}
      <small>{detail}</small>
    </article>
  );
}
