import { useCallback, useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { escapeHtml } from "../utils/escapeHtml";

// Coordenadas puras, sin geocodificar todavia. Eso lo hace quien use el componente.
export type GlobeCoordinates = {
  lat: number;
  lng: number;
};

export type GlobeMarker = GlobeCoordinates & {
  id: string;
  label: string;
};

type Globe3DProps = {
  marker?: GlobeMarker | null;
  onSelectCoordinates: (coordinates: GlobeCoordinates) => void;
  reduceMotion?: boolean;
};

// Textura autoalojada (no CDN externo) para no depender de un tercero en cada carga.
// Viene de three-globe (MIT), version oscura porque asi lo definio 03-diseno.md
// para la seccion hero de fondo oscuro.
const GLOBE_TEXTURE_URL = "/globe/earth-dark.jpg";

export function Globe3D({
  marker,
  onSelectCoordinates,
  reduceMotion = false,
}: Globe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState(false);
  const prefersReducedMotion = reduceMotion || systemPrefersReducedMotion;
  const isIntersectingRef = useRef(true);
  const isPageVisibleRef = useRef(!document.hidden);
  const removeWheelGuardRef = useRef<(() => void) | null>(null);

  const syncAnimationState = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    if (isIntersectingRef.current && isPageVisibleRef.current) {
      globe.resumeAnimation();
    } else {
      globe.pauseAnimation();
    }
  }, []);

  // La preferencia del sistema tambien controla la entrada de Three.js; CSS
  // no puede detener por si solo una animacion ejecutada dentro del canvas.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setSystemPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  // La rotacion es ambiental y lenta. Se desactiva de inmediato cuando la
  // preferencia manual o la del sistema solicita reducir movimiento.
  useEffect(() => {
    if (!isGlobeReady) return;

    const controls = globeRef.current?.controls();
    if (!controls) return;

    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.45;
    controls.update();
  }, [isGlobeReady, prefersReducedMotion]);

  // Three.js deja de dibujar cuando el globo sale del viewport o la pestana se
  // oculta. Esto reduce uso de GPU y bateria sin alterar su estado visual.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry?.isIntersecting ?? false;
        syncAnimationState();
      },
      { threshold: 0.01 },
    );
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
      syncAnimationState();
    };

    observer.observe(node);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncAnimationState]);

  useEffect(
    () => () => {
      removeWheelGuardRef.current?.();
    },
    [],
  );

  // react-globe.gl pide ancho/alto en pixeles explicitos, no es responsive solo.
  // Lo sincronizamos con el tamano real del contenedor para que funcione en
  // cualquier viewport sin hardcodear breakpoints aqui.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Cuando llega un marcador nuevo (ej. resultado de busqueda por texto),
  // centramos la camara ahi con una animacion suave en vez de saltar de golpe.
  useEffect(() => {
    if (!marker || !globeRef.current) return;

    globeRef.current.pointOfView(
      { lat: marker.lat, lng: marker.lng, altitude: 1.6 },
      prefersReducedMotion ? 0 : 1000,
    );
  }, [isGlobeReady, marker, prefersReducedMotion]);

  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.update();

    // Un pixel ratio de 1 evita cuadruplicar el trabajo del canvas en moviles.
    const isMobile = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    const renderer = globe.renderer();
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

    // OrbitControls registra wheel sobre el canvas y cancela el scroll aun sin
    // zoom. Capturamos la rueda antes y trasladamos su delta a la pagina.
    const canvas = renderer.domElement;
    const releaseWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.scrollBy({ left: event.deltaX, top: event.deltaY });
    };
    canvas.addEventListener("wheel", releaseWheel, { capture: true, passive: false });
    removeWheelGuardRef.current?.();
    removeWheelGuardRef.current = () =>
      canvas.removeEventListener("wheel", releaseWheel, { capture: true });

    setIsGlobeReady(true);
    syncAnimationState();
  }, [syncAnimationState]);

  return (
    <div
      aria-describedby="globe-accessibility-note"
      aria-label="Globo tridimensional con selección de ubicaciones"
      className="globe-shell"
      ref={containerRef}
      role="img"
    >
      <span className="sr-only" id="globe-accessibility-note">
        Representación interactiva del mundo. El buscador que aparece después
        permite consultar una ciudad o introducir coordenadas exactas usando el teclado.
      </span>
      {!isGlobeReady && <div aria-hidden="true" className="globe-skeleton" />}

      {size.width > 0 && size.height > 0 && (
        <Globe
          animateIn={!prefersReducedMotion}
          atmosphereAltitude={0.18}
          atmosphereColor="#39c4d6"
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={GLOBE_TEXTURE_URL}
          height={size.height}
          onGlobeClick={(coordinates) => onSelectCoordinates(coordinates)}
          onGlobeReady={handleGlobeReady}
          pointAltitude={0.01}
          pointColor={() => "#5fd0ff"}
          pointLabel={(point) => escapeHtml((point as GlobeMarker).label)}
          pointLat="lat"
          pointLng="lng"
          // Radio generoso a proposito: en pantallas chicas exigir precision de
          // pixel sobre un marcador viola la ley de Fitts (03-diseno.md).
          pointRadius={0.45}
          pointsData={marker ? [marker] : []}
          ref={globeRef}
          ringColor={() => ["rgba(57,196,214,0.9)", "rgba(57,196,214,0)"]}
          ringMaxRadius={3.2}
          ringPropagationSpeed={2}
          ringRepeatPeriod={900}
          ringsData={!prefersReducedMotion && marker ? [marker] : []}
          showGraticules
          width={size.width}
        />
      )}
    </div>
  );
}
