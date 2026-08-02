import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from "lucide-react";

// El estado del clima se traduce a iconos Lucide para cubrir mas condiciones
// sin mezclar estilos de dibujo entre el hero y los pronosticos.

type WeatherIconProps = {
  condition: string;
  className?: string;
};

type IconKey =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

// Mapea el texto de condicion (espanol, viene del backend/mock) al icono. Si
// no reconoce el texto, cae a "partly-cloudy" -- nunca deja el icono vacio,
// pero tampoco inventa una condicion mas especifica de la que sabemos.
function resolveIconKey(condition: string): IconKey {
  const text = condition
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (text.includes("tormenta")) return "storm";
  if (text.includes("nieve")) return "snow";
  if (text.includes("lluvia")) return "rain";
  if (text.includes("llovizna")) return "drizzle";
  if (text.includes("niebla")) return "fog";
  if (text.includes("nublado") && !text.includes("parcial")) return "cloudy";
  if (text.includes("parcial") || text.includes("nube")) return "partly-cloudy";
  if (text.includes("despejado") || text.includes("soleado")) return "clear";

  return "partly-cloudy";
}

export function WeatherIcon({ condition, className }: WeatherIconProps) {
  const key = resolveIconKey(condition);
  const Icon = iconByCondition[key];

  return (
    <Icon
      aria-hidden="true"
      className={className ? `weather-icon ${className}` : "weather-icon"}
      strokeWidth={1.35}
    />
  );
}

const iconByCondition: Record<IconKey, LucideIcon> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};
