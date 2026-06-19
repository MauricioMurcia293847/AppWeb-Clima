import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { ClimateMarker } from "../types/weather";

type WorldClimateMapProps = {
  markers: ClimateMarker[];
};

// Mapa mundial interactivo. Leaflet usa las coordenadas reales del backend.
export function WorldClimateMap({ markers }: WorldClimateMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedMarker, ...referenceMarkers] = markers;

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    // Creamos el mapa una sola vez y luego solo actualizamos sus marcadores.
    mapRef.current = L.map(mapElementRef.current, {
      attributionControl: false,
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([20, 0], 1.55);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 10,
      minZoom: 1,
    }).addTo(mapRef.current);

    markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) return;

    markerLayer.clearLayers();

    markers.forEach((marker) => {
      const isSelected = marker.city === selectedMarker?.city;
      const leafletMarker = L.marker([marker.latitude, marker.longitude], {
        icon: createWeatherIcon(isSelected),
        title: marker.city,
      }).bindPopup(
        `<strong>${marker.city}</strong><br>${marker.temperature} C - ${marker.condition}`,
      );

      markerLayer.addLayer(leafletMarker);
    });

    if (selectedMarker) {
      map.setView([selectedMarker.latitude, selectedMarker.longitude], 3, {
        animate: true,
      });
    }
  }, [markers, selectedMarker]);

  return (
    <section className="panel map-panel">
      <div className="section-heading">
        <h2>Mapa mundial</h2>
        <span>Leaflet interactivo</span>
      </div>

      <div
        className="world-map leaflet-world-map"
        ref={mapElementRef}
        aria-label="Mapa mundial interactivo con ubicaciones climaticas"
      />

      {selectedMarker ? (
        <article className="selected-marker">
          <span>Ciudad consultada</span>
          <strong>{selectedMarker.city}</strong>
          <small>
            {selectedMarker.temperature}&deg;C - {selectedMarker.condition}
          </small>
          <small>
            {formatCoordinate(selectedMarker.latitude)} lat /{" "}
            {formatCoordinate(selectedMarker.longitude)} lon
          </small>
        </article>
      ) : null}

      <div className="marker-list">
        {referenceMarkers.slice(0, 4).map((marker) => (
          <article key={marker.city}>
            <span>{marker.city}</span>
            <strong>{marker.temperature}&deg;C</strong>
            <small>{marker.condition}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function createWeatherIcon(isSelected: boolean) {
  return L.divIcon({
    className: isSelected ? "leaflet-weather-icon is-selected" : "leaflet-weather-icon",
    html: "<span></span>",
    iconAnchor: isSelected ? [17, 17] : [12, 12],
    iconSize: isSelected ? [34, 34] : [24, 24],
    popupAnchor: [0, -14],
  });
}

function formatCoordinate(value: number) {
  return value.toFixed(2);
}
