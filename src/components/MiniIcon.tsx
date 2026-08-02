import {
  BrainCircuit,
  Droplets,
  Heart,
  LocateFixed,
  MapPin,
  Scale,
  Search,
  Sparkles,
  Umbrella,
  Wind,
  type LucideIcon,
} from "lucide-react";

// Los iconos utilitarios comparten una sola libreria para conservar el mismo
// grosor de trazo, proporciones y comportamiento accesible en toda la app.

export type MiniIconName =
  | "droplet"
  | "wind"
  | "umbrella"
  | "sparkle"
  | "scale"
  | "location"
  | "locate"
  | "search"
  | "heart"
  | "insight";

type MiniIconProps = {
  name: MiniIconName;
  className?: string;
};

export function MiniIcon({ name, className }: MiniIconProps) {
  const Icon = iconByName[name];

  return (
    <Icon
      aria-hidden="true"
      className={className ? `mini-icon ${className}` : "mini-icon"}
      strokeWidth={1.8}
    />
  );
}

const iconByName: Record<MiniIconName, LucideIcon> = {
  droplet: Droplets,
  wind: Wind,
  umbrella: Umbrella,
  sparkle: Sparkles,
  scale: Scale,
  location: MapPin,
  locate: LocateFixed,
  search: Search,
  heart: Heart,
  insight: BrainCircuit,
};
