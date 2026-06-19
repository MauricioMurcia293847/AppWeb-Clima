const recentLocationsKey = "appweb-clima:recent-locations";
const favoriteLocationsKey = "appweb-clima:favorite-locations";
const maxRecentLocations = 6;

// Lee una lista persistida en localStorage de forma segura.
function readList(key: string) {
  try {
    const value = window.localStorage.getItem(key);
    const parsedValue = value ? JSON.parse(value) : [];

    return Array.isArray(parsedValue) ? parsedValue.filter(isString) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function normalizeLocation(location: string) {
  return location.trim();
}

function dedupeLocations(locations: string[]) {
  const seen = new Set<string>();

  return locations.filter((location) => {
    const normalized = location.toLowerCase();

    if (seen.has(normalized)) return false;

    seen.add(normalized);
    return true;
  });
}

export function getRecentLocations() {
  return readList(recentLocationsKey);
}

export function addRecentLocation(location: string) {
  const nextLocation = normalizeLocation(location);

  if (!nextLocation) return getRecentLocations();

  const nextLocations = dedupeLocations([
    nextLocation,
    ...getRecentLocations(),
  ]).slice(0, maxRecentLocations);

  writeList(recentLocationsKey, nextLocations);
  return nextLocations;
}

export function getFavoriteLocations() {
  return readList(favoriteLocationsKey);
}

export function toggleFavoriteLocation(location: string) {
  const nextLocation = normalizeLocation(location);

  if (!nextLocation) return getFavoriteLocations();

  const favorites = getFavoriteLocations();
  const exists = favorites.some(
    (favorite) => favorite.toLowerCase() === nextLocation.toLowerCase(),
  );
  const nextFavorites = exists
    ? favorites.filter(
        (favorite) => favorite.toLowerCase() !== nextLocation.toLowerCase(),
      )
    : dedupeLocations([nextLocation, ...favorites]);

  writeList(favoriteLocationsKey, nextFavorites);
  return nextFavorites;
}
