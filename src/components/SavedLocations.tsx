type SavedLocationsProps = {
  currentLocation: string;
  favorites: string[];
  isLoading: boolean;
  recentLocations: string[];
  onSelectLocation: (location: string) => void;
  onToggleFavorite: (location: string) => void;
};

// Panel de persistencia local: recientes y favoritos viven en localStorage.
export function SavedLocations({
  currentLocation,
  favorites,
  isLoading,
  recentLocations,
  onSelectLocation,
  onToggleFavorite,
}: SavedLocationsProps) {
  const isFavorite = favorites.some(
    (favorite) => favorite.toLowerCase() === currentLocation.toLowerCase(),
  );

  return (
    <section className="panel saved-locations-panel">
      <div className="section-heading">
        <h2>Mis ciudades</h2>
        <button
          className={isFavorite ? "favorite-action is-active" : "favorite-action"}
          disabled={isLoading}
          onClick={() => onToggleFavorite(currentLocation)}
          type="button"
        >
          <MiniIcon name="heart" />
          {isFavorite ? "Guardada" : "Guardar favorito"}
        </button>
      </div>

      <LocationGroup
        emptyText="Aún no hay favoritos."
        isLoading={isLoading}
        items={favorites}
        label="Favoritos"
        onSelectLocation={onSelectLocation}
      />

      <LocationGroup
        emptyText="Busca una ciudad para crear recientes."
        isLoading={isLoading}
        items={recentLocations}
        label="Recientes"
        onSelectLocation={onSelectLocation}
      />
    </section>
  );
}

type LocationGroupProps = {
  emptyText: string;
  isLoading: boolean;
  items: string[];
  label: string;
  onSelectLocation: (location: string) => void;
};

function LocationGroup({
  emptyText,
  isLoading,
  items,
  label,
  onSelectLocation,
}: LocationGroupProps) {
  const headingId = `saved-locations-${label.toLowerCase()}`;

  return (
    <section aria-labelledby={headingId} className="saved-location-group">
      <h3 id={headingId}>{label}</h3>

      {items.length > 0 ? (
        <ul className="saved-location-list">
          {items.map((location) => (
            <li key={location}>
              <button
                disabled={isLoading}
                onClick={() => onSelectLocation(location)}
                type="button"
              >
                {location}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <small>{emptyText}</small>
      )}
    </section>
  );
}
import { MiniIcon } from "./MiniIcon";
