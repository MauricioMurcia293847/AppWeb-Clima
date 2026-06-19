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
          {isFavorite ? "Guardada" : "Guardar favorito"}
        </button>
      </div>

      <LocationGroup
        emptyText="Aun no hay favoritos."
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
  return (
    <div className="saved-location-group">
      <span>{label}</span>

      {items.length > 0 ? (
        <div className="saved-location-list">
          {items.map((location) => (
            <button
              disabled={isLoading}
              key={location}
              onClick={() => onSelectLocation(location)}
              type="button"
            >
              {location}
            </button>
          ))}
        </div>
      ) : (
        <small>{emptyText}</small>
      )}
    </div>
  );
}
